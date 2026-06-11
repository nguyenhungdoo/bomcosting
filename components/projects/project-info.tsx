'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { Project, ProjectStatus } from '@/types/database'

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'draft', label: 'Nháp' },
  { value: 'in_review', label: 'Đang xem xét' },
  { value: 'quoted', label: 'Đã báo giá' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'cancelled', label: 'Đã hủy' },
]

export function ProjectInfo({ project }: { project: Project }) {
  const [form, setForm] = useState({ ...project })
  const [saving, setSaving] = useState(false)
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('projects').update({
      customer_name: form.customer_name,
      customer_contact: form.customer_contact,
      customer_email: form.customer_email,
      customer_phone: form.customer_phone,
      customer_address: form.customer_address,
      subject: form.subject,
      received_date: form.received_date,
      status: form.status,
      notes: form.notes,
      updated_at: new Date().toISOString(),
    }).eq('id', project.id)
    if (error) toast.error('Lỗi lưu: ' + error.message)
    else toast.success('Đã lưu thông tin dự án')
    setSaving(false)
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <Card>
        <CardHeader><CardTitle className="text-base">Thông tin khách hàng</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label>Tên công ty / Khách hàng</Label>
            <Input value={form.customer_name ?? ''} onChange={e => set('customer_name', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Người liên hệ</Label>
            <Input value={form.customer_contact ?? ''} onChange={e => set('customer_contact', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Số điện thoại</Label>
            <Input value={form.customer_phone ?? ''} onChange={e => set('customer_phone', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={form.customer_email ?? ''} onChange={e => set('customer_email', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Ngày nhận yêu cầu</Label>
            <Input type="date" value={form.received_date?.split('T')[0] ?? ''} onChange={e => set('received_date', e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Địa chỉ</Label>
            <Input value={form.customer_address ?? ''} onChange={e => set('customer_address', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Trạng thái & Ghi chú</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tiêu đề yêu cầu</Label>
              <Input value={form.subject ?? ''} onChange={e => set('subject', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Trạng thái</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Ghi chú</Label>
            <Textarea rows={3} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>
    </div>
  )
}
