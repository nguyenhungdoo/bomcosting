import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import type { Profile } from '@/types/database'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (!profile) redirect('/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
      <Sidebar profile={profile as Profile} />
      <main style={{ flex: 1, overflow: 'auto', background: '#f0f4f8' }}>
        {children}
      </main>
    </div>
  )
}
