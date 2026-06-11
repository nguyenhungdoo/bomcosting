'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { BomItem, ToolCost } from '@/types/database'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  bomItem: BomItem
  onSaved: () => void
}

const EMPTY = {
  tool_price: 0, tool_material_cost: 0,
  making_time_days: 45, service_life_shots: 500000,
  supplier: '', notes: '',
}

export function ToolCostDialog({ open, onOpenChange, bomItem, onSaved }: Props) {
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const existing = bomItem.tool_cost as ToolCost | undefined

  useEffect(() => {
    if (existing) {
      setForm({
        tool_price: existing.tool_price,
        tool_material_cost: existing.tool_material_cost,
        making_time_days: existing.making_time_days,
        service_life_shots: existing.service_life_shots,
        supplier: existing.supplier ?? '',
        notes: existing.notes ?? '',
      })
    } else {
      setForm({ ...EMPTY })
    }
  }, [bomItem.id, open])

  const set = (f: string, v: string | number) => setForm(p => ({ ...p, [f]: v }))

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const payload = { ...form, bom_item_id: bomItem.id }
    let error
    if (existing) {
      ({ error } = await supabase.from('tool_costs').update(payload).eq('id', existing.id))
    } else {
      ({ error } = await supabase.from('tool_costs').insert(payload))
    }
    if (error) toast.error('Lỗi: ' + error.message)
    else { toast.success('Đã lưu chi phí khuôn'); onSaved(); onOpenChange(false) }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi phí khuôn — {bomItem.part_number ?? bomItem.part_name ?? 'Chi tiết'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5">
            <Label>Giá khuôn (VND)</Label>
            <Input type="number" min="0" value={form.tool_price}
              onChange={e => set('tool_price', +e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Chi phí nguyên liệu làm khuôn (VND)</Label>
            <Input type="number" min="0" value={form.tool_material_cost}
              onChange={e => set('tool_material_cost', +e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Thời gian làm khuôn (ngày)</Label>
            <Input type="number" min="1" value={form.making_time_days}
              onChange={e => set('making_time_days', +e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Service Life (số shot)</Label>
            <Input type="number" min="1" value={form.service_life_shots}
              onChange={e => set('service_life_shots', +e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Nhà cung cấp khuôn</Label>
            <Input placeholder="Tên công ty làm khuôn" value={form.supplier}
              onChange={e => set('supplier', e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Ghi chú</Label>
            <Textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <div className="col-span-2 bg-blue-50 rounded p-3 text-sm text-blue-700">
            <strong>Khấu hao khuôn/shot:</strong>{' '}
            {form.service_life_shots > 0
              ? new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(form.tool_price / form.service_life_shots)
              : 0} đ
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
