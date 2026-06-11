'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import type { CostSettings } from '@/types/database'

export default function CostSettingsPage() {
  const [settings, setSettings] = useState<CostSettings | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    createClient().from('cost_settings').select('*').eq('id', 1).single()
      .then(({ data }) => { if (data) setSettings(data) })
  }, [])

  function setField(key: keyof CostSettings, value: number) {
    setSettings(s => s ? { ...s, [key]: value } : s)
  }

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    const { error } = await createClient().from('cost_settings').update({
      ...settings, updated_at: new Date().toISOString(),
    }).eq('id', 1)
    if (error) toast.error('Lỗi: ' + error.message)
    else toast.success('Đã lưu thông số chi phí')
    setSaving(false)
  }

  if (!settings) return <div className="p-8 text-gray-400">Đang tải...</div>

  const totalOverhead = (settings.overhead_factory + settings.overhead_qc + settings.overhead_packaging + settings.overhead_admin + settings.overhead_shipping + settings.overhead_profit) * 100

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Thông số chi phí</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Thông số chung</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {[
            { key: 'labor_cost_per_month', label: 'Lương CN / tháng (VND)', step: 500000 },
            { key: 'electricity_price', label: 'Giá điện (VND/kWh)', step: 100 },
            { key: 'usd_rate', label: 'Tỷ giá USD (VND/$)', step: 100 },
            { key: 'working_hours_per_day', label: 'Giờ làm/ngày', step: 0.25 },
            { key: 'depreciation_months', label: 'Khấu hao máy (tháng)', step: 12 },
          ].map(f => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-sm font-medium">{f.label}</label>
              <Input type="number" step={f.step}
                value={(settings as any)[f.key]}
                onChange={e => setField(f.key as keyof CostSettings, +e.target.value)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Tỷ lệ overhead & lợi nhuận</span>
            <span className="text-sm font-normal text-gray-500">Tổng: <strong>{totalOverhead.toFixed(1)}%</strong></span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: 'overhead_factory', label: 'Nhà xưởng' },
            { key: 'overhead_qc', label: 'Phối liệu + QC' },
            { key: 'overhead_packaging', label: 'Đóng gói' },
            { key: 'overhead_admin', label: 'Quản lý' },
            { key: 'overhead_shipping', label: 'Vận chuyển' },
            { key: 'overhead_profit', label: '💰 Lợi nhuận' },
          ].map(f => (
            <div key={f.key} className="flex items-center gap-3">
              <span className="w-40 text-sm">{f.label}</span>
              <Input
                type="number" step="0.1" min="0" max="100" className="w-24"
                value={((settings as any)[f.key] * 100).toFixed(1)}
                onChange={e => setField(f.key as keyof CostSettings, +e.target.value / 100)}
              />
              <span className="text-gray-500 text-sm">%</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full">
                <div className="h-2 bg-indigo-400 rounded-full" style={{ width: `${Math.min((settings as any)[f.key] * 100, 100)}%` }} />
              </div>
            </div>
          ))}
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
