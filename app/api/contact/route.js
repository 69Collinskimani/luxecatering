import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request) {
  const { name, email, event_date, message } = await request.json()

  const { data, error } = await supabaseAdmin
    .from('contact_submissions')
    .insert([{ name, email, event_date, message }])

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true, data })
}