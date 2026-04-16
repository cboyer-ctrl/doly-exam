import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── BATCHES ───────────────────────────────────────────────
export async function getBatches() {
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createBatch(name) {
  const { data, error } = await supabase
    .from('batches')
    .insert({ name, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBatch(id) {
  const { error } = await supabase.from('batches').delete().eq('id', id);
  if (error) throw error;
}

export async function updateBatch(id, updates) {
  const { data, error } = await supabase
    .from('batches')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getBatchWithCandidates(batchId) {
  const { data: batch, error: bErr } = await supabase
    .from('batches')
    .select('*')
    .eq('id', batchId)
    .single();
  if (bErr) throw bErr;

  const { data: candidates, error: cErr } = await supabase
    .from('candidates')
    .select(`*, exam_sessions(*)`)
    .eq('batch_id', batchId)
    .order('created_at');
  if (cErr) throw cErr;

  return { ...batch, candidates: candidates || [] };
}

// ─── CANDIDATES ────────────────────────────────────────────
export async function createCandidate(batchId, firstName, lastName, email) {
  const { data, error } = await supabase
    .from('candidates')
    .insert({ batch_id: batchId, first_name: firstName, last_name: lastName, email: email || null, status: 'pending_approval' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPendingCandidates(batchId) {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('batch_id', batchId)
    .eq('status', 'pending_approval')
    .order('created_at');
  if (error) throw error;
  return data || [];
}

export async function updateCandidate(id, updates) {
  const { data, error } = await supabase
    .from('candidates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCandidateByName(batchId, firstName, lastName) {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('batch_id', batchId)
    .ilike('first_name', firstName)
    .ilike('last_name', lastName)
    .single();
  if (error) return null;
  return data;
}

export async function getCandidateFullProfile(candidateId) {
  const { data: candidate, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .single();
  if (error) throw error;

  const { data: session } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('candidate_id', candidateId)
    .single();

  if (!session) return { candidate, session: null, qcmAnswers: [], openAnswers: [], practicalEval: null, infractions: [] };

  const [{ data: qcmAnswers }, { data: openAnswers }, { data: practicalEval }, { data: infractions }] = await Promise.all([
    supabase.from('qcm_answers').select('*').eq('session_id', session.id).order('question_id'),
    supabase.from('open_answers').select('*').eq('session_id', session.id).order('question_id'),
    supabase.from('practical_evals').select('*').eq('session_id', session.id).maybeSingle(),
    supabase.from('infractions').select('*').eq('session_id', session.id).order('occurred_at')
  ]);

  return { candidate, session, qcmAnswers: qcmAnswers || [], openAnswers: openAnswers || [], practicalEval, infractions: infractions || [] };
}

// ─── EXAM SESSIONS ─────────────────────────────────────────
export async function createExamSession(candidateId, batchId, qcmIds, openIds) {
  const { data, error } = await supabase
    .from('exam_sessions')
    .insert({ candidate_id: candidateId, batch_id: batchId, qcm_question_ids: qcmIds, open_question_ids: openIds })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getExamSession(candidateId) {
  const { data, error } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('candidate_id', candidateId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ─── ANSWERS ───────────────────────────────────────────────
export async function submitQcmAnswer(sessionId, questionId, answerGiven, isCorrect) {
  const { error } = await supabase
    .from('qcm_answers')
    .upsert({ session_id: sessionId, question_id: questionId, answer_given: answerGiven, is_correct: isCorrect });
  if (error) throw error;
}

export async function submitOpenAnswer(sessionId, questionId, answerText) {
  const { error } = await supabase
    .from('open_answers')
    .upsert({ session_id: sessionId, question_id: questionId, answer_text: answerText });
  if (error) throw error;
}

export async function gradeOpenAnswer(answerId, score, comment) {
  const { error } = await supabase
    .from('open_answers')
    .update({ score, comment, graded_at: new Date().toISOString() })
    .eq('id', answerId);
  if (error) throw error;
}

export async function savePracticalEval(sessionId, score, comment) {
  const { error } = await supabase
    .from('practical_evals')
    .upsert({ session_id: sessionId, score, comment, graded_at: new Date().toISOString() });
  if (error) throw error;
}

// ─── INFRACTIONS ───────────────────────────────────────────
export async function logInfraction(sessionId, type) {
  const { error } = await supabase
    .from('infractions')
    .insert({ session_id: sessionId, type });
  if (error) throw error;
}

// ─── EMAIL ─────────────────────────────────────────────────
export async function sendBatchResults(batchId) {
  // Get all finished candidates with their sessions
  const { data: candidates, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('batch_id', batchId)
    .eq('status', 'finished')
    .not('email', 'is', null);
  if (error) throw error;

  const results = [];
  for (const cand of candidates) {
    const { data: session } = await supabase
      .from('exam_sessions')
      .select('*')
      .eq('candidate_id', cand.id)
      .single();
    if (!session) continue;

    const [{ data: qcmA }, { data: openA }, { data: practEval }] = await Promise.all([
      supabase.from('qcm_answers').select('*').eq('session_id', session.id),
      supabase.from('open_answers').select('*').eq('session_id', session.id),
      supabase.from('practical_evals').select('*').eq('session_id', session.id).maybeSingle()
    ]);

    const sc = computeScore(qcmA || [], openA || [], practEval);
    results.push({ candidate: cand, score: sc });
  }

  // Send emails via Resend
  const apiKey = process.env.REACT_APP_RESEND_API_KEY;
  const sent = [];
  for (const { candidate: cand, score: sc } of results) {
    if (!cand.email) continue;
    const statusText = cand.validated === true ? 'VALIDE' : cand.validated === false ? 'NON VALIDE' : 'EN ATTENTE DE VALIDATION';
    const html = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">' +
      '<div style="background:#000;padding:24px;text-align:center">' +
      '<span style="color:#FFD100;font-size:28px;font-weight:bold">DOLY</span></div>' +
      '<div style="padding:32px;background:#f9f9f9">' +
      '<h2 style="color:#1a1a1a">Bonjour ' + cand.first_name + ',</h2>' +
      '<p style="color:#555">Voici le resultat de votre evaluation de fin de premier mois.</p>' +
      '<div style="background:#fff;border:1px solid #eee;border-radius:8px;padding:24px;margin:24px 0">' +
      '<table style="width:100%;border-collapse:collapse">' +
      '<tr><td style="padding:8px;color:#888;font-size:13px">QCM (coef 1)</td><td style="padding:8px;font-weight:bold;text-align:right">' + sc.qcmScore + '/20</td></tr>' +
      '<tr><td style="padding:8px;color:#888;font-size:13px">Questions ouvertes (coef 2)</td><td style="padding:8px;font-weight:bold;text-align:right">' + sc.openScore + '/20</td></tr>' +
      '<tr><td style="padding:8px;color:#888;font-size:13px">Mise en situation (coef 3)</td><td style="padding:8px;font-weight:bold;text-align:right">' + sc.practicalScore + '/30</td></tr>' +
      '<tr style="border-top:2px solid #FFD100"><td style="padding:12px 8px;font-weight:bold;font-size:16px">TOTAL</td><td style="padding:12px 8px;font-weight:bold;font-size:16px;text-align:right">' + sc.total + '/70</td></tr>' +
      '</table></div>' +
      '<div style="background:' + (cand.validated === true ? '#d4edda' : cand.validated === false ? '#f8d7da' : '#fff3cd') + ';border-radius:6px;padding:12px;text-align:center;font-weight:bold;color:' + (cand.validated === true ? '#155724' : cand.validated === false ? '#721c24' : '#856404') + '">' + statusText + '</div>' +
      '</div>' +
      '<div style="background:#000;padding:16px;text-align:center;color:#888;font-size:12px">DOLY — Plateforme Evaluation</div>' +
      '</div>';

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'DOLY Evaluation <onboarding@resend.dev>',
          to: [cand.email],
          subject: 'Votre resultat - Evaluation DOLY',
          html
        })
      });
      sent.push(cand.email);
    } catch (e) { console.error('Email failed for', cand.email, e); }
  }
  return { sent, total: results.length };
}

// ─── STAFF AUTH ────────────────────────────────────────────
export async function staffLogin(username, password) {
  const { data, error } = await supabase
    .from('staff_accounts')
    .select('*')
    .eq('username', username)
    .single();
  if (error || !data) return null;
  if (data.password !== password) return null;
  return data;
}

// ─── SCORING ───────────────────────────────────────────────
export function computeScore(qcmAnswers, openAnswers, practicalEval) {
  const qcmScore = qcmAnswers.filter(a => a.is_correct).length; // /20
  const openScore = openAnswers.reduce((sum, a) => sum + (a.score || 0), 0); // /20
  const practicalScore = practicalEval ? (practicalEval.score || 0) * 3 : 0; // /30
  const total = qcmScore + openScore + practicalScore;
  const allGraded = openAnswers.length === 10 && openAnswers.every(a => a.score !== null) && practicalEval?.score !== null;
  return { qcmScore, openScore, practicalScore, total, allGraded, passed: total >= 42 };
}
