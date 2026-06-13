import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, FolderOpen, ArrowUpRight } from 'lucide-react'
import type { Project } from '@/types/database'

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  draft:     { label: 'Nháp',          color: '#475569', bg: '#f1f5f9', border: '#e2e8f0' },
  quoting:   { label: 'Đang báo giá',  color: '#92400e', bg: '#fef3c7', border: '#fde68a' },
  quoted:    { label: 'Đã báo giá',    color: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe' },
  cancelled: { label: 'Đã hủy',        color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' },
  other:     { label: 'Khác',          color: '#374151', bg: '#f3f4f6', border: '#e5e7eb' },
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  const list = (projects ?? []) as Project[]

  const stats = [
    { label: 'Tổng dự án',    value: list.length,                                       color: '#1e5ab4', bg: '#dbeafe' },
    { label: 'Đang báo giá',  value: list.filter(p => p.status === 'quoting').length,   color: '#d97706', bg: '#fef3c7' },
    { label: 'Đã báo giá',    value: list.filter(p => p.status === 'quoted').length,    color: '#1d4ed8', bg: '#eff6ff' },
    { label: 'Đã hủy',        value: list.filter(p => p.status === 'cancelled').length, color: '#991b1b', bg: '#fee2e2' },
  ]

  return (
    <div className="page-root" style={{ padding: '32px', minHeight: '100vh', background: '#f0f4f8' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderOpen size={19} color="#1d4ed8" />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Danh sách dự án</h1>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>{list.length} dự án</p>
            </div>
          </div>
          <Link href="/projects/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '9px 18px', borderRadius: '10px', textDecoration: 'none',
            background: 'linear-gradient(135deg, #1e5ab4, #0ea5e9)', color: 'white',
            fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
          }}>
            <Plus size={15} />Dự án mới
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', borderLeft: `4px solid ${s.color}` }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div className="table-scroll">
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #1e5ab4, #0ea5e9, #38bdf8)' }} />

          {list.length === 0 ? (
            <div style={{ padding: '80px 32px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <FolderOpen size={28} color="#1d4ed8" />
              </div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>Chưa có dự án nào</p>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px' }}>Tạo dự án đầu tiên để bắt đầu báo giá</p>
              <Link href="/projects/new" style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '9px 18px', borderRadius: '10px', textDecoration: 'none',
                background: 'linear-gradient(135deg, #1e5ab4, #0ea5e9)', color: 'white',
                fontSize: '13px', fontWeight: 700,
              }}>
                <Plus size={14} />Tạo dự án đầu tiên
              </Link>
            </div>
          ) : (
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {['Mã dự án', 'Khách hàng', 'Nội dung', 'Trạng thái', 'Ngày tạo', ''].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map(project => {
                  const s = statusConfig[project.status as keyof typeof statusConfig] ?? statusConfig.draft
                  return (
                    <tr key={project.id} className="project-row" style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#1e5ab4', background: '#dbeafe', padding: '3px 10px', borderRadius: '6px' }}>
                          {project.code}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: '#0f172a' }}>{project.customer_name}</td>
                      <td style={{ padding: '14px 20px', color: '#64748b', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {project.subject ?? '—'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '12px' }}>
                        {new Date(project.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <Link href={`/projects/${project.id}`} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '6px 12px', borderRadius: '8px', textDecoration: 'none',
                          color: '#1e5ab4', background: '#eff6ff', fontSize: '12px', fontWeight: 600,
                          border: '1px solid #bfdbfe',
                        }}>
                          Mở <ArrowUpRight size={12} />
                        </Link>
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

      <style>{`
        .project-row:hover { background: #f8fafc; }
      `}</style>
    </div>
  )
}
