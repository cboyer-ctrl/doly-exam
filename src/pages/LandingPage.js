import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { getBatches, getCandidateByName, createCandidate, createExamSession, getExamSession } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { staffLogin } from '../lib/supabase';
import { drawQuestions } from '../data/questions';

export default function LandingPage() {
  const [view, setView] = useState('home'); // home | candidate | staff
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      {/* Background accent */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', background: 'var(--yellow)' }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: '480px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '48px', fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--yellow)', letterSpacing: '-2px' }}>DOLY</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Plateforme d'Évaluation</div>
        </div>

        {view === 'home' && <HomeView setView={setView} />}
        {view === 'candidate' && <CandidateLogin setView={setView} />}
        {view === 'staff' && <StaffLogin setView={setView} />}
      </div>
    </div>
  );
}

function HomeView({ setView }) {
  return (
    <div className="card" style={{ padding: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Bienvenue</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sélectionnez votre profil pour continuer</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <RoleCard icon="👤" title="Candidat" desc="Accéder à mon examen" onClick={() => setView('candidate')} primary />
        <RoleCard icon="👨‍🏫" title="Formateur" desc="Gérer les sessions et résultats" onClick={() => setView('staff')} />
        <RoleCard icon="👨‍💼" title="Directeur" desc="Administration et correction" onClick={() => setView('staff')} />
      </div>
    </div>
  );
}

function RoleCard({ icon, title, desc, onClick, primary }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '16px 20px', borderRadius: 'var(--radius-sm)',
      background: primary ? 'rgba(245,196,0,0.08)' : 'var(--surface2)',
      border: `1px solid ${primary ? 'rgba(245,196,0,0.3)' : 'var(--border)'}`,
      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', width: '100%'
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--yellow)'; e.currentTarget.style.background = 'rgba(245,196,0,0.1)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = primary ? 'rgba(245,196,0,0.3)' : 'var(--border)'; e.currentTarget.style.background = primary ? 'rgba(245,196,0,0.08)' : 'var(--surface2)'; }}>
      <span style={{ fontSize: '28px' }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{title}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</div>
      </div>
      <span style={{ marginLeft: 'auto', color: 'var(--text-dim)' }}>→</span>
    </button>
  );
}

