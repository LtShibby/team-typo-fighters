import { createClient } from '@supabase/supabase-js'

// Make sure these are set as NEXT_PUBLIC_ vars in Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function pingSupabase() {
  try {
    const { data, error } = await supabase.from('players').select('*').limit(1)

    if (error) {
      console.error('[❌ Supabase Error]', error.message)
      return { success: false, error: error.message }
    }

    console.log('[✅ Supabase Connected] Sample data:', data)
    return { success: true, data }
  } catch (err: any) {
    console.error('[🔥 Unexpected Error]', err.message)
    return { success: false, error: err.message }
  }
}