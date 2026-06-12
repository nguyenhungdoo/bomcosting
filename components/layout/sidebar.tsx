'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { LayoutDashboard, FolderOpen, Settings, LogOut, Wrench, Package, ChevronRight, Menu, X } from 'lucide-react'
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
  director: { label: 'GIÁM ĐỐC', color: '#fbbf24',  bg: 'rgba(251,191,36,0.20)' },
  technical: { label: 'KỸ THUẬT', color: '#93c5fd', bg: 'rgba(99,102,241,0.20)' },
  sales:     { label: 'SALES',    color: '#6ee7b7',  bg: 'rgba(16,185,129,0.20)' },
}

export function Sidebar({ profile }: { profile: Profile }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router   = useRouter()

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  async function handleLogout() {
    await createClient().auth.signOut()
    toast.success('Đã đăng xuất')
    router.push('/login')
    router.refresh()
  }

  const role = roleMeta[profile.role] ?? { label: profile.role, color: '#cbd5e1', bg: 'rgba(255,255,255,0.1)' }

  const navContent = (
    <>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px', background: 'white', padding: '5px',
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

      {/* User */}
      <div style={{ margin: '12px 12px 4px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
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

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
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

      {/* Logout */}
      <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
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
    </>
  )

  return (
    <>
      <style>{`
        /* ── Desktop: sidebar in flow ── */
        .sidebar-panel {
          display: flex;
          flex-direction: column;
          width: 256px;
          min-height: 100vh;
          background: linear-gradient(160deg, #0a1628 0%, #0d1f3c 55%, #0f2a52 100%);
          border-right: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .mobile-topbar { display: none; }
        .mobile-overlay { display: none; }

        /* ── Mobile: hamburger + slide drawer ── */
        @media (max-width: 767px) {
          .sidebar-panel {
            position: fixed;
            top: 0; left: 0;
            height: 100vh;
            min-height: unset;
            z-index: 60;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            box-shadow: 4px 0 24px rgba(0,0,0,0.4);
          }
          .sidebar-panel.mobile-open {
            transform: translateX(0);
          }
          .mobile-topbar {
            display: flex;
            position: fixed;
            top: 0; left: 0; right: 0;
            height: 56px;
            z-index: 50;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            background: linear-gradient(135deg, #0a1628, #0f2a52);
            border-bottom: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 2px 12px rgba(0,0,0,0.3);
          }
          .mobile-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.55);
            z-index: 59;
          }
        }
      `}</style>

      {/* ── Mobile top bar ── */}
      <div className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'white', borderRadius: '7px', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/elastec-logo.png.jpeg" alt="Elastec" style={{ width: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '13px', letterSpacing: '0.3px' }}>ELASTEC</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e5ab4, #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '12px',
          }}>
            {profile.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <button
            onClick={() => setMobileOpen(o => !o)}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', cursor: 'pointer', color: 'white', padding: '6px 8px', display: 'flex', alignItems: 'center' }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar panel ── */}
      <div className={`sidebar-panel${mobileOpen ? ' mobile-open' : ''}`}>
        {navContent}
      </div>
    </>
  )
}
