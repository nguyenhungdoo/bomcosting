'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import type { Material, MaterialType } from '@/types/database'

const typeConfig: Record<MaterialType, { label: string; color: string; bg: string }> = {
  resin:    { label: 'Nhựa',    color: '#1d4ed8', bg: '#dbeafe' },
  colorant: { label: 'Bột màu', color: '#92400e', bg: '#fef3c7' },
  ink:      { label: 'Mực in',  color: '#6b21a8', bg: '#f3e8ff' },
  other:    { label: 'Khác',    color: '#374151', bg: '#f3f4f6' },
}

const EMPTY = { code: '', name: '', type: 'resin' as MaterialType, unit_price: 0, unit: 'kg', supplier: '', notes: '' }

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box' as const,
  padding: '9px 12px', borderRadius: '8px',
  border: '1.5px solid #e2e8f0', fontSize: '13px',
  background: '#f8fafc', outline: 'none',
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<Material | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await createClient().from('materials').select('*').order('type').order('name')
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
    const { error } = edit
      ? await supabase.from('materials').update(payload).eq('id', edit.id)
      : await supabase.from('materials').insert(payload)
    if (error) toast.error('Lỗi: ' + error.message)
    else { toast.success('Đã lưu'); setOpen(false); load() }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa vật liệu này?')) return
    await createClient().from('materials').delete().eq('id', id)
    load()
  }

  const filtered = filter === 'all' ? materials : materials.filter(m => m.type === filter)
  const filters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'resin', label: 'Nhựa' },
    { key: 'colorant', label: 'Bột màu' },
    { key: 'ink', label: 'Mực in' },
    { key: 'other', label: 'Khác' },
  ]

  return (
    <div className="page-root" style={{ padding: '32px', minHeight: '100vh', background: '#f0f4f8' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={19} color="#1d4ed8" />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Danh mục nguyên vật liệu</h1>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>{materials.length} vật liệu trong hệ thống</p>
            </div>
          </div>
          <button onClick={openNew} style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '9px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #1e5ab4, #0ea5e9)', color: 'white',
            fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
          }}>
            <Plus size={15} />Thêm vật liệu
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
              background: filter === f.key ? 'linear-gradient(135deg, #1e5ab4, #0ea5e9)' : 'white',
              color: filter === f.key ? 'white' : '#475569',
              boxShadow: filter === f.key ? '0 2px 8px rgba(14,165,233,0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
            }}>{f.label}</button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #1e5ab4, #0ea5e9, #38bdf8)' }} />
          <div className="table-scroll">
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['Mã', 'Tên vật liệu', 'Loại', 'Đơn giá (VND)', 'Đơn vị', 'Nhà cung cấp', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Đơn giá (VND)' ? 'right' : 'left', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const tc = typeConfig[m.type] ?? typeConfig.other
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#1e5ab4', fontWeight: 600 }}>{m.code}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{m.name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, color: tc.color, background: tc.bg }}>{tc.label}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>{new Intl.NumberFormat('vi-VN').format(m.unit_price)}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{m.unit}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>{m.supplier ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', opacity: 0 }}
                        className="row-actions"
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0'}>
                        <button onClick={() => openEdit(m)} style={{ padding: '6px', borderRadius: '7px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#64748b' }}><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(m.id)} style={{ padding: '6px', borderRadius: '7px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>Chưa có vật liệu nào</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader><DialogTitle>{edit ? 'Sửa vật liệu' : 'Thêm vật liệu mới'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            {[
              { key: 'code', label: 'Mã', placeholder: 'PA6', span: 1 },
              { key: 'name', label: 'Tên *', placeholder: 'PA6 (Nylon 6)', span: 1 },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{f.label}</label>
                <input style={inputStyle} placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Loại</label>
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
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Đơn vị</label>
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
            <div className="col-span-2">
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Đơn giá (VND / {form.unit})</label>
              <input style={inputStyle} type="number" min="0"
                value={form.unit_price}
                onChange={e => setForm(f => ({ ...f, unit_price: +e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Nhà cung cấp</label>
              <input style={inputStyle} value={form.supplier}
                onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Ghi chú</label>
              <Textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setOpen(false)} style={{ padding: '9px 16px', borderRadius: '9px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Hủy</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '9px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #1e5ab4, #0ea5e9)', color: 'white', fontSize: '13px', fontWeight: 700 }}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
