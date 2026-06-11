'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
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

  function generateCode() {
    const now = new Date()
    const yy = String(now.getFullYear()).slice(2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const rand = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')
    return `GPM${yy}${mm}T${rand}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.customer_name.trim()) { toast.error('Vui lòng nhập tên khách hàng'); return }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Phiên đăng nhập hết hạn'); setLoading(false); return }

    const { data, error } = await supabase.from('projects').insert({
      ...form, code: generateCode(), status: 'draft', created_by: user.id,
    }).select().single()

    if (error) { toast.error('Lỗi: ' + error.message) }
    else { toast.success('Đã tạo dự án ' + data.code); router.push(`/projects/${data.id}`) }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard"><ArrowLeft size={16} className="mr-1" />Quay lại</Link>
        </Button>
        <h1 className="text-xl font-bold text-gray-900">Tạo dự án mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Thông tin khách hàng</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Tên công ty / Khách hàng *</Label>
              <Input placeholder="VD: Anh Nghia ANCL Co., Ltd" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Người liên hệ</Label>
              <Input placeholder="Mr. Nguyen Phi Long" value={form.customer_contact} onChange={e => set('customer_contact', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Số điện thoại</Label>
              <Input placeholder="0938 266 838" value={form.customer_phone} onChange={e => set('customer_phone', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="contact@company.com" value={form.customer_email} onChange={e => set('customer_email', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Ngày nhận yêu cầu</Label>
              <Input type="date" value={form.received_date} onChange={e => set('received_date', e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Địa chỉ</Label>
              <Input placeholder="Địa chỉ khách hàng" value={form.customer_address} onChange={e => set('customer_address', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Yêu cầu</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tiêu đề / Mô tả yêu cầu</Label>
              <Input placeholder="VD: Yêu cầu báo giá các LK đúc nhựa" value={form.subject} onChange={e => set('subject', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Ghi chú</Label>
              <Textarea rows={3} placeholder="Ghi chú thêm..." value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild><Link href="/dashboard">Hủy</Link></Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo dự án'}
          </Button>
        </div>
      </form>
    </div>
  )
}
