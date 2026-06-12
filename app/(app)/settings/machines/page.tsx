'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Wrench, Zap, DollarSign } from 'lucide-react'
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

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"

  return (
    <div className="page-root min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Wrench size={20} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Danh mục máy ép</h1>
              <p className="text-sm text-gray-500">{machines.length} máy trong hệ thống</p>
            </div>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md shadow-indigo-200 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Plus size={16} />Thêm máy
          </button>
        </div>

        {/* Stats summary */}
        <div className="stats-grid grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Tổng số máy', value: machines.length, icon: Wrench, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Lực kẹp lớn nhất', value: machines.length ? `${Math.max(...machines.map(m => m.tonnage))}T` : '—', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Tiêu thụ điện TB', value: machines.length ? `${(machines.reduce((s, m) => s + m.kwh, 0) / machines.length).toFixed(1)} kWh` : '—', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={stat.color} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="table-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mã máy</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Lực kẹp (T)</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Điện (kWh)</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nguyên giá (VND)</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">KH (năm)</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {machines.map(m => (
                <tr key={m.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-indigo-600 font-semibold text-xs bg-indigo-50 px-2.5 py-1 rounded-lg">{m.code}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-gray-800">{m.tonnage}</td>
                  <td className="px-5 py-3.5 text-right text-gray-600">{m.kwh}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-gray-800 text-xs">
                    {new Intl.NumberFormat('vi-VN').format(m.original_value)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-gray-600">{m.depreciation_years}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(m)}
                        className="p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-all">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(m.id)}
                        className="p-2 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {machines.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <Wrench size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Chưa có máy nào</p>
                    <p className="text-xs mt-1">Nhấn "Thêm máy" để bắt đầu</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{edit ? 'Sửa máy ép' : 'Thêm máy ép mới'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-3">
            {[
              { key: 'code', label: 'Mã máy', type: 'text', placeholder: 'IN-110', span: 2 },
              { key: 'tonnage', label: 'Lực kẹp (tấn)', type: 'number', placeholder: '110' },
              { key: 'kwh', label: 'Điện (kWh)', type: 'number', placeholder: '15' },
              { key: 'original_value', label: 'Nguyên giá (VND)', type: 'number', placeholder: '500000000' },
              { key: 'depreciation_years', label: 'Khấu hao (năm)', type: 'number', placeholder: '10' },
            ].map(f => (
              <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} className={inputClass}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? +e.target.value : e.target.value }))} />
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
              Hủy
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
