import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectTabs } from '@/components/projects/project-tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Project, BomItem, CostSettings, Machine, Material, Quotation } from '@/types/database'

const statusConfig = {
  draft:      { label: 'Nháp',         color: 'bg-gray-100 text-gray-700' },
  in_review:  { label: 'Đang xem xét', color: 'bg-yellow-100 text-yellow-700' },
  quoted:     { label: 'Đã báo giá',   color: 'bg-blue-100 text-blue-700' },
  confirmed:  { label: 'Đã xác nhận',  color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Đã hủy',       color: 'bg-red-100 text-red-700' },
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: project },
    { data: bomItems },
    { data: costSettings },
    { data: machines },
    { data: materials },
    { data: quotations },
    { data: { user } },
  ] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).single(),
    supabase.from('bom_items').select('*, material:materials!material_id(*), colorant:materials!colorant_id(*), ink:materials!ink_id(*), machine:machines(*), tool_cost:tool_costs(*)').eq('project_id', id).order('sort_order'),
    supabase.from('cost_settings').select('*').eq('id', 1).single(),
    supabase.from('machines').select('*').order('tonnage'),
    supabase.from('materials').select('*').order('type').order('name'),
    supabase.from('quotations').select('*, items:quotation_items(*)').eq('project_id', id).order('revision'),
    supabase.auth.getUser(),
  ])

  if (!project) notFound()

  const s = statusConfig[project.status as keyof typeof statusConfig] ?? statusConfig.draft

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard"><ArrowLeft size={16} /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 font-mono">{project.code}</h1>
              <Badge className={`${s.color} border-0`}>{s.label}</Badge>
            </div>
            <p className="text-gray-600 mt-0.5">{project.customer_name} {project.subject ? `— ${project.subject}` : ''}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ProjectTabs
        project={project as Project}
        bomItems={(bomItems ?? []) as BomItem[]}
        costSettings={costSettings as CostSettings}
        machines={(machines ?? []) as Machine[]}
        materials={(materials ?? []) as Material[]}
        quotations={(quotations ?? []) as Quotation[]}
        userId={user?.id ?? ''}
      />
    </div>
  )
}
