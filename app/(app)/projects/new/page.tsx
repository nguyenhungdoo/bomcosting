'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Building2, FileText, Plus, Upload, X, ImageIcon } from 'lucide-react'
import Link from 'next/link'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
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

  async function handleLogoUpload(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('Chỉ chấp nhận file ảnh'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Ảnh tối đa 2MB'); return }
    setLogoUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `customer-logos/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
    if (error) { toast.error('Upload thất bại: ' + error.message); setLogoUploading(false); return }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    setLogoUrl(data.publicUrl)
    setLogoUploading(false)
    toast.success('Đã upload logo')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.customer_name.trim()) { toast.error('Vui lòng nhập tên khách hàng'); return }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Phiên đăng nhập hết hạn'); setLoading(false); return }

    const { data, error } = await supabase.from('projects').insert({
      ...form,
      customer_logo_url: logoUrl ?? null,
      code: generateCode(form.customer_name),
      status: 'draft',
      created_by: user.id,
    }).select().single()

    if (error) { toast.error('Lỗi: ' + error.message) }
    else { toast.success('Đã tạo dự án ' + data.code); router.push(`/projects/${data.id}`) }
    setLoading(false)
  }

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all bg-white placeholder:text-gray-400"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5"

  return (
    <div className="page-root min-h-screen bg-gray-50/50 p-8">
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

            {/* Logo upload + customer name row */}
            <div className="flex gap-4 mb-4 items-start">
              {/* Logo upload zone */}
              <div>
                <label className={labelClass}>Logo KH</label>
                <div
                  onClick={() => !logoUploading && fileRef.current?.click()}
                  style={{
                    width: '88px', height: '88px', borderRadius: '14px', flexShrink: 0,
                    border: logoUrl ? '2px solid #c7d2fe' : '2px dashed #cbd5e1',
                    background: logoUrl ? 'white' : '#f8fafc',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: logoUploading ? 'wait' : 'pointer',
                    position: 'relative', overflow: 'hidden',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => { if (!logoUrl) (e.currentTarget as HTMLElement).style.borderColor = '#6366f1' }}
                  onMouseLeave={e => { if (!logoUrl) (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1' }}
                >
                  {logoUrl ? (
                    <>
                      <img src={logoUrl} alt="Logo KH" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setLogoUrl(null) }}
                        style={{
                          position: 'absolute', top: '4px', right: '4px',
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: 'rgba(239,68,68,0.85)', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <X size={11} color="white" />
                      </button>
                    </>
                  ) : logoUploading ? (
                    <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', padding: '8px' }}>
                      Đang upload...
                    </div>
                  ) : (
                    <>
                      <ImageIcon size={22} color="#94a3b8" />
                      <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', textAlign: 'center', lineHeight: 1.3 }}>
                        Upload<br />logo
                      </span>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); e.target.value = '' }}
                />
              </div>

              {/* Customer name */}
              <div className="flex-1">
                <label className={labelClass}>Tên công ty / Khách hàng <span className="text-red-500">*</span></label>
                <input className={inputClass} placeholder="VD: Anh Nghia ANCL Co., Ltd"
                  value={form.customer_name} onChange={e => set('customer_name', e.target.value)} required />
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                  Hỗ trợ PNG, JPG, SVG · Tối đa 2MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Người liên hệ</label>
                <input className={inputClass} placeholder="Mr. Nguyen Van A"
                  value={form.customer_contact} onChange={e => set('customer_contact', e.target.value)} />
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
