'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { cn } from '@/lib/utils'
import { LayoutDashboard, FolderOpen, Settings, LogOut, Wrench, Package, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects',  label: 'Dự án',     icon: FolderOpen },
]
const settingsItems = [
  { href: '/settings/materials', label: 'Nguyên vật liệu', icon: Package },
  { href: '/settings/machines',  label: 'Máy ép',          icon: Wrench },
  { href: '/settings/cost',      label: 'Thông số chi phí', icon: Settings },
]

const roleMeta: Record<string, { label: string; color: string; bg: string }> = {
  director: { label: 'Giám đốc', color: 'text-sky-200',    bg: 'rgba(14,165,233,0.15)' },
  technical: { label: 'Kỹ Thuật', color: 'text-blue-200',  bg: 'rgba(99,102,241,0.15)' },
  sales:     { label: 'Sales',    color: 'text-emerald-200',bg: 'rgba(16,185,129,0.15)' },
}

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    await createClient().auth.signOut()
    toast.success('Đã đăng xuất')
    router.push('/login')
    router.refresh()
  }

  const role = roleMeta[profile.role] ?? { label: profile.role, color: 'text-gray-300', bg: 'rgba(255,255,255,0.1)' }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width: '256px', minHeight: '100vh',
      background: 'linear-gradient(160deg, #0a1628 0%, #0d1f3c 55%, #0f2a52 100%)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px',
            background: 'white', padding: '5px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.3)', flexShrink: 0,
          }}>
            <img src="/elastec-logo.png.jpeg" alt="ELASTEC" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '13px', letterSpacing: '0.3px', lineHeight: 1.2 }}>
              ELASTEC INDUSTRIES JSC
            </div>
            <div style={{ color: 'rgba(148,194,255,0.55)', fontSize: '10.5px', marginTop: '3px' }}>
              BOM Costing System
            </div>
          </div>
        </div>
      </div>

      {/* ── User ── */}
      <div style={{ margin: '12px 12px 4px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #1e5ab4, #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '13px',
          }}>
            {profile.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'white', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile.full_name}
            </div>
            <span style={{
              display: 'inline-block', marginTop: '3px',
              padding: '2px 8px', borderRadius: '20px', fontSize: '10.5px', fontWeight: 600,
              color: role.color, background: role.bg,
            }}>{role.label}</span>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '8px 10px' }}>
        {navItems.map(item => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '10px', marginBottom: '2px',
                background: active ? 'rgba(14,165,233,0.15)' : 'transparent',
                border: active ? '1px solid rgba(14,165,233,0.25)' : '1px solid transparent',
                color: active ? '#7dd3fc' : 'rgba(180,210,255,0.6)',
                fontSize: '13.5px', fontWeight: active ? 600 : 400,
                transition: 'all 0.15s', cursor: 'pointer',
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <ChevronRight size={13} />}
              </div>
            </Link>
          )
        })}

        {/* Settings group */}
        <div style={{ padding: '16px 12px 6px', fontSize: '10px', fontWeight: 700, color: 'rgba(148,194,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Cài đặt
        </div>
        {settingsItems.map(item => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '10px', marginBottom: '2px',
                background: active ? 'rgba(14,165,233,0.15)' : 'transparent',
                border: active ? '1px solid rgba(14,165,233,0.25)' : '1px solid transparent',
                color: active ? '#7dd3fc' : 'rgba(180,210,255,0.6)',
                fontSize: '13.5px', fontWeight: active ? 600 : 400,
                transition: 'all 0.15s', cursor: 'pointer',
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <ChevronRight size={13} />}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* ── Logout ── */}
      <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
          padding: '9px 12px', borderRadius: '10px', border: 'none', background: 'transparent', cursor: 'pointer',
          color: 'rgba(180,210,255,0.5)', fontSize: '13.5px', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)'; (e.currentTarget as HTMLElement).style.color = '#fca5a5' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(180,210,255,0.5)' }}
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </div>
  )
}
