import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FolderOpen, Clock, CheckCircle, FileText, ArrowUpRight, TrendingUp } from 'lucide-react'
import type { Project } from '@/types/database'

const statusConfig = {
  draft:      { label: 'Nháp',           color: 'bg-slate-100 text-slate-600 border-slate-200' },
  in_review:  { label: 'Đang xem xét',   color: 'bg-amber-50 text-amber-700 border-amber-200' },
  quoted:     { label: 'Đã báo giá',     color: 'bg-blue-50 text-blue-700 border-blue-200' },
  confirmed:  { label: 'Đã xác nhận',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled:  { label: 'Đã hủy',         color: 'bg-red-50 text-red-600 border-red-200' },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const list = (projects ?? []) as Project[]
  const stats = {
    total:     list.length,
    draft:     list.filter(p => p.status === 'draft' || p.status === 'in_review').length,
    quoted:    list.filter(p => p.status === 'quoted').length,
    confirmed: list.filter(p => p.status === 'confirmed').length,
  }

  const statCards = [
    {
      label: 'Tổng dự án',
      value: stats.total,
      icon: FolderOpen,
      gradient: 'from-indigo-500 to-indigo-600',
      bg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      label: 'Đang thực hiện',
      value: stats.draft,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Đã báo giá',
      value: stats.quoted,
      icon: FileText,
      gradient: 'from-sky-500 to-blue-600',
      bg: 'bg-sky-50',
      iconColor: 'text-sky-600',
    },
    {
      label: 'Đã xác nhận',
      value: stats.confirmed,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-green-600',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
  ]

  return (
    <div className="page-root p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Quản lý dự án báo giá nhựa ép khuôn — ELASTEC</p>
        </div>
        <Button asChild
          className="gap-2 shadow-md shadow-indigo-200 font-medium"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <Link href="/projects/new">
            <Plus size={16} />Dự án mới
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="stats-grid grid grid-cols-4 gap-5 mb-8">
        {statCards.map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon size={20} className={stat.iconColor} />
                </div>
                <TrendingUp size={14} className="text-gray-300" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ overflow: 'hidden' }}>
        <div className="table-scroll">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-base">Dự án gần đây</h2>
          {list.length > 0 && (
            <Link href="/projects" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              Xem tất cả <ArrowUpRight size={14} />
            </Link>
          )}
        </div>

        {list.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen size={28} className="text-indigo-400" />
            </div>
            <p className="text-gray-500 font-medium mb-1">Chưa có dự án nào</p>
            <p className="text-gray-400 text-sm mb-5">Tạo dự án đầu tiên để bắt đầu báo giá</p>
            <Button asChild size="sm"
              className="gap-2"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Link href="/projects/new"><Plus size={14} />Tạo dự án đầu tiên</Link>
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mã dự án</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Khách hàng</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nội dung</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.map(project => {
                const s = statusConfig[project.status] ?? statusConfig.draft
                return (
                  <tr key={project.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-indigo-600 font-semibold text-xs bg-indigo-50 px-2 py-1 rounded-lg">
                        {project.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{project.customer_name}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{project.subject ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${s.color}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(project.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <Button asChild variant="ghost" size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium gap-1">
                        <Link href={`/projects/${project.id}`}>Mở <ArrowUpRight size={13} /></Link>
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        </div>
      </div>
    </div>
  )
}
