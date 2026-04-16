import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { batchId } = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const resendKey = Deno.env.get('RESEND_API_KEY')!

    const { data: candidates, error: candError } = await supabase
      .from('candidates')
      .select('*')
      .eq('batch_id', batchId)
      .eq('status', 'finished')
      .not('email', 'is', null)

    if (candError) {
      return new Response(JSON.stringify({ error: 'DB error', detail: candError.message }), { status: 500, headers: corsHeaders })
    }

    const sent = []
    const errors = []

    for (const cand of candidates || []) {
      const { data: session } = await supabase.from('exam_sessions').select('*').eq('candidate_id', cand.id).single()
      if (!session) continue

      const [{ data: qcmA }, { data: openA }, { data: practEval }] = await Promise.all([
        supabase.from('qcm_answers').select('*').eq('session_id', session.id),
        supabase.from('open_answers').select('*').eq('session_id', session.id),
        supabase.from('practical_evals').select('*').eq('session_id', session.id).maybeSingle()
      ])

      const qcmScore = (qcmA || []).filter((a: any) => a.is_correct).length
      const openScore = (openA || []).reduce((s: number, a: any) => s + (a.score || 0), 0)
      const practicalScore = practEval ? (practEval.score || 0) * 3 : 0
      const total = qcmScore + openScore + practicalScore
      const statusText = cand.validated === true ? 'VALIDE' : cand.validated === false ? 'NON VALIDE' : 'EN ATTENTE'
      const statusBg = cand.validated === true ? '#d4edda' : cand.validated === false ? '#f8d7da' : '#fff3cd'
      const statusColor = cand.validated === true ? '#155724' : cand.validated === false ? '#721c24' : '#856404'

      const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#000;padding:24px;text-align:center"><span style="color:#FFD100;font-size:28px;font-weight:bold">DOLY</span></div>
        <div style="padding:32px;background:#f9f9f9">
          <h2 style="color:#1a1a1a">Bonjour ${cand.first_name},</h2>
          <p style="color:#555">Voici le resultat de votre evaluation de fin de premier mois.</p>
          <div style="background:#fff;border:1px solid #eee;border-radius:8px;padding:24px;margin:24px 0">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;color:#888;font-size:13px">QCM (coef 1)</td><td style="padding:8px;font-weight:bold;text-align:right">${qcmScore}/20</td></tr>
              <tr><td style="padding:8px;color:#888;font-size:13px">Questions ouvertes (coef 2)</td><td style="padding:8px;font-weight:bold;text-align:right">${openScore}/20</td></tr>
              <tr><td style="padding:8px;color:#888;font-size:13px">Mise en situation (coef 3)</td><td style="padding:8px;font-weight:bold;text-align:right">${practicalScore}/30</td></tr>
              <tr style="border-top:2px solid #FFD100"><td style="padding:12px 8px;font-weight:bold;font-size:16px">TOTAL</td><td style="padding:12px 8px;font-weight:bold;font-size:16px;text-align:right">${total}/70</td></tr>
            </table>
          </div>
          <div style="background:${statusBg};border-radius:6px;padding:12px;text-align:center;font-weight:bold;color:${statusColor}">${statusText}</div>
        </div>
        <div style="background:#000;padding:16px;text-align:center;color:#888;font-size:12px">DOLY - Plateforme Evaluation</div>
      </div>`

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'DOLY Evaluation <onboarding@resend.dev>',
          to: [cand.email],
          subject: 'Votre resultat - Evaluation DOLY',
          html
        })
      })

      const resendData = await resendRes.json()
      if (resendRes.ok) {
        sent.push(cand.email)
      } else {
        errors.push({ email: cand.email, error: resendData })
      }
    }

    return new Response(JSON.stringify({ sent, total: candidates?.length || 0, errors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders })
  }
})
