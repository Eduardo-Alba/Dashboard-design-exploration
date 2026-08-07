import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'edge' }

// Único lugar donde se usa SUPABASE_SERVICE_ROLE_KEY — nunca se expone al cliente.
// Crear un usuario de Auth requiere privilegios de admin que la anon key no tiene.
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

  // Verifica al llamante con su propio token (no confiamos en el body) y exige rol ADMIN.
  const { data: caller, error: callerError } = await admin.auth.getUser(token)
  if (callerError || !caller.user) return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 })

  const { data: callerProfile } = await admin.from('profiles').select('business_id, role').eq('id', caller.user.id).single()
  if (!callerProfile || callerProfile.role !== 'ADMIN') {
    return new Response(JSON.stringify({ error: 'Solo un administrador puede agregar usuarios.' }), { status: 403 })
  }

  const { fullName, email, role } = await req.json()
  if (!fullName || !email || !['ADMIN', 'CAJERO', 'CONTADOR'].includes(role)) {
    return new Response(JSON.stringify({ error: 'Datos inválidos.' }), { status: 400 })
  }

  const tempPassword = crypto.randomUUID()
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  })
  if (createError || !created.user) {
    return new Response(JSON.stringify({ error: createError?.message ?? 'No se pudo crear el usuario.' }), { status: 400 })
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: created.user.id,
    business_id: callerProfile.business_id,
    full_name: fullName,
    email,
    role,
    is_active: true,
  })
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id)
    return new Response(JSON.stringify({ error: 'No se pudo crear el perfil del usuario.' }), { status: 400 })
  }

  return new Response(JSON.stringify({ ok: true, tempPassword }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
