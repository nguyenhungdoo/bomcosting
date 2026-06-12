'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Users, Search, X, ImageIcon, Building2, Phone, Mail, MapPin } from 'lucide-react'

interface Customer {
  id: string
  name: string
  contact?: string
  email?: string
  phone?: string
  address?: string
  logo_url?: string
  created_at: string
}

const EMPTY = { name: '', contact: '', email: '', phone: '', address: '', logo_url: '' }

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<Customer | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const { data } = await createClient().from('customers').select('*').order('name')
    setCustomers(data ?? [])
  }
  useEffect(() => { load() }, [])

  function openNew() { setForm({ ...EMPTY }); setEdit(null); setOpen(true) }
  function openEdit(c: Customer) {
    setForm({ name: c.name, contact: c.contact ?? '', email: c.email ?? '', phone: c.phone ?? '', address: c.address ?? '', logo_url: c.logo_url ?? '' })
    setEdit(c); setOpen(true)
  }

  async function handleLogoUpload(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('Chỉ chấp nhận file ảnh'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Ảnh tối đa 2MB'); return }
    setLogoUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `customer-logos/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
    if (error) { toast.error('Upload thất bại'); setLogoUploading(false); return }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    setForm(f => ({ ...f, logo_url: data.publicUrl }))
    setLogoUploading(false)
    toast.success('Đã upload logo')
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Nhập tên khách hàng'); return }
    setSaving(true)
    const supabase = createClient()
    const payload = {
      name: form.name.trim(),
      contact: form.contact || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      logo_url: form.logo_url || null,
      updated_at: new Date().toISOString(),
    }
    const { error } = edit
      ? await supabase.from('customers').update(payload).eq('id', edit.id)
      : await supabase.from('customers').insert(payload)
    if (error) toast.error('Lỗi: ' + error.message)
    else { toast.success(edit ? 'Đã cập nhật' : 'Đã thêm khách hàng'); setOpen(false); load() }
    setSaving(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Xóa khách hàng "${name}"?`)) return
    await createClient().from('customers').delete().eq('id', id)
    toast.success('Đã xóa')
    load()
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.contact ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '9px 12px',
    borderRadius: '10px', border: '1.5px solid #e2e8f0',
    fontSize: '13px', background: '#f8fafc', outline: 'none',
  }

  return (
    <div className="page-root" style={{ padding: '32px', minHeight: '100vh', background: '#f0f4f8' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={19} color="#1d4ed8" />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Danh bạ khách hàng</h1>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>{customers.length} khách hàng</p>
            </div>
          </div>
          <button onClick={openNew} style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '9px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #1e5ab4, #0ea5e9)', color: 'white',
            fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
          }}>
            <Plus size={15} />Thêm khách hàng
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            style={{ ...inputStyle, paddingLeft: '38px', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
            placeholder="Tìm theo tên hoặc người liên hệ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '60px 32px', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Users size={24} color="#1d4ed8" />
            </div>
            <p style={{ fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              {search ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào'}
            </p>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
              {search ? 'Thử tìm với từ khóa khác' : 'Thêm khách hàng đầu tiên để bắt đầu'}
            </p>
            {!search && (
              <button onClick={openNew} style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #1e5ab4, #0ea5e9)', color: 'white', fontSize: '13px', fontWeight: 700 }}>
                <Plus size={14} style={{ display: 'inline', marginRight: '6px' }} />Thêm khách hàng
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }} className="customer-grid">
            {filtered.map(c => (
              <div key={c.id} style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', position: 'relative' }}>
                {/* Actions */}
                <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '6px' }}>
                  <button onClick={() => openEdit(c)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#64748b' }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(c.id, c.name)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#ef4444' }}>
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Logo + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {c.logo_url
                      ? <img src={c.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                      : <span style={{ fontWeight: 800, fontSize: '18px', color: '#1e5ab4' }}>{c.name[0].toUpperCase()}</span>
                    }
                  </div>
                  <div style={{ minWidth: 0, paddingRight: '60px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                    {c.contact && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{c.contact}</div>}
                  </div>
                </div>

                {/* Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {c.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569' }}>
                      <Phone size={12} color="#94a3b8" />{c.phone}
                    </div>
                  )}
                  {c.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Mail size={12} color="#94a3b8" />{c.email}
                    </div>
                  )}
                  {c.address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#475569' }}>
                      <MapPin size={12} color="#94a3b8" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{c.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #1e5ab4, #0ea5e9, #38bdf8)' }} />
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {edit ? 'Sửa khách hàng' : 'Thêm khách hàng mới'}
                </h2>
                <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Logo upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                <div
                  onClick={() => !logoUploading && fileRef.current?.click()}
                  style={{ width: '72px', height: '72px', borderRadius: '12px', border: form.logo_url ? '2px solid #bfdbfe' : '2px dashed #cbd5e1', background: form.logo_url ? 'white' : '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden', flexShrink: 0 }}
                >
                  {form.logo_url ? (
                    <>
                      <img src={form.logo_url} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
                      <button type="button" onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, logo_url: '' })) }}
                        style={{ position: 'absolute', top: '3px', right: '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(239,68,68,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={10} color="white" />
                      </button>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={20} color="#94a3b8" />
                      <span style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px', textAlign: 'center', lineHeight: 1.3 }}>{logoUploading ? 'Đang up...' : 'Logo'}</span>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); e.target.value = '' }} />
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Tên công ty / Khách hàng <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input style={inputStyle} placeholder="Anh Nghia ANCL Co., Ltd"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { key: 'contact', label: 'Người liên hệ', placeholder: 'Mr. Nguyen Van A' },
                  { key: 'phone',   label: 'Số điện thoại', placeholder: '0938 266 838' },
                  { key: 'email',   label: 'Email',          placeholder: 'contact@company.com' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{label}</label>
                    <input style={inputStyle} placeholder={placeholder}
                      value={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Địa chỉ</label>
                  <input style={inputStyle} placeholder="Địa chỉ công ty"
                    value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => setOpen(false)} style={{ padding: '9px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  Hủy
                </button>
                <button onClick={handleSave} disabled={saving} style={{ padding: '9px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #1e5ab4, #0ea5e9)', color: 'white', fontSize: '13px', fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Đang lưu...' : (edit ? 'Cập nhật' : 'Lưu khách hàng')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .customer-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .customer-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
