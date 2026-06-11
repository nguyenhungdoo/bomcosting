import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, FolderOpen, Clock, CheckCircle, FileText } from 'lucide-react'
import type { Project } from '@/types/database'

const statusConfig = {
  draft:      { label: 'Nháp',           color: 'bg-gray-100 text-gray-700' },
  in_review:  { label: 'Đang xem xét',   color: 'bg-yellow-100 text-yellow-700' },
  quoted:     { label: 'Đã báo giá',     color: 'bg-blue-100 text-blue-700' },
  confirmed:  { label: 'Đã xác nhận',    color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Đã hủy',         color: 'bg-red-100 text-red-700' },
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
    draft:     list.filter(p => p.status === 'draft').length,
    quoted:    list.filter(p => p.status === 'quoted').length,
    confirmed: list.filter(p => p.status === 'confirmed').length,
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Quản lý dự án báo giá nhựa ép khuôn</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
          <Link href="/projects/new">
            <Plus size={18} className="mr-2" />Dự án mới
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Tổng dự án',      value: stats.total,     icon: FolderOpen,    color: 'text-indigo-600' },
          { label: 'Đang thực hiện',  value: stats.draft,     icon: Clock,         color: 'text-yellow-600' },
          { label: 'Đã báo giá',      value: stats.quoted,    icon: FileText,      color: 'text-blue-600' },
          { label: 'Đã xác nhận',     value: stats.confirmed, icon: CheckCircle,   color: 'text-green-600' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <stat.icon size={24} className={stat.color} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dự án gần đây</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FolderOpen size={48} className="mx-auto mb-3 opacity-40" />
              <p>Chưa có dự án nào. <Link href="/projects/new" className="text-indigo-600 hover:underline">Tạo dự án đầu tiên</Link></p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="text-left px-6 py-3 font-medium">Mã dự án</th>
                  <th className="text-left px-6 py-3 font-medium">Khách hàng</th>
                  <th className="text-left px-6 py-3 font-medium">Tiêu đề</th>
                  <th className="text-left px-6 py-3 font-medium">Trạng thái</th>
                  <th className="text-left px-6 py-3 font-medium">Ngày tạo</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {list.map(project => {
                  const s = statusConfig[project.status] ?? statusConfig.draft
                  return (
                    <tr key={project.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-indigo-700 font-medium">{project.code}</td>
                      <td className="px-6 py-4 font-medium">{project.customer_name}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{project.subject ?? '—'}</td>
                      <td className="px-6 py-4">
                        <Badge className={`${s.color} border-0`}>{s.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(project.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/projects/${project.id}`}>Mở</Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
