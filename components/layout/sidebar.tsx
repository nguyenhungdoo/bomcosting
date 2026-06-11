'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, FolderOpen, Settings, LogOut,
  Wrench, Package, ChevronRight, Layers
} from 'lucide-react'
import { toast } from 'sonner'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Dự án', icon: FolderOpen },
]

const settingsItems = [
  { href: '/settings/materials', label: 'Nguyên vật liệu', icon: Package },
  { href: '/settings/machines', label: 'Máy ép', icon: Wrench },
  { href: '/settings/cost', label: 'Thông số chi phí', icon: Settings },
]

const roleMeta: Record<string, { label: string; color: string; bg: string }> = {
  director: { label: 'Giám đốc', color: 'text-violet-300', bg: 'bg-violet-500/20' },
  technical: { label: 'Kỹ thuật',  color: 'text-sky-300',    bg: 'bg-sky-500/20' },
  sales:     { label: 'Sales',     color: 'text-emerald-300', bg: 'bg-emerald-500/20' },
}

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Đã đăng xuất')
    router.push('/login')
    router.refresh()
  }

  const role = roleMeta[profile.role] ?? { label: profile.role, color: 'text-gray-300', bg: 'bg-gray-500/20' }

  return (
    <div className="flex flex-col w-64 min-h-screen" style={{
      background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
    }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <Layers size={18} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-white text-sm tracking-wide">BOMCOSTING</div>
          <div className="text-xs text-indigo-300/70">Báo giá nhựa ép khuôn</div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/10 mb-4" />

      {/* User info */}
      <div className="mx-3 mb-5 px-3 py-3 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {profile.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{profile.full_name}</p>
            <span className={cn('inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium', role.color, role.bg)}>
              {role.label}
            </span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-indigo-500/30 text-white border border-indigo-400/30 shadow-sm'
                  : 'text-indigo-200/70 hover:bg-white/8 hover:text-white'
              )}>
              <Icon size={17} className={active ? 'text-indigo-300' : ''} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={14} className="text-indigo-400" />}
            </Link>
          )
        })}

        {/* Settings group */}
        <div className="pt-4 pb-1">
          <p className="px-3 text-xs font-semibold text-indigo-300/50 uppercase tracking-wider">Cài đặt</p>
        </div>
        {settingsItems.map(item => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-indigo-500/30 text-white border border-indigo-400/30 shadow-sm'
                  : 'text-indigo-200/70 hover:bg-white/8 hover:text-white'
              )}>
              <Icon size={17} className={active ? 'text-indigo-300' : ''} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={14} className="text-indigo-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 mt-4">
        <div className="h-px bg-white/10 mb-3" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-200/70 hover:bg-red-500/20 hover:text-red-300 transition-all duration-150"
        >
          <LogOut size={17} />
          Đăng xuất
        </button>
      </div>
    </div>
  )
}
