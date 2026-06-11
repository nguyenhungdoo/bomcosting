'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, FolderOpen, Settings, LogOut,
  Wrench, ChevronRight, Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Dự án', icon: FolderOpen },
  { href: '/settings/materials', label: 'Nguyên vật liệu', icon: Package, group: 'settings' },
  { href: '/settings/machines', label: 'Máy ép', icon: Wrench, group: 'settings' },
  { href: '/settings/cost', label: 'Thông số chi phí', icon: Settings, group: 'settings' },
]

const roleColors: Record<string, string> = {
  director: 'bg-purple-100 text-purple-700',
  technical: 'bg-blue-100 text-blue-700',
  sales: 'bg-green-100 text-green-700',
}
const roleLabels: Record<string, string> = {
  director: 'Giám đốc',
  technical: 'Kỹ thuật',
  sales: 'Sales',
}

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col w-64 min-h-screen bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm">B</div>
        <span className="font-bold text-lg">BOMCOSTING</span>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-800">
        <p className="text-sm font-medium text-white truncate">{profile.full_name}</p>
        <Badge className={cn('mt-1 text-xs', roleColors[profile.role] ?? 'bg-gray-200 text-gray-700')}>
          {roleLabels[profile.role] ?? profile.role}
        </Badge>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                active ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon size={18} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Đăng xuất
        </Button>
      </div>
    </div>
  )
}
