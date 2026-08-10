import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'edge' }

// ponytail: dominio fijo del deploy de demo, para el logo en el correo (los clientes de correo
// necesitan una URL absoluta). Si cambia el dominio, actualizar aqui.
const SITE_URL = 'https://finanzen-one-omega.vercel.app'

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

function buildEmailHtml(subject: string, message: string): string {
  const title = escapeHtml(subject.replace(/^FinanZen:\s*/, ''))
  const body = escapeHtml(message)
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f1e8;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1e8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6e2d6;">
            <tr>
              <td style="padding:32px 28px 24px;">
                <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#247575;margin-bottom:14px;">
                  Alerta de FinanZen
                </div>
                <div style="font-size:17px;font-weight:700;color:#1b5e3f;margin-bottom:14px;">
                  ${title}
                </div>
                <div style="font-size:14px;line-height:1.6;color:#2d3748;">
                  ${body}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:#f5f1e8;border-top:1px solid #e6e2d6;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right:10px;">
                      <img src="${SITE_URL}/icons/icon-192.png" width="28" height="28" alt="FinanZen" style="display:block;border-radius:6px;" />
                    </td>
                    <td>
                      <div style="font-size:15px;font-weight:800;color:#1b5e3f;">FinanZen</div>
                      <div style="font-size:11px;color:#a0aec0;">Gestión Financiera Inteligente</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

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

  if (!process.env.RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY no está configurada en el servidor.' }), { status: 500 })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'FinanZen <onboarding@resend.dev>', to, subject, text: message, html: buildEmailHtml(subject, message) }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    return new Response(JSON.stringify({ error: 'No se pudo enviar el correo.', to, detail }), { status: 502 })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
