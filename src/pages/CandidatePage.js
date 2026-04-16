import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AppContext } from '../App';
import { updateCandidate, submitQcmAnswer, submitOpenAnswer, logInfraction, updateBatch } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { QCM_QUESTIONS, OPEN_QUESTIONS } from '../data/questions';

const EXAM_DURATION = 60 * 60; // 60 minutes in seconds

export default function CandidatePage() {
  const { candidateSession, handleLogout } = useContext(AppContext);
  const { candidate, batch, session, qcmQuestions, openQuestions } = candidateSession;
  const [examStatus, setExamStatus] = useState(candidate.status); // waiting | exam | finished
  const [batchStatus, setBatchStatus] = useState(batch.status);

  // Listen to batch changes (formateur launches exam)
  useEffect(() => {
    const channel = supabase
      .channel(`batch-${batch.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'batches', filter: `id=eq.${batch.id}` },
        (payload) => {
          const updated = payload.new;
          setBatchStatus(updated.status);
          if (updated.status === 'active' && examStatus === 'waiting') {
            setExamStatus('exam');
            updateCandidate(candidate.id, { status: 'exam', exam_started_at: new Date().toISOString() });
          }
        })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [batch.id, candidate.id, examStatus]);

  if (examStatus === 'waiting') return <WaitingRoom candidate={candidate} batch={batch} batchStatus={batchStatus} />;
  if (examStatus === 'exam') return <ExamScreen session={session} candidate={candidate} batch={batch} qcmQuestions={qcmQuestions} openQuestions={openQuestions} onFinish={() => setExamStatus('finished')} />;
  if (examStatus === 'finished') return <FinishedScreen candidate={candidate} />;
  return null;
}

function WaitingRoom({ candidate, batch, batchStatus }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', background: 'var(--yellow)' }} />
      <div className="fade-in" style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--yellow)', marginBottom: '8px' }}>DOLY</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '48px' }}>Évaluation Formation</div>

        <div className="card" style={{ padding: '40px', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
          <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Bonjour, {candidate.first_name} !</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Session : <strong style={{ color: 'var(--text)' }}>{batch.name}</strong></p>

          <div className="card" style={{ background: 'var(--surface2)', marginBottom: '24px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '15px', marginBottom: '16px', color: 'var(--yellow)' }}>📋 Déroulé de l'examen</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <InfoRow icon="⏱" text="Durée totale : 60 minutes (un seul minuteur)" />
              <InfoRow icon="📝" text="20 questions QCM — 1 point chacune" />
              <InfoRow icon="💬" text="10 questions ouvertes — 2 points chacune" />
              <InfoRow icon="🎭" text="Mise en situation — notée après l'examen" />
              <InfoRow icon="🏆" text="Score sur 70 points — seuil de validation : 42/70 (60%)" />
              <InfoRow icon="🔒" text="Plein écran obligatoire — les changements de fenêtre sont enregistrés" />
              <InfoRow icon="⚠️" text="Aucune reprise possible — une seule tentative autorisée" />
            </div>
          </div>

          {batchStatus === 'pending' && (
            <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="pulse">●</span>
              <span>En attente du formateur pour lancer la session…</span>
            </div>
          )}
          {batchStatus === 'active' && (
            <div className="alert alert-success">✓ La session vient d'être lancée — l'examen démarre automatiquement</div>
          )}
          {batchStatus === 'paused' && (
            <div className="alert alert-warn">⏸ Session en pause — le formateur reprendra bientôt</div>
          )}
        </div>

        <p style={{ color: 'var(--text-dim)', fontSize: '12px' }}>
          Ne fermez pas cette fenêtre. Vous serez redirigé(e) automatiquement.
        </p>
      </div>
    </div>
  );
}

function InfoRow({ icon, text }) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
      <span style={{ minWidth: '20px' }}>{icon}</span>
      <span style={{ color: 'var(--text-muted)' }}>{text}</span>
    </div>
  );
}

function ExamScreen({ session, candidate, batch, qcmQuestions, openQuestions, onFinish }) {
  const [phase, setPhase] = useState('qcm'); // qcm | open | done
  const [currentQ, setCurrentQ] = useState(0);
  const [qcmAnswers, setQcmAnswers] = useState({}); // questionId -> [indices]
  const [openAnswers, setOpenAnswers] = useState({}); // questionId -> text
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [infractions, setInfractions] = useState(0);
  const [lastAlert, setLastAlert] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [batchPaused, setBatchPaused] = useState(batch.status === 'paused');
  const timerRef = useRef(null);
  const pausedRef = useRef(batchPaused);
  const startTimeRef = useRef(Date.now());
  const pausedElapsedRef = useRef(0);
  const pauseStartRef = useRef(null);

  // Fullscreen + anti-cheat
  useEffect(() => {
    const enterFullscreen = () => {
      try { document.documentElement.requestFullscreen(); } catch {}
    };
    enterFullscreen();

    const handleVisibility = () => {
      if (document.hidden) { recordInfraction('tab_switch'); }
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) { recordInfraction('fullscreen_exit'); setLastAlert('⚠️ Plein écran désactivé — infraction enregistrée'); }
    };
    const handleBlur = () => { recordInfraction('window_blur'); };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleBlur);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  // Listen to batch pause/resume
  useEffect(() => {
    const channel = supabase
      .channel(`exam-batch-${batch.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'batches', filter: `id=eq.${batch.id}` },
        (payload) => {
          const paused = payload.new.status === 'paused';
          if (paused && !pausedRef.current) {
            // Starting pause - record when pause started
            pauseStartRef.current = Date.now();
          } else if (!paused && pausedRef.current && pauseStartRef.current) {
            // Ending pause - add paused duration to elapsed offset
            pausedElapsedRef.current += Math.floor((Date.now() - pauseStartRef.current) / 1000);
            pauseStartRef.current = null;
          }
          setBatchPaused(paused);
          pausedRef.current = paused;
        })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [batch.id]);

  // Timer - uses wall clock to be throttle-resistant
  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000) - pausedElapsedRef.current;
      const remaining = Math.max(0, EXAM_DURATION - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        handleSubmit(true);
      }
    }, 500);
    return () => clearInterval(timerRef.current);
  }, []);

  const recordInfraction = useCallback(async (type) => {
    setInfractions(n => n + 1);
    try { await logInfraction(session.id, type); } catch {}
  }, [session.id]);

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  const isRed = timeLeft < 600; // < 10 min

  function toggleQcmAnswer(questionId, idx) {
    const q = qcmQuestions.find(q => q.id === questionId);
    setQcmAnswers(prev => {
      const current = prev[questionId] || [];
      if (q.multi) {
        return { ...prev, [questionId]: current.includes(idx) ? current.filter(i => i !== idx) : [...current, idx] };
      } else {
        return { ...prev, [questionId]: [idx] };
      }
    });
  }

  function checkQcmCorrect(question) {
    const given = (qcmAnswers[question.id] || []).sort().join(',');
    const correct = [...question.correct].sort().join(',');
    return given === correct;
  }

  async function handleSubmit(auto = false) {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Save all QCM answers
      for (const q of qcmQuestions) {
        const given = (qcmAnswers[q.id] || []);
        await submitQcmAnswer(session.id, q.id, given.map(i => String(i)), checkQcmCorrect(q));
      }
      // Save all open answers
      for (const q of openQuestions) {
        await submitOpenAnswer(session.id, q.id, openAnswers[q.id] || '');
      }
      await updateCandidate(candidate.id, { status: 'finished', exam_finished_at: new Date().toISOString() });
      onFinish();
    } catch (err) { console.error(err); setSubmitting(false); }
  }

  const progress = phase === 'qcm'
    ? ((currentQ) / (qcmQuestions.length + openQuestions.length)) * 100
    : (((qcmQuestions.length + currentQ)) / (qcmQuestions.length + openQuestions.length)) * 100;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--black)' }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: 'var(--yellow)' }}>DOLY</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {infractions > 0 && (
            <span className="badge badge-red">⚠️ {infractions} infraction{infractions > 1 ? 's' : ''}</span>
          )}
          {batchPaused && <span className="badge badge-orange">⏸ PAUSE</span>}
          <div style={{
            fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700,
            color: isRed ? 'var(--red)' : 'var(--text)',
            transition: 'color 0.3s'
          }}>
            {formatTime(timeLeft)}
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {phase === 'qcm' ? `QCM ${currentQ + 1}/20` : `Ouvert ${currentQ + 1}/10`}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '3px', background: 'var(--surface2)' }}>
        <div style={{ height: '100%', background: 'var(--yellow)', width: `${progress}%`, transition: 'width 0.3s' }} />
      </div>

      {/* Alert */}
      {lastAlert && (
        <div className="alert alert-error" style={{ margin: '12px 24px', borderRadius: 'var(--radius-sm)' }}>
          {lastAlert}
          <button onClick={() => {
            setLastAlert('');
            try { document.documentElement.requestFullscreen(); } catch {}
          }} style={{ marginLeft: '12px', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>
            Revenir en plein écran
          </button>
        </div>
      )}

      {/* Pause overlay */}
      {batchPaused && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏸</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', marginBottom: '8px' }}>Examen en pause</h2>
          <p style={{ color: 'var(--text-muted)' }}>Le formateur a mis l'examen en pause. Attendez qu'il reprenne.</p>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>

        {phase === 'qcm' && (
          <QCMQuestion
            question={qcmQuestions[currentQ]}
            selected={qcmAnswers[qcmQuestions[currentQ]?.id] || []}
            onToggle={(idx) => toggleQcmAnswer(qcmQuestions[currentQ].id, idx)}
            questionNumber={currentQ + 1}
            total={20}
            onNext={() => {
              if (currentQ < qcmQuestions.length - 1) setCurrentQ(c => c + 1);
              else { setPhase('open'); setCurrentQ(0); }
            }}
            onPrev={currentQ > 0 ? () => setCurrentQ(c => c - 1) : null}
            isLast={currentQ === qcmQuestions.length - 1}
          />
        )}

        {phase === 'open' && (
          <OpenQuestion
            question={openQuestions[currentQ]}
            value={openAnswers[openQuestions[currentQ]?.id] || ''}
            onChange={(v) => setOpenAnswers(prev => ({ ...prev, [openQuestions[currentQ].id]: v }))}
            questionNumber={currentQ + 1}
            total={10}
            onNext={() => {
              if (currentQ < openQuestions.length - 1) setCurrentQ(c => c + 1);
              else setPhase('confirm');
            }}
            onPrev={() => {
              if (currentQ > 0) setCurrentQ(c => c - 1);
              else { setPhase('qcm'); setCurrentQ(qcmQuestions.length - 1); }
            }}
            isLast={currentQ === openQuestions.length - 1}
          />
        )}

        {phase === 'confirm' && (
          <ConfirmSubmit
            qcmAnswered={Object.keys(qcmAnswers).length}
            openAnswered={Object.values(openAnswers).filter(v => v.trim()).length}
            onSubmit={() => handleSubmit(false)}
            onBack={() => { setPhase('open'); setCurrentQ(openQuestions.length - 1); }}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}

function QCMQuestion({ question, selected, onToggle, questionNumber, total, onNext, onPrev, isLast }) {
  if (!question) return null;
  const letters = 'ABCDEFG';
  return (
    <div className="fade-in" style={{ width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
          <span className="badge badge-yellow">QCM</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Question {questionNumber}/{total}</span>
          {question.multi && <span className="badge badge-gray">Plusieurs réponses</span>}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{question.section}</div>
        <h2 style={{ fontSize: '18px', lineHeight: 1.5, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>{question.text}</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
        {question.answers.map((answer, idx) => {
          const isSelected = selected.includes(idx);
          return (
            <button key={idx} onClick={() => onToggle(idx)} style={{
              display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 18px',
              background: isSelected ? 'rgba(245,196,0,0.1)' : 'var(--surface)',
              border: `1px solid ${isSelected ? 'var(--yellow)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.12s', width: '100%'
            }}>
              <div style={{
                minWidth: '28px', height: '28px', borderRadius: question.multi ? '6px' : '50%',
                border: `2px solid ${isSelected ? 'var(--yellow)' : 'var(--border)'}`,
                background: isSelected ? 'var(--yellow)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '12px',
                color: isSelected ? 'var(--black)' : 'var(--text-muted)',
                transition: 'all 0.12s', flexShrink: 0
              }}>{isSelected && !question.multi ? '●' : letters[idx]}</div>
              <span style={{ fontSize: '15px', lineHeight: 1.5, color: isSelected ? 'var(--text)' : 'var(--text-muted)', paddingTop: '2px' }}>{answer}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn btn-secondary" onClick={onPrev} disabled={!onPrev}>← Précédent</button>
        <button className="btn btn-primary" onClick={onNext}>
          {isLast ? 'Questions ouvertes →' : 'Suivant →'}
        </button>
      </div>
    </div>
  );
}

function OpenQuestion({ question, value, onChange, questionNumber, total, onNext, onPrev, isLast }) {
  if (!question) return null;
  return (
    <div className="fade-in" style={{ width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
          <span className="badge badge-orange">Question Ouverte</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Question {questionNumber}/{total}</span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{question.cat}</div>
        <h2 style={{ fontSize: '18px', lineHeight: 1.6, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>{question.text}</h2>
      </div>

      <textarea
        className="textarea"
        style={{ minHeight: '200px', marginBottom: '32px' }}
        placeholder="Rédigez votre réponse ici…"
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus
      />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn btn-secondary" onClick={onPrev}>← Précédent</button>
        <button className="btn btn-primary" onClick={onNext}>
          {isLast ? 'Terminer l\'examen →' : 'Suivant →'}
        </button>
      </div>
    </div>
  );
}

function ConfirmSubmit({ qcmAnswered, openAnswered, onSubmit, onBack, submitting }) {
  return (
    <div className="fade-in" style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏁</div>
      <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Prêt à soumettre ?</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Cette action est irréversible. Vérifiez que vous avez bien répondu à tout.</p>

      <div className="card" style={{ marginBottom: '24px', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>QCM répondus</span>
          <span style={{ fontWeight: 600, color: qcmAnswered === 20 ? 'var(--green)' : 'var(--orange)' }}>{qcmAnswered}/20</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Questions ouvertes répondues</span>
          <span style={{ fontWeight: 600, color: openAnswered === 10 ? 'var(--green)' : 'var(--orange)' }}>{openAnswered}/10</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ flex: 1 }}>← Revoir</button>
        <button className="btn btn-primary" onClick={onSubmit} disabled={submitting} style={{ flex: 1 }}>
          {submitting ? <span className="spinner" /> : '✓ Soumettre'}
        </button>
      </div>
    </div>
  );
}

function FinishedScreen({ candidate }) {
  useEffect(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="fade-in" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Examen terminé !</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Merci {candidate.first_name}. Vos réponses ont bien été enregistrées.<br />
          Votre formateur vous communiquera les résultats.
        </p>
        <div className="card" style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            La correction de vos questions ouvertes et votre mise en situation seront évaluées par le directeur dans les prochains jours.
          </div>
        </div>
      </div>
    </div>
  );
}
