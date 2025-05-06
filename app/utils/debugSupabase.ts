import { createClient } from '@supabase/supabase-js'
import { useEffect } from 'react'

export function debugSupabase() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_API_KEY!
  )

  useEffect(() => {
    console.log('Supabase client initialized:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_API_KEY
    })
  }, [])

  return null
}
