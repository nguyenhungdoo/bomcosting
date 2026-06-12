'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Building2, Phone, Mail, MapPin, FileText, StickyNote, Calendar, Plus } from 'lucide-react'
import Link from 'next/link'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    customer_name: '', customer_contact: '', customer_email: '',
    customer_phone: '', customer_address: '', subject: '',
    received_date: new Date().toISOString().split('T')[0], notes: '',
  })

  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  function generateCode(customerName: string) {
    const prefix = customerName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3).padEnd(3, 'X')
    const now = new Date()
    const yy = String(now.getFullYear()).slice(2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const seq = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')
    return `${prefix}${yy}${mm}${seq}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.customer_name.trim()) { toast.error('Vui lòng nhập tên khách hàng'); return }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Phiên đăng nhập hết hạn'); setLoading(false); return }

    const { data, error } = await supabase.from('projects').insert({
      ...form, code: generateCode(form.customer_name), status: 'draft', created_by: user.id,
    }).select().single()

    if (error) { toast.error('Lỗi: ' + error.message) }
    else { toast.success('Đã tạo dự án ' + data.code); router.push(`/projects/${data.id}`) }
    setLoading(false)
  }

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all bg-white placeholder:text-gray-400"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5"

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard"
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all shadow-sm">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tạo dự án mới</h1>
            <p className="text-sm text-gray-500">Nhập thông tin khách hàng và yêu cầu báo giá</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Building2 size={16} className="text-indigo-600" />
              </div>
              <h2 className="font-semibold text-gray-800">Thông tin khách hàng</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Tên công ty / Khách hàng <span className="text-red-500">*</span></label>
                <input className={inputClass} placeholder="VD: Anh Nghia ANCL Co., Ltd"
                  value={form.customer_name} onChange={e => set('customer_name', e.target.value)} required />
              </div>
              <div>
                <label className={labelClass}>Người liên hệ</label>
                <div className="relative">
                  <input className={inputClass + ' pl-9'} placeholder="Mr. Nguyen Van A"
                    value={form.customer_contact} onChange={e => set('customer_contact', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Số điện thoại</label>
                <input className={inputClass} placeholder="0938 266 838"
                  value={form.customer_phone} onChange={e => set('customer_phone', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass} type="email" placeholder="contact@company.com"
                  value={form.customer_email} onChange={e => set('customer_email', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Ngày nhận yêu cầu</label>
                <input className={inputClass} type="date"
                  value={form.received_date} onChange={e => set('received_date', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Địa chỉ</label>
                <input className={inputClass} placeholder="Địa chỉ công ty khách hàng"
                  value={form.customer_address} onChange={e => set('customer_address', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Request info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <FileText size={16} className="text-indigo-600" />
              </div>
              <h2 className="font-semibold text-gray-800">Yêu cầu báo giá</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Tiêu đề / Mô tả yêu cầu</label>
                <input className={inputClass} placeholder="VD: Yêu cầu báo giá các LK đúc nhựa cho máy XYZ"
                  value={form.subject} onChange={e => set('subject', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Ghi chú</label>
                <textarea className={inputClass + ' resize-none'} rows={3} placeholder="Ghi chú thêm về yêu cầu..."
                  value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Link href="/dashboard"
              className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
              Hủy
            </Link>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all shadow-md shadow-indigo-200 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {loading ? 'Đang tạo...' : <><Plus size={15} />Tạo dự án</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
