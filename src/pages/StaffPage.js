import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../App';
import {
  getBatches, createBatch, updateBatch, deleteBatch, getBatchWithCandidates,
  getCandidateFullProfile, gradeOpenAnswer, savePracticalEval, updateCandidate,
  computeScore
} from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { QCM_QUESTIONS, OPEN_QUESTIONS } from '../data/questions';

export default function StaffPage() {
  const { staffUser, handleLogout } = useContext(AppContext);
  const isDirecteur = staffUser.role === 'directeur';
  const [view, setView] = useState('batches'); // batches | batch | candidate
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <nav style={{
        background: 'var(--dark)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', color: 'var(--yellow)' }}>DOLY</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <NavBtn active={view === 'batches'} onClick={() => { setView('batches'); setSelectedBatch(null); setSelectedCandidate(null); }}>Sessions</NavBtn>
            {selectedBatch && (
              <NavBtn active={view === 'batch'} onClick={() => { setView('batch'); setSelectedCandidate(null); }}>
                {selectedBatch.name}
              </NavBtn>
            )}
            {selectedCandidate && (
              <NavBtn active={view === 'candidate'} onClick={() => setView('candidate')}>
                {selectedCandidate.candidate.first_name} {selectedCandidate.candidate.last_name}
              </NavBtn>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={`badge ${isDirecteur ? 'badge-yellow' : 'badge-gray'}`}>
            {isDirecteur ? '👨‍💼 Directeur' : '👨‍🏫 Formateur'}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Déconnexion</button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {view === 'batches' && (
          <BatchList isDirecteur={isDirecteur} onSelectBatch={(b) => { setSelectedBatch(b); setView('batch'); }} />
        )}
        {view === 'batch' && selectedBatch && (
          <BatchView
            batchId={selectedBatch.id}
            isDirecteur={isDirecteur}
            onSelectCandidate={(profile) => { setSelectedCandidate(profile); setView('candidate'); }}
            onBatchUpdate={(b) => setSelectedBatch(b)}
          />
        )}
        {view === 'candidate' && selectedCandidate && (
          <CandidateProfile
            profile={selectedCandidate}
            isDirecteur={isDirecteur}
            onRefresh={async () => {
              const updated = await getCandidateFullProfile(selectedCandidate.candidate.id);
              setSelectedCandidate(updated);
            }}
          />
        )}
      </div>
    </div>
  );
}

function NavBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px',
      background: active ? 'rgba(245,196,0,0.15)' : 'transparent',
      color: active ? 'var(--yellow)' : 'var(--text-muted)',
      fontFamily: 'Space Grotesk, sans-serif', fontWeight: 500, transition: 'all 0.15s'
    }}>{children}</button>
  );
}

