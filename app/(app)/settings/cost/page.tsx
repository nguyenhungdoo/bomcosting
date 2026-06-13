'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { DollarSign, Save } from 'lucide-react'
import type { CostSettings } from '@/types/database'

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box' as const,
  padding: '9px 12px', borderRadius: '8px',
  border: '1.5px solid #e2e8f0', fontSize: '13px',
  background: '#f8fafc', outline: 'none',
}

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
    const { error } = await createClient().from('cost_settings').update({ ...settings, updated_at: new Date().toISOString() }).eq('id', 1)
    if (error) toast.error('Lỗi: ' + error.message)
    else toast.success('Đã lưu thông số chi phí')
    setSaving(false)
  }

  if (!settings) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94a3b8' }}>Đang tải...</div>
  )

  const fixedCostFields = [
    { key: 'overhead_factory',   label: 'Nhà xưởng',     color: '#6366f1' },
    { key: 'overhead_admin',     label: 'Quản lý',        color: '#8b5cf6' },
  ]
  const variableCostFields = [
    { key: 'overhead_qc',        label: 'Phối liệu + QC', color: '#0ea5e9' },
    { key: 'overhead_packaging', label: 'Đóng gói',        color: '#f59e0b' },
    { key: 'overhead_shipping',  label: 'Vận chuyển',      color: '#10b981' },
    { key: 'overhead_profit',    label: 'Lợi nhuận',       color: '#ef4444' },
  ]
  const allOverheadFields = [...fixedCostFields, ...variableCostFields]
  const totalOverhead = allOverheadFields.reduce((sum, f) => sum + (settings as any)[f.key], 0) * 100

  return (
    <div className="page-root" style={{ padding: '32px', minHeight: '100vh', background: '#f0f4f8' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={19} color="#16a34a" />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Thông số chi phí</h1>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Cấu hình giá điện, lương và overhead</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '9px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #1e5ab4, #0ea5e9)', color: 'white',
            fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
          }}>
            <Save size={14} />{saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>

        {/* General settings */}
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #1e5ab4, #0ea5e9, #38bdf8)' }} />
          <div style={{ padding: '20px 24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Thông số chung</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                { key: 'labor_cost_per_month', label: 'Lương công nhân / tháng (VND)', step: 500000 },
                { key: 'electricity_price',    label: 'Giá điện (VND/kWh)',            step: 100 },
                { key: 'usd_rate',             label: 'Tỷ giá USD (VND/$)',            step: 100 },
                { key: 'working_hours_per_day',label: 'Giờ làm / ngày',               step: 0.25 },
                { key: 'depreciation_months',  label: 'Khấu hao máy (tháng)',         step: 12 },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{f.label}</label>
                  <input style={inputStyle} type="number" step={f.step}
                    value={(settings as any)[f.key]}
                    onChange={e => setField(f.key as keyof CostSettings, +e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed costs */}
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🏭</div>
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Định phí (Fixed Cost)</h2>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>Chi phí cố định không thay đổi theo sản lượng</p>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748b' }}>
                Tổng: <strong style={{ color: '#6366f1' }}>{(fixedCostFields.reduce((s, f) => s + (settings as any)[f.key], 0) * 100).toFixed(1)}%</strong>
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {fixedCostFields.map(f => {
                const val = (settings as any)[f.key] * 100
                return (
                  <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '4px', height: '36px', borderRadius: '2px', background: f.color, flexShrink: 0 }} />
                    <span style={{ width: '150px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>{f.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input type="number" step="0.1" min="0" max="100"
                        style={{ ...inputStyle, width: '80px', textAlign: 'right' }}
                        value={val.toFixed(1)}
                        onChange={e => setField(f.key as keyof CostSettings, +e.target.value / 100)} />
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>%</span>
                    </div>
                    <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: f.color, borderRadius: '3px', width: `${Math.min(val, 100)}%`, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Variable costs */}
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #0ea5e9, #10b981, #ef4444)' }} />
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>📦</div>
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Biến phí (Variable Cost)</h2>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>Chi phí thay đổi theo sản lượng và đơn hàng</p>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748b' }}>
                Tổng: <strong style={{ color: '#0ea5e9' }}>{(variableCostFields.reduce((s, f) => s + (settings as any)[f.key], 0) * 100).toFixed(1)}%</strong>
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {variableCostFields.map(f => {
                const val = (settings as any)[f.key] * 100
                return (
                  <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '4px', height: '36px', borderRadius: '2px', background: f.color, flexShrink: 0 }} />
                    <span style={{ width: '150px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>{f.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input type="number" step="0.1" min="0" max="100"
                        style={{ ...inputStyle, width: '80px', textAlign: 'right' }}
                        value={val.toFixed(1)}
                        onChange={e => setField(f.key as keyof CostSettings, +e.target.value / 100)} />
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>%</span>
                    </div>
                    <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: f.color, borderRadius: '3px', width: `${Math.min(val, 100)}%`, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Tổng Overhead + Lợi nhuận</span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: totalOverhead > 100 ? '#ef4444' : '#0f172a' }}>{totalOverhead.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