function CandidateLogin({ setView }) {
  const { handleCandidateJoin } = useContext(AppContext);
  const [step, setStep] = useState('form'); // form | batch | waiting_approval
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingCandidate, setPendingCandidate] = useState(null);

  async function handleSubmitName(e) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;
    // Validate doly.me domain
    if (!email.toLowerCase().endsWith('@doly.me')) {
      setError("Adresse email invalide. Vous devez utiliser votre adresse @doly.me.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Verify email exists via DNS MX check (lightweight)
      const domain = email.split('@')[1];
      try {
        const res = await fetch('https://dns.google/resolve?name=' + domain + '&type=MX');
        const data = await res.json();
        if (!data.Answer || data.Answer.length === 0) {
          setError("Cette adresse email ne semble pas valide. Contactez votre formateur.");
          setLoading(false);
          return;
        }
      } catch { /* DNS check failed silently - continue */ }
      const allBatches = await getBatches();
      const active = allBatches.filter(b => b.status === 'pending' || b.status === 'active' || b.status === 'paused');
      if (active.length === 0) { setError("Aucune session disponible. Contactez votre formateur."); setLoading(false); return; }
      setBatches(active);
      setStep('batch');
    } catch { setError("Erreur de connexion. Reessayez."); }
    setLoading(false);
  }

  async function handleSelectBatch(batch) {
    setSelectedBatch(batch);
    setLoading(true);
    setError('');
    try {
      let candidate = await getCandidateByName(batch.id, firstName, lastName);
      if (candidate && candidate.status === 'finished') {
        setError("Vous avez deja passe cet examen. Il n'est pas possible de repasser.");
        setLoading(false);
        return;
      }
      if (candidate && candidate.status === 'rejected') {
        setError("Votre demande a ete refusee par le formateur. Veuillez le contacter directement pour plus d'informations.");
        setLoading(false);
        return;
      }
      if (!candidate) {
        candidate = await createCandidate(batch.id, firstName.trim(), lastName.trim(), email.trim());
      }
      if (candidate.status === 'pending_approval') {
        setPendingCandidate(candidate);
        setStep('waiting_approval');
        setLoading(false);
        // Listen for approval
        const channel = supabase
          .channel('candidate-approval-' + candidate.id)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'candidates', filter: 'id=eq.' + candidate.id },
            async (payload) => {
              const updated = payload.new;
              if (updated.status === 'waiting') {
                supabase.removeChannel(channel);
                const fullName = firstName + ' ' + lastName + ' ' + batch.id;
                const { qcm, open } = drawQuestions(fullName);
                let session = await getExamSession(updated.id);
                if (!session) {
                  session = await createExamSession(updated.id, batch.id, qcm.map(q => q.id), open.map(q => q.id));
                }
                handleCandidateJoin({ candidate: updated, batch, session, qcmQuestions: qcm, openQuestions: open });
              } else if (updated.status === 'rejected') {
                supabase.removeChannel(channel);
                setStep('batch');
                setError("Votre demande a ete refusee par le formateur. Veuillez le contacter directement.");
              }
            })
          .subscribe();
        return;
      }
      // Already approved - join directly
      const fullName = firstName + ' ' + lastName + ' ' + batch.id;
      const { qcm, open } = drawQuestions(fullName);
      let session = await getExamSession(candidate.id);
      if (!session) {
        session = await createExamSession(candidate.id, batch.id, qcm.map(q => q.id), open.map(q => q.id));
      }
      handleCandidateJoin({ candidate, batch, session, qcmQuestions: qcm, openQuestions: open });
    } catch (err) { setError("Erreur. Reessayez."); console.error(err); }
    setLoading(false);
  }

  return (
    <div className="card" style={{ padding: '32px' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => setView('home')} style={{ marginBottom: '24px', padding: '0' }}>← Retour</button>
      <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Identification Candidat</h2>

      {step === 'form' && (
        <form onSubmit={handleSubmitName}>
          <div className="mb-16">
            <label className="label">Prénom</label>
            <input className="input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Votre prénom" autoFocus />
          </div>
          <div className="mb-16">
            <label className="label">Nom</label>
            <input className="input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Votre nom" />
          </div>
          <div className="mb-24">
            <label className="label">Adresse email DOLY</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="prenom.nom@doly.me" />
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>Utilisez uniquement votre adresse @doly.me</div>
          </div>
          {error && <div className="alert alert-error mb-16">{error}</div>}
          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Continuer'}
          </button>
        </form>
      )}

      {step === 'batch' && (
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
            Bonjour <strong style={{ color: 'var(--text)' }}>{firstName} {lastName}</strong>.<br />
            Sélectionnez votre session d'examen :
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {batches.map(b => (
              <button key={b.id} onClick={() => handleSelectBatch(b)} disabled={loading}
                style={{
                  padding: '14px 18px', background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{b.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {new Date(b.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <span className={`badge badge-${b.status === 'active' ? 'green' : b.status === 'paused' ? 'orange' : 'gray'}`}>
                  {b.status === 'active' ? '● Actif' : b.status === 'paused' ? '⏸ Pause' : '⏳ En attente'}
                </span>
              </button>
            ))}
          </div>
          {error && <div className="alert alert-error mt-16">{error}</div>}
          {loading && <div style={{ textAlign: 'center', marginTop: '16px' }}><span className="spinner" /></div>}
        </div>
      )}

      {step === 'waiting_approval' && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Demande envoyee</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
            Votre demande d'integration a ete envoyee au formateur.<br />
            Vous serez automatiquement redirige des qu'il aura accepte votre demande.<br />
            <strong style={{ color: 'var(--text)' }}>Ne fermez pas cette fenetre.</strong>
          </p>
          <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="pulse">●</span>
            <span>En attente de validation par le formateur...</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffLogin({ setView }) {
  const { handleStaffLogin } = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await staffLogin(username, password);
      if (!user) { setError("Identifiants incorrects."); setLoading(false); return; }
      handleStaffLogin(user);
    } catch { setError("Erreur de connexion."); }
    setLoading(false);
  }

  return (
    <div className="card" style={{ padding: '32px' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => setView('home')} style={{ marginBottom: '24px', padding: '0' }}>← Retour</button>
      <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Connexion Staff</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-16">
          <label className="label">Identifiant</label>
          <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="formateur / directeur" autoFocus />
        </div>
        <div className="mb-24">
          <label className="label">Mot de passe</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" />
        </div>
        {error && <div className="alert alert-error mb-16">{error}</div>}
        <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