// ─── BATCH LIST ─────────────────────────────────────────────
function BatchList({ isDirecteur, onSelectBatch }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const load = useCallback(async () => {
    const data = await getBatches();
    setBatches(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const batch = await createBatch(newName.trim() || `Batch du ${date}`);
    setBatches(prev => [batch, ...prev]);
    setNewName('');
    setCreating(false);
  }

  const statusLabel = { pending: 'En attente', active: 'En cours', paused: 'En pause', archived: 'Archivé' };
  const statusBadge = { pending: 'gray', active: 'green', paused: 'orange', archived: 'gray' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Sessions d'examen</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Historique complet de tous les batchs</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input className="input" style={{ width: '220px' }} placeholder="Nom du batch…" value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
            {creating ? <span className="spinner" /> : '+ Nouveau batch'}
          </button>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '48px' }}><span className="spinner" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {batches.length === 0 && <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Aucune session créée</div>}
          {batches.map(b => (
            <div key={b.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div style={{ flex: 1 }} onClick={() => onSelectBatch(b)}>
                <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{b.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Créé le {new Date(b.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {b.finished_at && ` · Terminé le ${new Date(b.finished_at).toLocaleDateString('fr-FR')}`}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`badge badge-${statusBadge[b.status]}`}>{statusLabel[b.status]}</span>
                {b.status === 'pending' && (
                  <button className="btn btn-danger btn-sm" onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm(`Supprimer le batch "${b.name}" ?`)) {
                      await deleteBatch(b.id);
                      setBatches(prev => prev.filter(x => x.id !== b.id));
                    }
                  }}>🗑</button>
                )}
                <span style={{ color: 'var(--text-dim)' }} onClick={() => onSelectBatch(b)}>→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── BATCH VIEW ─────────────────────────────────────────────
function BatchView({ batchId, isDirecteur, onSelectCandidate, onBatchUpdate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const d = await getBatchWithCandidates(batchId);
    setData(d);
    onBatchUpdate(d);
    setLoading(false);
  }, [batchId]);

  useEffect(() => {
    load();
    const channel = supabase.channel(`staff-batch-${batchId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates', filter: `batch_id=eq.${batchId}` }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [batchId, load]);

  if (loading) return <div style={{ textAlign: 'center', padding: '48px' }}><span className="spinner" /></div>;

  const batch = data;
  const candidates = batch.candidates || [];
  const isArchived = batch.status === 'archived';
  const isActive = batch.status === 'active';
  const isPaused = batch.status === 'paused';
  const isPending = batch.status === 'pending';

  async function handleLaunch() {
    await updateBatch(batchId, { status: 'active', started_at: new Date().toISOString() });
    load();
  }
  async function handlePause() {
    if (!isDirecteur) return;
    await updateBatch(batchId, { status: 'paused', timer_paused_at: new Date().toISOString() });
    load();
  }
  async function handleResume() {
    if (!isDirecteur) return;
    await updateBatch(batchId, { status: 'active', timer_paused_at: null });
    load();
  }
  async function handleArchive() {
    if (!isDirecteur) return;
    if (!window.confirm("Clôturer et archiver ce batch ? Action irréversible.")) return;
    await updateBatch(batchId, { status: 'archived', finished_at: new Date().toISOString() });
    load();
  }

  async function handleEndExam() {
    if (!window.confirm("Terminer l'examen ? Les candidats en cours seront arretes.")) return;
    for (const c of candidates.filter(c => c.status === 'exam')) {
      await updateCandidate(c.id, { status: 'finished', exam_finished_at: new Date().toISOString() });
    }
    await updateBatch(batchId, { status: 'paused' });
    load();
  }

  async function handleDeleteBatch() {
    if (!window.confirm("Supprimer définitivement ce batch ?")) return;
    await deleteBatch(batchId);
    window.location.reload();
  }

  const statusColor = { pending: 'gray', active: 'green', paused: 'orange', archived: 'gray' };
  const statusLabel = { pending: 'En attente', active: 'En cours ●', paused: '⏸ En pause', archived: 'Archivé' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', marginBottom: '4px' }}>{batch.name}</h1>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className={`badge badge-${statusColor[batch.status]}`}>{statusLabel[batch.status]}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{candidates.length} candidat{candidates.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {!isArchived && isPending && <button className="btn btn-primary" onClick={handleLaunch}>▶ Lancer l'examen</button>}
            {!isArchived && isActive && isDirecteur && <button className="btn btn-secondary" onClick={handlePause}>⏸ Pause</button>}
            {!isArchived && isPaused && isDirecteur && <button className="btn btn-primary" onClick={handleResume}>▶ Reprendre</button>}
            {!isArchived && isActive && <button className="btn btn-danger" onClick={handleEndExam}>⏹ Terminer l'examen</button>}
            {isDirecteur && !isArchived && isPaused && <button className="btn btn-danger" onClick={handleArchive}>🗄 Cloturer le batch</button>}
            {isDirecteur && (isPending || isArchived) && <button className="btn btn-danger btn-sm" onClick={handleDeleteBatch}>🗑 Supprimer</button>}
          </div>
      </div>

      {/* Stats row */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatCard label="Demandes" value={candidates.filter(c => c.status === 'pending_approval').length} color="var(--orange)" />
        <StatCard label="En examen" value={candidates.filter(c => c.status === 'exam').length} color="var(--yellow)" />
        <StatCard label="Terminés" value={candidates.filter(c => c.status === 'finished').length} color="var(--green)" />
      </div>

      {/* Pending approval requests */}
      {candidates.filter(c => c.status === 'pending_approval').length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', marginBottom: '12px', color: 'var(--orange)' }}>
            🔔 Demandes d'intégration en attente
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {candidates.filter(c => c.status === 'pending_approval').map(c => (
              <div key={c.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderColor: 'rgba(249,115,22,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', color: 'var(--orange)' }}>
                    {c.first_name[0]}{c.last_name[0]}
                  </div>
                  <div style={{ fontWeight: 600 }}>{c.first_name} {c.last_name}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-sm btn-danger" onClick={async (e) => {
                    e.stopPropagation();
                    await updateCandidate(c.id, { status: 'rejected' });
                    load();
                  }}>✗ Refuser</button>
                  <button className="btn btn-sm btn-primary" onClick={async (e) => {
                    e.stopPropagation();
                    await updateCandidate(c.id, { status: 'waiting' });
                    load();
                  }}>✓ Accepter</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidates list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {candidates.filter(c => c.status !== 'pending_approval').length === 0 && candidates.filter(c => c.status === 'pending_approval').length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            Aucun candidat connecté à cette session
          </div>
        )}
        {candidates.filter(c => c.status !== 'pending_approval').map(c => (
          <CandidateRow key={c.id} candidate={c} isDirecteur={isDirecteur}
            onClick={async () => {
              const profile = await getCandidateFullProfile(c.id);
              onSelectCandidate(profile);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '36px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color }}>{value}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

function CandidateRow({ candidate, isDirecteur, onClick }) {
  const statusColor = { pending_approval: 'orange', rejected: 'red', waiting: 'gray', exam: 'yellow', finished: 'green' };
  const statusLabel = { pending_approval: '⏳ Demande', rejected: '✗ Refusé', waiting: '⏳ En attente', exam: '● En examen', finished: '✓ Terminé' };
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
      onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--yellow)'
        }}>
          {candidate.first_name[0]}{candidate.last_name[0]}
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>{candidate.first_name} {candidate.last_name}</div>
          {candidate.exam_started_at && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Démarré à {new Date(candidate.exam_started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {candidate.validated === true && <span className="badge badge-green">✓ Validé</span>}
        {candidate.validated === false && <span className="badge badge-red">✗ Non validé</span>}
        <span className={`badge badge-${statusColor[candidate.status]}`}>{statusLabel[candidate.status]}</span>
        <span style={{ color: 'var(--text-dim)' }}>→</span>
      </div>
    </div>
  );
}

// ─── CANDIDATE PROFILE ──────────────────────────────────────
function CandidateProfile({ profile, isDirecteur, onRefresh }) {
  const { candidate, session, qcmAnswers, openAnswers, practicalEval, infractions } = profile;
  const [openSections, setOpenSections] = useState({ qcm: true, open: true, practical: true });
  const [saving, setSaving] = useState(false);
  const [localPractical, setLocalPractical] = useState({ score: practicalEval?.score ?? '', comment: practicalEval?.comment ?? '' });

  const toggle = (k) => setOpenSections(prev => ({ ...prev, [k]: !prev[k] }));

  const score = computeScore(qcmAnswers, openAnswers, practicalEval);

  async function handleValidate(val) {
    if (!isDirecteur) return;
    await updateCandidate(candidate.id, { validated: val, validated_at: new Date().toISOString() });
    onRefresh();
  }

  async function handleSavePractical() {
    if (!isDirecteur) return;
    setSaving(true);
    const s = parseFloat(localPractical.score);
    if (isNaN(s) || s < 0 || s > 10) { setSaving(false); return; }
    await savePracticalEval(session.id, s, localPractical.comment);
    await onRefresh();
    setSaving(false);
  }

  // Map question IDs back to questions
  const qcmQMap = Object.fromEntries(QCM_QUESTIONS.map(q => [q.id, q]));
  const openQMap = Object.fromEntries(OPEN_QUESTIONS.map(q => [q.id, q]));

  function downloadPDF(cand, sc, qcmA, openA, practEval, qMap, oMap, infracs) {
    // Load jsPDF dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210; const H = 297;
      const YELLOW = [255, 209, 0];
      const BLACK = [0, 0, 0];
      const WHITE = [255, 255, 255];
      const DARK = [26, 26, 26];
      const GREY = [245, 245, 245];
      const GREY_TEXT = [136, 136, 136];
      const GREEN = [34, 197, 94];
      const RED = [239, 68, 68];
      let y = 0;

      // ── HEADER BAND ──
      doc.setFillColor(...BLACK);
      doc.rect(0, 0, W, 28, 'F');
      doc.setTextColor(...YELLOW);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('DOLY', 14, 13);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...GREY_TEXT);
      doc.text('RAPPORT D'EVALUATION', 14, 20);
      // Date top right
      const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      doc.setFontSize(9);
      doc.text(dateStr, W - 14, 13, { align: 'right' });
      // Validated status badge
      const isValid = cand.validated === true;
      doc.setFillColor(...(isValid ? GREEN : RED));
      doc.roundedRect(W - 50, 17, 36, 7, 2, 2, 'F');
      doc.setTextColor(...WHITE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(isValid ? 'VALIDE' : 'NON VALIDE', W - 32, 22.5, { align: 'center' });
      y = 38;

      // ── CANDIDATE INFO ──
      doc.setFillColor(...GREY);
      doc.rect(0, y - 4, W, 22, 'F');
      doc.setTextColor(...DARK);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(cand.first_name + ' ' + cand.last_name, 14, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...GREY_TEXT);
      if (cand.exam_started_at) {
        const start = new Date(cand.exam_started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const end = cand.exam_finished_at ? new Date(cand.exam_finished_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-';
        doc.text('Examen : ' + start + ' → ' + end, 14, y + 13);
      }
      if (infracs.length > 0) {
        doc.setTextColor(239, 68, 68);
        doc.text('⚠ ' + infracs.length + ' infraction(s) detectee(s)', 130, y + 13);
      }
      y += 28;

      // ── SCORES BAND ──
      doc.setFillColor(...YELLOW);
      doc.rect(0, y, W, 8, 'F');
      doc.setTextColor(...BLACK);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('RESULTATS', 14, y + 5.5);
      y += 14;

      // Score boxes
      const boxes = [
        { label: 'QCM (coef 1)', score: sc.qcmScore, max: 20 },
        { label: 'Questions ouvertes (coef 2)', score: sc.openScore, max: 20 },
        { label: 'Mise en situation (coef 3)', score: sc.practicalScore, max: 30 },
      ];
      const bW = (W - 28 - 8) / 3;
      boxes.forEach((b, i) => {
        const x = 14 + i * (bW + 4);
        doc.setFillColor(...GREY);
        doc.rect(x, y, bW, 20, 'F');
        doc.setDrawColor(...YELLOW);
        doc.setLineWidth(0.5);
        doc.rect(x, y, bW, 20, 'S');
        doc.setTextColor(...GREY_TEXT);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(b.label, x + bW/2, y + 5, { align: 'center' });
        doc.setTextColor(...DARK);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(String(b.score), x + bW/2 - 5, y + 16, { align: 'right' });
        doc.setFontSize(10);
        doc.setTextColor(...GREY_TEXT);
        doc.text('/' + b.max, x + bW/2 - 3, y + 16);
      });
      y += 26;

      // Total bar
      doc.setFillColor(...BLACK);
      doc.rect(14, y, W - 28, 12, 'F');
      doc.setTextColor(...WHITE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('TOTAL', 20, y + 8);
      doc.setTextColor(...YELLOW);
      doc.setFontSize(12);
      doc.text(sc.total + '/70', W - 20, y + 8, { align: 'right' });
      doc.setFontSize(8);
      doc.setTextColor(200, 200, 200);
      doc.text(sc.passed ? 'Seuil atteint (42/70)' : 'Seuil non atteint (42/70)', W/2, y + 8, { align: 'center' });
      y += 18;

      // ── QCM SECTION ──
      doc.setFillColor(...YELLOW);
      doc.rect(0, y, W, 8, 'F');
      doc.setTextColor(...BLACK);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('QCM — ' + sc.qcmScore + '/20', 14, y + 5.5);
      y += 12;

      qcmA.forEach((a, i) => {
        const q = qMap[a.question_id];
        if (!q) return;
        if (y > 260) { doc.addPage(); y = 15; }
        // Row bg
        doc.setFillColor(a.is_correct ? 240 : 254, a.is_correct ? 253 : 226, a.is_correct ? 244 : 226);
        doc.rect(14, y, W - 28, 10, 'F');
        doc.setDrawColor(a.is_correct ? 34 : 239, a.is_correct ? 197 : 68, a.is_correct ? 94 : 68);
        doc.setLineWidth(0.8);
        doc.line(14, y, 14, y + 10);
        doc.setTextColor(...DARK);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        const qLabel = 'Q' + (i+1) + '. ' + q.text.substring(0, 70) + (q.text.length > 70 ? '...' : '');
        doc.text(qLabel, 17, y + 4.5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...GREY_TEXT);
        const ans = a.answer_given.map(idx => q.answers[parseInt(idx)]).join(', ');
        doc.text('Rep: ' + ans.substring(0, 80), 17, y + 8.5);
        doc.setTextColor(a.is_correct ? 34 : 239, a.is_correct ? 197 : 68, a.is_correct ? 94 : 68);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(a.is_correct ? '✓' : '✗', W - 18, y + 6, { align: 'right' });
        y += 12;
      });

      // ── OPEN QUESTIONS ──
      if (y > 240) { doc.addPage(); y = 15; }
      y += 4;
      doc.setFillColor(...YELLOW);
      doc.rect(0, y, W, 8, 'F');
      doc.setTextColor(...BLACK);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('QUESTIONS OUVERTES — ' + sc.openScore + '/20', 14, y + 5.5);
      y += 12;

      openA.forEach((a, i) => {
        const q = oMap[a.question_id];
        if (!q) return;
        if (y > 255) { doc.addPage(); y = 15; }
        doc.setFillColor(...GREY);
        doc.rect(14, y, W - 28, 28, 'F');
        doc.setDrawColor(...YELLOW);
        doc.setLineWidth(0.5);
        doc.rect(14, y, W - 28, 28, 'S');
        doc.setTextColor(...DARK);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        const qText = 'Q' + (i+1) + '. ' + q.text.substring(0, 75) + (q.text.length > 75 ? '...' : '');
        doc.text(qText, 17, y + 5);
        // Score badge
        const scored = a.score !== null && a.score !== undefined;
        doc.setFillColor(...(scored ? YELLOW : [200,200,200]));
        doc.roundedRect(W - 38, y + 2, 22, 7, 1.5, 1.5, 'F');
        doc.setTextColor(...BLACK);
        doc.setFontSize(8);
        doc.text(scored ? a.score + '/2' : 'N/A', W - 27, y + 6.5, { align: 'center' });
        // Answer
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...GREY_TEXT);
        const ans = (a.answer_text || 'Aucune reponse').substring(0, 120);
        const ansLines = doc.splitTextToSize(ans, W - 36);
        doc.text(ansLines.slice(0, 2), 17, y + 12);
        if (a.comment) {
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(6.5);
          doc.text('Commentaire: ' + a.comment.substring(0, 80), 17, y + 23);
        }
        y += 31;
      });

      // ── PRACTICAL EVAL ──
      if (y > 240) { doc.addPage(); y = 15; }
      y += 4;
      doc.setFillColor(...YELLOW);
      doc.rect(0, y, W, 8, 'F');
      doc.setTextColor(...BLACK);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('MISE EN SITUATION — ' + sc.practicalScore + '/30', 14, y + 5.5);
      y += 12;
      doc.setFillColor(...GREY);
      doc.rect(14, y, W - 28, 20, 'F');
      if (practEval) {
        doc.setTextColor(...DARK);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(practEval.score + '/10', 20, y + 13);
        if (practEval.comment) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...GREY_TEXT);
          doc.text(practEval.comment.substring(0, 100), 45, y + 13);
        }
      } else {
        doc.setTextColor(...GREY_TEXT);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text('Non evaluee', 20, y + 13);
      }
      y += 26;

      // ── INFRACTIONS ──
      if (infracs.length > 0) {
        if (y > 250) { doc.addPage(); y = 15; }
        doc.setFillColor(254, 226, 226);
        doc.rect(14, y, W - 28, 8 + infracs.length * 6, 'F');
        doc.setTextColor(239, 68, 68);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('INFRACTIONS (' + infracs.length + ')', 17, y + 6);
        infracs.forEach((inf, i) => {
          const t = inf.type === 'tab_switch' ? 'Changement onglet' : inf.type === 'fullscreen_exit' ? 'Sortie plein ecran' : 'Perte focus';
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(...DARK);
          doc.text('- ' + t + ' a ' + new Date(inf.occurred_at).toLocaleTimeString('fr-FR'), 17, y + 12 + i * 6);
        });
        y += 14 + infracs.length * 6;
      }

      // ── FOOTER ──
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(...BLACK);
        doc.rect(0, H - 10, W, 10, 'F');
        doc.setTextColor(...GREY_TEXT);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('DOLY — Plateforme d'Evaluation', 14, H - 4);
        doc.text('Page ' + p + '/' + totalPages, W - 14, H - 4, { align: 'right' });
      }

      // Save
      const filename = 'Rapport_' + cand.last_name + '_' + cand.first_name + '_' + dateStr.replace(/\//g, '-') + '.pdf';
      doc.save(filename);
    };
    document.head.appendChild(script);
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'rgba(245,196,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--yellow)'
          }}>{candidate.first_name[0]}{candidate.last_name[0]}</div>
          <div>
            <h2 style={{ fontSize: '22px' }}>{candidate.first_name} {candidate.last_name}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px', display: 'flex', gap: '12px' }}>
              {candidate.exam_started_at && <span>Début : {new Date(candidate.exam_started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>}
              {candidate.exam_finished_at && <span>Fin : {new Date(candidate.exam_finished_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>}
              {infractions.length > 0 && <span style={{ color: 'var(--red)' }}>⚠️ {infractions.length} infraction{infractions.length > 1 ? 's' : ''}</span>}
            </div>
          </div>
        </div>

        {/* Score + Validation */}
        <div style={{ textAlign: 'right' }}>
          {score.allGraded ? (
            <div>
              <div className="score-pill" style={{ marginBottom: '8px' }}>
                <span className="num">{score.total}</span>
                <span className="den">/70</span>
              </div>
              <div style={{ fontSize: '12px', color: score.passed ? 'var(--green)' : 'var(--red)', marginBottom: '12px', fontWeight: 600 }}>
                {score.passed ? '✓ Seuil atteint (42/70)' : '✗ Seuil non atteint'}
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>Score partiel</div>
          )}

          {isDirecteur && candidate.status === 'finished' && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button className="btn btn-sm"
                style={{ background: candidate.validated === false ? 'rgba(239,68,68,0.2)' : 'var(--surface2)', border: `1px solid ${candidate.validated === false ? 'var(--red)' : 'var(--border)'}`, color: candidate.validated === false ? 'var(--red)' : 'var(--text-muted)' }}
                onClick={() => handleValidate(false)}>✗ Non valide</button>
              <button className="btn btn-sm"
                style={{ background: candidate.validated === true ? 'rgba(34,197,94,0.2)' : 'var(--surface2)', border: `1px solid ${candidate.validated === true ? 'var(--green)' : 'var(--border)'}`, color: candidate.validated === true ? 'var(--green)' : 'var(--text-muted)' }}
                onClick={() => handleValidate(true)}>✓ Valide</button>
            </div>
          )}
          {candidate.status === 'finished' && candidate.validated !== null && candidate.validated !== undefined && (
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-sm btn-secondary" onClick={() => downloadPDF(candidate, score, qcmAnswers, openAnswers, practicalEval, qcmQMap, openQMap, infractions)}>
                ⬇ Telecharger PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>QCM (coef 1)</div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--yellow)' }}>{score.qcmScore}<span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/20</span></div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Questions ouvertes (coef 2)</div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--yellow)' }}>{score.openScore}<span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/20</span></div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Mise en situation (coef 3)</div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--yellow)' }}>{score.practicalScore}<span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/30</span></div>
        </div>
      </div>

      {/* QCM Section */}
      <SectionAccordion title={`QCM — ${score.qcmScore}/20`} open={openSections.qcm} onToggle={() => toggle('qcm')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {qcmAnswers.map((a, i) => {
            const q = qcmQMap[a.question_id];
            if (!q) return null;
            return (
              <div key={a.id} style={{ padding: '12px 16px', background: a.is_correct ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${a.is_correct ? 'var(--green)' : 'var(--red)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Q{i + 1} · {q.section}</div>
                    <div style={{ fontSize: '14px', marginBottom: '6px' }}>{q.text}</div>
                    <div style={{ fontSize: '13px', color: a.is_correct ? 'var(--green)' : 'var(--red)' }}>
                      Réponse : {a.answer_given.map(idx => q.answers[parseInt(idx)]).join(', ')}
                    </div>
                    {!a.is_correct && <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Correct : {q.correct.map(idx => q.answers[idx]).join(', ')}</div>}
                  </div>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{a.is_correct ? '✓' : '✗'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </SectionAccordion>

      {/* Open answers */}
      <SectionAccordion title={`Questions ouvertes — ${score.openScore}/20`} open={openSections.open} onToggle={() => toggle('open')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {openAnswers.map((a, i) => {
            const q = openQMap[a.question_id];
            if (!q) return null;
            return (
              <OpenAnswerCard key={a.id} answer={a} question={q} index={i} isDirecteur={isDirecteur}
                onGrade={async (score, comment) => {
                  await gradeOpenAnswer(a.id, score, comment);
                  onRefresh();
                }}
              />
            );
          })}
          {openAnswers.length === 0 && <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Pas encore de réponses</div>}
        </div>
      </SectionAccordion>

      {/* Practical eval */}
      <SectionAccordion title={`Mise en situation — ${score.practicalScore}/30`} open={openSections.practical} onToggle={() => toggle('practical')}>
        {isDirecteur ? (
          <div>
            <div className="mb-16">
              <label className="label">Note /10 (demi-points autorisés)</label>
              <input type="number" min="0" max="10" step="0.5" className="input" style={{ maxWidth: '120px' }}
                value={localPractical.score}
                onChange={e => setLocalPractical(prev => ({ ...prev, score: e.target.value }))}
              />
            </div>
            <div className="mb-16">
              <label className="label">Commentaire (facultatif)</label>
              <textarea className="textarea" style={{ minHeight: '80px' }}
                value={localPractical.comment}
                onChange={e => setLocalPractical(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Observations sur la mise en situation…"
              />
            </div>
            <button className="btn btn-primary" onClick={handleSavePractical} disabled={saving}>
              {saving ? <span className="spinner" /> : '💾 Enregistrer'}
            </button>
          </div>
        ) : (
          <div className="alert alert-info">La saisie de la note mise en situation est réservée au directeur.</div>
        )}
      </SectionAccordion>

      {/* Infractions */}
      {infractions.length > 0 && (
        <div className="card" style={{ marginTop: '24px', borderColor: 'rgba(239,68,68,0.3)' }}>
          <h3 style={{ fontSize: '15px', marginBottom: '12px', color: 'var(--red)' }}>⚠️ Infractions détectées ({infractions.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {infractions.map((inf, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span>{inf.type === 'tab_switch' ? 'Changement d\'onglet' : inf.type === 'fullscreen_exit' ? 'Sortie plein écran' : 'Perte de focus fenêtre'}</span>
                <span>{new Date(inf.occurred_at).toLocaleTimeString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionAccordion({ title, open, onToggle, children }) {
  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <button onClick={onToggle} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text)', fontFamily: 'Space Grotesk, sans-serif', padding: 0
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{title}</h3>
        <span style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>
      {open && <div style={{ marginTop: '20px' }}>{children}</div>}
    </div>
  );
}

function OpenAnswerCard({ answer, question, index, isDirecteur, onGrade }) {
  const [editing, setEditing] = useState(false);
  const [score, setScore] = useState(answer.score ?? '');
  const [comment, setComment] = useState(answer.comment ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const s = parseFloat(score);
    if (isNaN(s) || s < 0 || s > 2) { setSaving(false); return; }
    await onGrade(s, comment);
    setEditing(false);
    setSaving(false);
  }

  const scored = answer.score !== null && answer.score !== undefined;

  return (
    <div style={{ padding: '16px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', border: `1px solid ${scored ? 'var(--border)' : isDirecteur ? 'rgba(245,196,0,0.2)' : 'var(--border)'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Q{index + 1} · {question.cat}</div>
          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>{question.text}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {scored && <span className="badge badge-yellow">{answer.score}/2</span>}
          {!scored && isDirecteur && <span className="badge badge-orange">À corriger</span>}
          {isDirecteur && <button className="btn btn-ghost btn-sm" onClick={() => setEditing(!editing)} style={{ padding: '4px 8px', fontSize: '12px' }}>{editing ? 'Annuler' : scored ? '✏️ Modifier' : '📝 Corriger'}</button>}
        </div>
      </div>

      <div style={{ padding: '12px', background: 'var(--surface)', borderRadius: '6px', fontSize: '14px', color: 'var(--text)', lineHeight: 1.6, marginBottom: editing ? '12px' : 0, whiteSpace: 'pre-wrap', minHeight: '40px' }}>
        {answer.answer_text || <span style={{ color: 'var(--text-dim)' }}>Aucune réponse saisie</span>}
      </div>

      {answer.comment && !editing && (
        <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>💬 {answer.comment}</div>
      )}

      {editing && isDirecteur && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div>
            <label className="label">Note /2</label>
            <input type="number" min="0" max="2" step="0.5" className="input" style={{ width: '80px' }}
              value={score} onChange={e => setScore(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="label">Commentaire</label>
            <input className="input" value={comment} onChange={e => setComment(e.target.value)} placeholder="Facultatif…" />
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : '💾'}
          </button>
        </div>
      )}
    </div>
  );
}
