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
export async function createCandidate(batchId, firstName, lastName) {
  const { data, error } = await supabase
    .from('candidates')
    .insert({ batch_id: batchId, first_name: firstName, last_name: lastName, status: 'waiting' })
    .select()
    .single();
  if (error) throw error;
  return data;
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

// ─── STAFF AUTH ────────────────────────────────────────────
export async function staffLogin(username, password) {
  const { data, error } = await supabase
    .from('staff_accounts')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();
  if (error || !data) return null;
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
