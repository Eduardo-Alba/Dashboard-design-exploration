import { supabase } from '@/lib/supabase/client'

/** Envia un correo real via api/send-alert-email (Resend) al usuario autenticado. */
export async function sendAlertEmail(subject: string, message: string): Promise<boolean> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) return false
  try {
    const res = await fetch('/api/send-alert-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ subject, message }),
    })
    return res.ok
  } catch {
    return false
  }
}
