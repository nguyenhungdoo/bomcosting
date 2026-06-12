'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Plus, FileText, Download, Eye } from 'lucide-react'
import { calcCost } from '@/lib/costing'
import type { Project, BomItem, CostSettings, Quotation, QuotationLang } from '@/types/database'
import { QuotationPreview } from './quotation-preview'

interface Props {
  project: Project
  bomItems: BomItem[]
  costSettings: CostSettings
  quotations: Quotation[]
  userId: string
}

const statusBadge: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}
const statusLabel: Record<string, string> = {
  draft: 'Nháp', sent: 'Đã gửi', approved: 'Đã duyệt', rejected: 'Từ chối',
}

export function QuotationManager({ project, bomItems, costSettings, quotations: initial, userId }: Props) {
  const [quotations, setQuotations] = useState(initial)
  const [createOpen, setCreateOpen] = useState(false)
  const [previewQuot, setPreviewQuot] = useState<Quotation | null>(null)
  const [creating, setCreating] = useState(false)
  const [newLang, setNewLang] = useState<QuotationLang>('vn')
  const [overrides, setOverrides] = useState({
    overhead_factory: costSettings?.overhead_factory ?? 0.05,
    overhead_qc: costSettings?.overhead_qc ?? 0.05,
    overhead_packaging: costSettings?.overhead_packaging ?? 0.05,
    overhead_admin: costSettings?.overhead_admin ?? 0.10,
    overhead_shipping: costSettings?.overhead_shipping ?? 0.10,
    overhead_profit: costSettings?.overhead_profit ?? 0.40,
    usd_rate: costSettings?.usd_rate ?? 25000,
    validity_days: 30,
    delivery_mold_days: 45,
    delivery_sample_days: 7,
    delivery_production_days: 15,
    payment_mold_deposit: 50,
    incoterm: 'EXW',
  })

  const nextRev = (lang: QuotationLang) => {
    const existing = quotations.filter(q => q.lang === lang)
    return existing.length
  }

  async function handleCreate() {
    if (bomItems.length === 0) { toast.error('Cần thêm BOM trước khi tạo báo giá'); return }
    setCreating(true)
    const supabase = createClient()

    const rev = nextRev(newLang)
    const { data: quot, error } = await supabase.from('quotations').insert({
      project_id: project.id,
      revision: rev,
      lang: newLang,
      validity_days: overrides.validity_days,
      usd_rate: overrides.usd_rate,
      overhead_factory: overrides.overhead_factory,
      overhead_qc: overrides.overhead_qc,
      overhead_packaging: overrides.overhead_packaging,
      overhead_admin: overrides.overhead_admin,
      overhead_shipping: overrides.overhead_shipping,
      overhead_profit: overrides.overhead_profit,
      delivery_mold_days: overrides.delivery_mold_days,
      delivery_sample_days: overrides.delivery_sample_days,
      delivery_production_days: overrides.delivery_production_days,
      payment_mold_deposit: overrides.payment_mold_deposit,
      incoterm: overrides.incoterm,
      status: 'draft',
      created_by: userId,
    }).select().single()

    if (error) { toast.error('Lỗi: ' + error.message); setCreating(false); return }

    // Calculate and save quotation items
    const settingsWithOverrides = { ...costSettings, ...overrides }
    const items = bomItems.map(item => {
      const cost = calcCost(item, settingsWithOverrides)
      const toolPrice = (item.tool_cost as any)?.tool_price ?? 0
      return {
        quotation_id: quot.id,
        bom_item_id: item.id,
        electricity_cost_per_shot: cost.electricity_cost_per_shot,
        depreciation_cost_per_shot: cost.depreciation_cost_per_shot,
        labor_cost_per_shot: cost.labor_cost_per_shot,
        processing_cost_per_pc: cost.processing_cost_per_pc,
        resin_cost_per_pc: cost.resin_cost_per_pc,
        colorant_cost_per_pc: cost.colorant_cost_per_pc,
        ink_cost_per_pc: cost.ink_cost_per_pc,
        material_cost_per_pc: cost.material_cost_per_pc,
        base_cost_per_pc: cost.base_cost_per_pc,
        total_overhead_pct: cost.total_overhead_pct,
        unit_price_vnd: cost.unit_price_vnd,
        unit_price_usd: cost.unit_price_usd,
        tool_price_vnd: toolPrice,
        tool_price_usd: overrides.usd_rate > 0 ? toolPrice / overrides.usd_rate : 0,
      }
    })

    await supabase.from('quotation_items').insert(items)

    toast.success(`Đã tạo báo giá Rev ${rev} (${newLang.toUpperCase()})`)
    setCreateOpen(false)

    // Reload
    const { data } = await supabase
      .from('quotations')
      .select('*, items:quotation_items(*)')
      .eq('project_id', project.id)
      .order('revision')
    setQuotations(data ?? [])
    setCreating(false)
  }

  async function handleUpdateStatus(quotId: string, status: string) {
    const supabase = createClient()
    await supabase.from('quotations').update({ status }).eq('id', quotId)
    setQuotations(q => q.map(x => x.id === quotId ? { ...x, status: status as any } : x))
    toast.success('Đã cập nhật trạng thái')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Danh sách báo giá ({quotations.length})</h2>
        <Button onClick={() => setCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus size={16} className="mr-2" />Tạo báo giá mới
        </Button>
      </div>

      {quotations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-40" />
            <p>Chưa có báo giá nào. Nhấn "Tạo báo giá mới".</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {quotations.map(quot => (
            <Card key={quot.id} className="border">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <FileText size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Rev {quot.revision}</span>
                      <Badge className="bg-indigo-100 text-indigo-700 border-0 text-xs">
                        {quot.lang === 'vn' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
                      </Badge>
                      <Badge className={`${statusBadge[quot.status]} border-0 text-xs`}>
                        {statusLabel[quot.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(quot.created_at).toLocaleDateString('vi-VN')} ·
                      Hiệu lực {quot.validity_days} ngày ·
                      Overhead {((quot.overhead_factory + quot.overhead_qc + quot.overhead_packaging + quot.overhead_admin + quot.overhead_shipping + quot.overhead_profit) * 100).toFixed(0)}% ·
                      LN {(quot.overhead_profit * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {quot.status === 'draft' && (
                    <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(quot.id, 'sent')}>
                      Đã gửi KH
                    </Button>
                  )}
                  {quot.status === 'sent' && (
                    <>
                      <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleUpdateStatus(quot.id, 'approved')}>Duyệt</Button>
                      <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleUpdateStatus(quot.id, 'rejected')}>Từ chối</Button>
                    </>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setPreviewQuot(quot)}>
                    <Eye size={14} className="mr-1" />Xem
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/api/export/pdf?quotId=${quot.id}`} target="_blank">
                      <Download size={14} className="mr-1" />PDF
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/api/export/excel?projectId=${project.id}&quotId=${quot.id}`} target="_blank">
                      <Download size={14} className="mr-1" />Excel
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Tạo báo giá mới</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Ngôn ngữ</Label>
              <Select value={newLang} onValueChange={v => setNewLang(v as QuotationLang)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vn">🇻🇳 Tiếng Việt (Rev {nextRev('vn')})</SelectItem>
                  <SelectItem value="en">🇬🇧 English (Rev {nextRev('en')})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <Label className="text-xs">Hiệu lực báo giá (ngày)</Label>
                <Input type="number" value={overrides.validity_days} onChange={e => setOverrides(o => ({ ...o, validity_days: +e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tỷ giá USD</Label>
                <Input type="number" value={overrides.usd_rate} onChange={e => setOverrides(o => ({ ...o, usd_rate: +e.target.value }))} />
              </div>
            </div>

            {/* Delivery & Payment fields */}
            <div className="border rounded p-3 space-y-2 text-sm">
              <p className="font-medium text-gray-700">Điều khoản giao hàng & thanh toán</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'delivery_mold_days', label: 'Thời gian làm khuôn (ngày)' },
                  { key: 'delivery_sample_days', label: 'Thời gian làm mẫu T1 (ngày)' },
                  { key: 'delivery_production_days', label: 'Thời gian sản xuất (ngày)' },
                  { key: 'payment_mold_deposit', label: 'Đặt cọc khuôn (%)' },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-gray-600">{label}</label>
                    <Input
                      type="number" min="0"
                      className="h-7 text-xs"
                      value={(overrides as any)[key]}
                      onChange={e => setOverrides(o => ({ ...o, [key]: +e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Incoterm / Điều kiện giao hàng</label>
                <Input
                  className="h-7 text-xs"
                  value={overrides.incoterm}
                  onChange={e => setOverrides(o => ({ ...o, incoterm: e.target.value }))}
                  placeholder="EXW / FOB / DAP..."
                />
              </div>
            </div>

            <div className="border rounded p-3 space-y-2 text-sm">
              <p className="font-medium text-gray-700">Tỷ lệ chi phí (có thể điều chỉnh)</p>
              {[
                { key: 'overhead_factory', label: 'Nhà xưởng' },
                { key: 'overhead_qc', label: 'QC' },
                { key: 'overhead_packaging', label: 'Đóng gói' },
                { key: 'overhead_admin', label: 'Quản lý' },
                { key: 'overhead_shipping', label: 'Vận chuyển' },
                { key: 'overhead_profit', label: 'Lợi nhuận' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-28 text-gray-600">{label}</span>
                  <Input
                    type="number" step="0.1" min="0" max="100"
                    className="w-24 h-7 text-xs"
                    value={((overrides as any)[key] * 100).toFixed(1)}
                    onChange={e => setOverrides(o => ({ ...o, [key]: +e.target.value / 100 }))}
                  />
                  <span className="text-gray-500">%</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Tổng overhead + LN</span>
                <span>{((overrides.overhead_factory + overrides.overhead_qc + overrides.overhead_packaging + overrides.overhead_admin + overrides.overhead_shipping + overrides.overhead_profit) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Hủy</Button>
            <Button onClick={handleCreate} disabled={creating} className="bg-indigo-600 hover:bg-indigo-700">
              {creating ? 'Đang tạo...' : 'Tạo báo giá'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview */}
      {previewQuot && (
        <QuotationPreview
          open={!!previewQuot}
          onOpenChange={open => !open && setPreviewQuot(null)}
          quotation={previewQuot}
          project={project}
          bomItems={bomItems}
        />
      )}
    </div>
  )
}
