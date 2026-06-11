'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Material, MaterialType } from '@/types/database'

const typeConfig: Record<MaterialType, { label: string; color: string }> = {
  resin:    { label: 'Nhựa',     color: 'bg-blue-100 text-blue-700' },
  colorant: { label: 'Bột màu',  color: 'bg-yellow-100 text-yellow-700' },
  ink:      { label: 'Mực in',   color: 'bg-purple-100 text-purple-700' },
  other:    { label: 'Khác',     color: 'bg-gray-100 text-gray-700' },
}

const EMPTY = { code: '', name: '', type: 'resin' as MaterialType, unit_price: 0, unit: 'kg', supplier: '', notes: '' }

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<Material | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('materials').select('*').order('type').order('name')
    setMaterials(data ?? [])
  }
  useEffect(() => { load() }, [])

  function openNew() { setForm({ ...EMPTY }); setEdit(null); setOpen(true) }
  function openEdit(m: Material) {
    setForm({ code: m.code, name: m.name, type: m.type, unit_price: m.unit_price, unit: m.unit, supplier: m.supplier ?? '', notes: m.notes ?? '' })
    setEdit(m); setOpen(true)
  }

  async function handleSave() {
    if (!form.name) { toast.error('Nhập tên vật liệu'); return }
    setSaving(true)
    const supabase = createClient()
    const payload = { ...form, updated_at: new Date().toISOString() }
    let error
    if (edit) {
      ({ error } = await supabase.from('materials').update(payload).eq('id', edit.id))
    } else {
      ({ error } = await supabase.from('materials').insert(payload))
    }
    if (error) toast.error('Lỗi: ' + error.message)
    else { toast.success('Đã lưu'); setOpen(false); load() }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa vật liệu này?')) return
    const supabase = createClient()
    await supabase.from('materials').delete().eq('id', id)
    load()
  }

  const filtered = filter === 'all' ? materials : materials.filter(m => m.type === filter)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Danh mục nguyên vật liệu</h1>
        <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus size={16} className="mr-2" />Thêm vật liệu
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'resin', 'colorant', 'ink', 'other'].map(t => (
          <Button key={t} size="sm" variant={filter === t ? 'default' : 'outline'}
            onClick={() => setFilter(t)}
            className={filter === t ? 'bg-indigo-600' : ''}>
            {t === 'all' ? 'Tất cả' : typeConfig[t as MaterialType]?.label ?? t}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600">
                <th className="text-left px-4 py-3">Mã</th>
                <th className="text-left px-4 py-3">Tên</th>
                <th className="text-left px-4 py-3">Loại</th>
                <th className="text-right px-4 py-3">Đơn giá</th>
                <th className="text-left px-4 py-3">Đơn vị</th>
                <th className="text-left px-4 py-3">NCC</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const tc = typeConfig[m.type] ?? typeConfig.other
                return (
                  <tr key={m.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{m.code}</td>
                    <td className="px-4 py-3 font-medium">{m.name}</td>
                    <td className="px-4 py-3"><Badge className={`${tc.color} border-0 text-xs`}>{tc.label}</Badge></td>
                    <td className="px-4 py-3 text-right font-mono">{new Intl.NumberFormat('vi-VN').format(m.unit_price)}</td>
                    <td className="px-4 py-3 text-gray-500">{m.unit}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{m.supplier ?? '—'}</td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => openEdit(m)}><Pencil size={13} /></Button>
                      <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDelete(m.id)}><Trash2 size={13} /></Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit ? 'Sửa vật liệu' : 'Thêm vật liệu'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mã</label>
              <Input placeholder="PA6" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tên *</label>
              <Input placeholder="PA6 (Nylon 6)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Loại</label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as MaterialType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="resin">Nhựa</SelectItem>
                  <SelectItem value="colorant">Bột màu</SelectItem>
                  <SelectItem value="ink">Mực in</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Đơn vị</label>
              <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="lít">lít</SelectItem>
                  <SelectItem value="cái">cái</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium">Đơn giá (VND / {form.unit})</label>
              <Input type="number" min="0" value={form.unit_price} onChange={e => setForm(f => ({ ...f, unit_price: +e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium">Nhà cung cấp</label>
              <Input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium">Ghi chú</label>
              <Textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
