import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'edge' }

// Envia siempre al correo del propio usuario autenticado (o su notification_email si lo
// tiene configurado), nunca a un `to` del cliente — evita que este endpoint se use como relay
// para mandar correos a terceros.
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405 })
  }

  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 })

  const url = process.env.VITE_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const admin = createClient(url, serviceKey)

  const { data: caller, error: callerError } = await admin.auth.getUser(token)
  if (callerError || !caller.user?.email) return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 })

  const { data: profile } = await admin.from('profiles').select('notification_email').eq('id', caller.user.id).single()
  const to = profile?.notification_email || caller.user.email

  const { subject, message } = await req.json()
  if (!subject || !message) return new Response(JSON.stringify({ error: 'Datos inválidos.' }), { status: 400 })

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'FinanZen <onboarding@resend.dev>', to, subject, text: message }),
  })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'No se pudo enviar el correo.' }), { status: 502 })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
