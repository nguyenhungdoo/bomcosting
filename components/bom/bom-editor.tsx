'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Image, Wrench } from 'lucide-react'
import type { BomItem, Machine, Material } from '@/types/database'
import { ToolCostDialog } from './tool-cost-dialog'

interface Props {
  projectId: string
  bomItems: BomItem[]
  machines: Machine[]
  materials: Material[]
  onUpdate: (items: BomItem[]) => void
}

const EMPTY_FORM = {
  part_number: '', part_name: '', color: '',
  cavity: 1, weight_g: 0, yield_rate: 0.97,
  material_id: '', material_spec: '',
  colorant_id: '', colorant_pct: 0,
  ink_id: '', ink_qty_per_pc: 0,
  machine_id: '', cycle_time_s: 60,
  metal_insert_name: '', metal_insert_qty: 0, metal_insert_unit_price: 0,
}

export function BomEditor({ projectId, bomItems, machines, materials, onUpdate }: Props) {
  const [open, setOpen] = useState(false)
  const [toolOpen, setToolOpen] = useState(false)
  const [editItem, setEditItem] = useState<BomItem | null>(null)
  const [toolItem, setToolItem] = useState<BomItem | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [imageUrl, setImageUrl] = useState('')

  const resins = materials.filter(m => m.type === 'resin')
  const colorants = materials.filter(m => m.type === 'colorant')
  const inks = materials.filter(m => m.type === 'ink')
  const metalInserts = materials.filter(m => m.type === 'metal_insert')

  function openNew() {
    setForm({ ...EMPTY_FORM })
    setImageUrl('')
    setEditItem(null)
    setOpen(true)
  }

  function openEdit(item: BomItem) {
    setForm({
      part_number: item.part_number ?? '',
      part_name: item.part_name ?? '',
      color: item.color ?? '',
      cavity: item.cavity,
      weight_g: item.weight_g,
      yield_rate: item.yield_rate,
      material_id: item.material_id ?? '',
      material_spec: item.material_spec ?? '',
      colorant_id: item.colorant_id ?? '',
      colorant_pct: item.colorant_pct,
      ink_id: item.ink_id ?? '',
      ink_qty_per_pc: item.ink_qty_per_pc,
      machine_id: item.machine_id ?? '',
      cycle_time_s: item.cycle_time_s,
      metal_insert_name: item.metal_insert_name ?? '',
      metal_insert_qty: item.metal_insert_qty ?? 0,
      metal_insert_unit_price: item.metal_insert_unit_price ?? 0,
    })
    setImageUrl(item.image_url ?? '')
    setEditItem(item)
    setOpen(true)
  }

  async function handleUploadImage(file: File) {
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `bom/${projectId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
    if (error) { toast.error('Upload ảnh thất bại'); setUploading(false); return }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    setImageUrl(data.publicUrl)
    setUploading(false)
    toast.success('Đã upload ảnh')
  }

  async function fetchItems() {
    const supabase = createClient()
    const { data } = await supabase
      .from('bom_items')
      .select('*, material:materials!material_id(*), colorant:materials!colorant_id(*), ink:materials!ink_id(*), machine:machines(*), tool_cost:tool_costs(*)')
      .eq('project_id', projectId)
      .order('sort_order')
    onUpdate(data ?? [])
  }

  async function handleSave() {
    if (!form.machine_id) { toast.error('Vui lòng chọn máy ép'); return }
    if (!form.material_id) { toast.error('Vui lòng chọn loại nhựa'); return }
    if (form.weight_g <= 0) { toast.error('Trọng lượng phải > 0'); return }
    setSaving(true)
    const supabase = createClient()
    const payload = {
      project_id: projectId,
      sort_order: editItem?.sort_order ?? bomItems.length,
      part_number: form.part_number || null,
      part_name: form.part_name || null,
      color: form.color || null,
      cavity: form.cavity,
      weight_g: form.weight_g,
      yield_rate: form.yield_rate,
      material_id: form.material_id || null,
      material_spec: form.material_spec || null,
      colorant_id: (form.colorant_id && form.colorant_id !== '__none__') ? form.colorant_id : null,
      colorant_pct: form.colorant_pct,
      ink_id: (form.ink_id && form.ink_id !== '__none__') ? form.ink_id : null,
      ink_qty_per_pc: form.ink_qty_per_pc,
      machine_id: form.machine_id || null,
      cycle_time_s: form.cycle_time_s,
      metal_insert_name: form.metal_insert_name || null,
      metal_insert_qty: form.metal_insert_qty,
      metal_insert_unit_price: form.metal_insert_unit_price,
      image_url: imageUrl || null,
      updated_at: new Date().toISOString(),
    }

    let error
    if (editItem) {
      ({ error } = await supabase.from('bom_items').update(payload).eq('id', editItem.id))
    } else {
      ({ error } = await supabase.from('bom_items').insert(payload))
    }

    if (error) { toast.error('Lỗi: ' + error.message) }
    else {
      toast.success(editItem ? 'Đã cập nhật' : 'Đã thêm chi tiết')
      setOpen(false)
      await fetchItems()
    }
    setSaving(false)
  }

  async function handleDelete(item: BomItem) {
    if (!confirm(`Xóa chi tiết ${item.part_number ?? item.part_name}?`)) return
    const supabase = createClient()
    const { error } = await supabase.from('bom_items').delete().eq('id', item.id)
    if (error) toast.error('Lỗi xóa: ' + error.message)
    else { toast.success('Đã xóa'); await fetchItems() }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Danh sách BOM ({bomItems.length} chi tiết)</h2>
        <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus size={16} className="mr-2" />Thêm chi tiết
        </Button>
      </div>

      {bomItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-gray-400">
            <Wrench size={40} className="mx-auto mb-3 opacity-40" />
            <p>Chưa có chi tiết nào. Nhấn "Thêm chi tiết" để bắt đầu.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bomItems.map((item, idx) => (
            <Card key={item.id} className="border hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.image_url
                      ? <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      : <Image size={24} className="text-gray-300" />
                    }
                  </div>
                  {/* Info */}
                  <div className="flex-1 grid grid-cols-3 gap-x-6 gap-y-1 text-sm">
                    <div>
                      <span className="text-gray-500">Part#: </span>
                      <span className="font-mono font-medium">{item.part_number ?? '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tên: </span>
                      <span>{item.part_name ?? '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Màu: </span>
                      <span>{item.color ?? '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Nhựa: </span>
                      <span className="font-medium">{item.material?.name ?? '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Trọng lượng: </span>
                      <span>{item.weight_g}g</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Cavity: </span>
                      <span>{item.cavity}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Máy: </span>
                      <span>{item.machine?.code ?? '—'} ({item.machine?.tonnage ?? '?'}T)</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Chu kỳ ép: </span>
                      <span>{item.cycle_time_s}s</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Khuôn: </span>
                      {item.tool_cost
                        ? <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                            {new Intl.NumberFormat('vi-VN').format(item.tool_cost.tool_price)} ₫
                          </Badge>
                        : <Badge className="bg-gray-100 text-gray-500 border-0 text-xs">Chưa có</Badge>
                      }
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={() => { setToolItem(item); setToolOpen(true) }}>
                      <Wrench size={14} className="mr-1" />Khuôn
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(item)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* BOM Dialog — landscape */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Sửa chi tiết BOM' : 'Thêm chi tiết BOM'}</DialogTitle>
          </DialogHeader>

          {/* Layout: 3 columns side by side */}
          <div className="grid grid-cols-3 gap-x-6 gap-y-0 py-2">

            {/* ── Cột 1: Thông tin cơ bản ── */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b pb-1">Thông tin cơ bản</p>
              <div className="space-y-1.5">
                <Label>Part Number</Label>
                <Input placeholder="710012407" value={form.part_number} onChange={e => setForm(f => ({ ...f, part_number: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Tên sản phẩm</Label>
                <Input placeholder="Tên chi tiết" value={form.part_name} onChange={e => setForm(f => ({ ...f, part_name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Màu sắc</Label>
                <Input placeholder="Black / GRY24520UV..." value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Cavity (số lòng khuôn)</Label>
                <Input type="number" min="1" value={form.cavity} onChange={e => setForm(f => ({ ...f, cavity: +e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Trọng lượng sản phẩm (g)</Label>
                <Input type="number" step="0.001" min="0" value={form.weight_g} onChange={e => setForm(f => ({ ...f, weight_g: +e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Tỷ lệ đạt (Yield Rate)</Label>
                <Input type="number" step="0.01" min="0" max="1" value={form.yield_rate} onChange={e => setForm(f => ({ ...f, yield_rate: +e.target.value }))} />
              </div>

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b pb-1 pt-2">Thông số ép</p>
              <div className="space-y-1.5">
                <Label>Máy ép *</Label>
                <Select value={form.machine_id} onValueChange={v => setForm(f => ({ ...f, machine_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Chọn máy..." /></SelectTrigger>
                  <SelectContent>
                    {machines.map(m => <SelectItem key={m.id} value={m.id}>{m.code} — {m.tonnage}T ({m.kwh}kWh)</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Chu kỳ ép (giây)</Label>
                <Input type="number" min="1" value={form.cycle_time_s} onChange={e => setForm(f => ({ ...f, cycle_time_s: +e.target.value }))} />
              </div>
            </div>

            {/* ── Cột 2: Nguyên vật liệu nhựa ── */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b pb-1">Nguyên vật liệu nhựa</p>
              <div className="space-y-1.5">
                <Label>Loại nhựa *</Label>
                <Select value={form.material_id} onValueChange={v => setForm(f => ({ ...f, material_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Chọn nhựa..." /></SelectTrigger>
                  <SelectContent>
                    {resins.map(m => <SelectItem key={m.id} value={m.id}>{m.name} — {new Intl.NumberFormat('vi-VN').format(m.unit_price)}đ/kg</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Đặc tính nhựa</Label>
                <Input placeholder="33GF, max 20% Regrind..." value={form.material_spec} onChange={e => setForm(f => ({ ...f, material_spec: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Bột màu</Label>
                <Select value={form.colorant_id} onValueChange={v => setForm(f => ({ ...f, colorant_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Chọn bột màu..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Không có</SelectItem>
                    {colorants.map(m => <SelectItem key={m.id} value={m.id}>{m.name} — {new Intl.NumberFormat('vi-VN').format(m.unit_price)}đ/kg</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tỷ lệ bột màu (%)</Label>
                <Input type="number" step="0.1" min="0" max="100" value={form.colorant_pct * 100} onChange={e => setForm(f => ({ ...f, colorant_pct: +e.target.value / 100 }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Mực in</Label>
                <Select value={form.ink_id} onValueChange={v => setForm(f => ({ ...f, ink_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Chọn mực in..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Không có</SelectItem>
                    {inks.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Lượng mực in / sản phẩm (g)</Label>
                <Input type="number" step="0.001" min="0" value={form.ink_qty_per_pc} onChange={e => setForm(f => ({ ...f, ink_qty_per_pc: +e.target.value }))} />
              </div>
            </div>

            {/* ── Cột 3: Kim loại insert + ảnh ── */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider border-b border-teal-200 pb-1">Kim Loại / Metal Insert</p>
              <div className="space-y-1.5">
                <Label>Loại kim loại insert</Label>
                <Select value={form.metal_insert_name || '__none__'} onValueChange={v => {
                  if (v === '__none__') {
                    setForm(f => ({ ...f, metal_insert_name: '', metal_insert_unit_price: 0 }))
                  } else {
                    const m = metalInserts.find(x => x.id === v)
                    setForm(f => ({ ...f, metal_insert_name: m?.name ?? v, metal_insert_unit_price: m?.unit_price ?? 0 }))
                  }
                }}>
                  <SelectTrigger><SelectValue placeholder="Chọn kim loại..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Không có</SelectItem>
                    {metalInserts.map(m => <SelectItem key={m.id} value={m.id}>{m.name} — {new Intl.NumberFormat('vi-VN').format(m.unit_price)}đ/cái</SelectItem>)}
                  </SelectContent>
                </Select>
                {metalInserts.length === 0 && (
                  <p className="text-xs text-gray-400">Thêm kim loại tại Cài đặt → Nguyên vật liệu</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Số lượng / sản phẩm (cái)</Label>
                <Input type="number" min="0" value={form.metal_insert_qty} onChange={e => setForm(f => ({ ...f, metal_insert_qty: +e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Đơn giá (VND/cái)</Label>
                <Input type="number" min="0" step="100" value={form.metal_insert_unit_price} onChange={e => setForm(f => ({ ...f, metal_insert_unit_price: +e.target.value }))} />
              </div>
              {form.metal_insert_qty > 0 && form.metal_insert_unit_price > 0 && (
                <div className="bg-teal-50 rounded-lg p-3 text-sm border border-teal-100">
                  <span className="text-gray-500">Chi phí insert / sp: </span>
                  <span className="font-semibold text-teal-700">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(form.metal_insert_qty * form.metal_insert_unit_price)}
                  </span>
                </div>
              )}

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b pb-1 pt-2">Hình ảnh sản phẩm</p>
              <div className="space-y-1.5">
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadImage(f) }} />
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    <Image size={16} className="mr-2" />{uploading ? 'Đang upload...' : 'Chọn ảnh'}
                  </Button>
                  {imageUrl && <img src={imageUrl} alt="" className="w-12 h-12 object-cover rounded" />}
                </div>
              </div>
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

      {/* Tool Cost Dialog */}
      {toolItem && (
        <ToolCostDialog
          open={toolOpen}
          onOpenChange={setToolOpen}
          bomItem={toolItem}
          onSaved={fetchItems}
        />
      )}
    </div>
  )
}
