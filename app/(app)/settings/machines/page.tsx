'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Machine } from '@/types/database'

const EMPTY = { code: '', tonnage: 0, kwh: 0, original_value: 0, depreciation_years: 10, notes: '' }

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<Machine | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('machines').select('*').order('tonnage')
    setMachines(data ?? [])
  }
  useEffect(() => { load() }, [])

  function openNew() { setForm({ ...EMPTY }); setEdit(null); setOpen(true) }
  function openEdit(m: Machine) {
    setForm({ code: m.code, tonnage: m.tonnage, kwh: m.kwh, original_value: m.original_value, depreciation_years: m.depreciation_years, notes: m.notes ?? '' })
    setEdit(m); setOpen(true)
  }

  async function handleSave() {
    if (!form.code) { toast.error('Nhập mã máy'); return }
    setSaving(true)
    const supabase = createClient()
    let error
    if (edit) {
      ({ error } = await supabase.from('machines').update(form).eq('id', edit.id))
    } else {
      ({ error } = await supabase.from('machines').insert(form))
    }
    if (error) toast.error('Lỗi: ' + error.message)
    else { toast.success('Đã lưu'); setOpen(false); load() }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa máy này?')) return
    const supabase = createClient()
    await supabase.from('machines').delete().eq('id', id)
    load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Danh mục máy ép</h1>
        <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus size={16} className="mr-2" />Thêm máy
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600">
                <th className="text-left px-4 py-3">Mã máy</th>
                <th className="text-right px-4 py-3">Lực kẹp (T)</th>
                <th className="text-right px-4 py-3">Điện (kWh)</th>
                <th className="text-right px-4 py-3">Nguyên giá (VND)</th>
                <th className="text-right px-4 py-3">KH (năm)</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {machines.map(m => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium">{m.code}</td>
                  <td className="px-4 py-3 text-right">{m.tonnage}</td>
                  <td className="px-4 py-3 text-right">{m.kwh}</td>
                  <td className="px-4 py-3 text-right font-mono">{new Intl.NumberFormat('vi-VN').format(m.original_value)}</td>
                  <td className="px-4 py-3 text-right">{m.depreciation_years}</td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => openEdit(m)}><Pencil size={13} /></Button>
                    <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDelete(m.id)}><Trash2 size={13} /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit ? 'Sửa máy ép' : 'Thêm máy ép'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            {[
              { key: 'code', label: 'Mã máy', type: 'text', placeholder: 'IN-110' },
              { key: 'tonnage', label: 'Lực kẹp (tấn)', type: 'number' },
              { key: 'kwh', label: 'Điện tiêu thụ (kWh)', type: 'number' },
              { key: 'original_value', label: 'Nguyên giá (VND)', type: 'number' },
              { key: 'depreciation_years', label: 'Khấu hao (năm)', type: 'number' },
            ].map(f => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-sm font-medium">{f.label}</label>
                <Input type={f.type} placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? +e.target.value : e.target.value }))} />
              </div>
            ))}
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
