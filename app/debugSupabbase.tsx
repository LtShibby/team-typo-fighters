import { useEffect } from 'react'
import { pingSupabase } from './pingSupabase'

export default function DebugSupabase() {
  useEffect(() => {
    pingSupabase()
  }, [])

  return <div className="text-arcade-text">Check the console 👀</div>
}
