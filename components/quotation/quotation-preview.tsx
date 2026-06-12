'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Download, X } from 'lucide-react'
import type { Project, Quotation, BomItem, QuotationItem } from '@/types/database'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  quotation: Quotation
  project: Project
  bomItems: BomItem[]
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n))
const fmtUSD = (n: number) => n.toFixed(4)

export function QuotationPreview({ open, onOpenChange, quotation, project, bomItems }: Props) {
  const isVN = quotation.lang === 'vn'
  const items = (quotation.items ?? []) as QuotationItem[]
  const today = new Date(quotation.created_at)
  const validUntil = new Date(today.getTime() + quotation.validity_days * 86400000)
  const bomMap = Object.fromEntries(bomItems.map(b => [b.id, b]))
  const refNo = `${project.code}-Rev${String(quotation.revision).padStart(2, '0')}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{
          maxWidth: '980px', maxHeight: '92vh', overflow: 'hidden',
          padding: 0, borderRadius: '16px', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc', borderRadius: '16px 16px 0 0', flexShrink: 0,
        }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
              {isVN ? 'Xem báo giá' : 'Quotation Preview'} — {refNo}
            </span>
            <span style={{ marginLeft: '10px', fontSize: '12px', color: '#64748b' }}>
              {isVN ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <a
              href={`/api/export/pdf?quotId=${quotation.id}`}
              target="_blank"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '8px', textDecoration: 'none',
                background: 'linear-gradient(135deg, #1e5ab4, #0ea5e9)', color: 'white',
                fontSize: '12px', fontWeight: 700,
              }}
            >
              <Download size={13} />In PDF
            </a>
            <button
              onClick={() => onOpenChange(false)}
              style={{ padding: '7px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}
            >
              <X size={14} color="#64748b" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px 28px', background: 'white' }}>

          {/* ── HEADER ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', paddingBottom: '16px', borderBottom: '3px solid #1e5ab4', marginBottom: '18px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <img src="/elastec-logo.png.jpeg" alt="Elastec" style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '8px' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0a1628' }}>CÔNG TY CỔ PHẦN CÔNG NGHIỆP ELASTEC</div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: 1.7 }}>
                  Số 41 Đường số 7, KCN Việt Nam–Singapore III, Tân Uyên, TP. HCM<br />
                  Tel: +84 274 3543 574 &nbsp;|&nbsp; Fax: +84 274 3543 572<br />
                  Contact: Đỗ Tư Nguyên Hùng &nbsp;|&nbsp; +84 909 543 579
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: '200px' }}>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#1e5ab4' }}>
                {isVN ? 'BẢNG BÁO GIÁ SẢN PHẨM NHỰA' : 'PLASTIC PARTS QUOTATION'}
              </div>
              <table style={{ marginTop: '8px', marginLeft: 'auto', fontSize: '11px', borderCollapse: 'collapse' }}>
                {([
                  [isVN ? 'Số báo giá' : 'Quotation No.', refNo],
                  [isVN ? 'Ngày' : 'Date', today.toLocaleDateString(isVN ? 'vi-VN' : 'en-GB')],
                  [isVN ? 'Có hiệu lực đến' : 'Valid until', validUntil.toLocaleDateString(isVN ? 'vi-VN' : 'en-GB')],
                  ['Rev', String(quotation.revision)],
                ] as [string, string][]).map(([label, val]) => (
                  <tr key={label}>
                    <td style={{ color: '#64748b', paddingRight: '10px', paddingBottom: '2px' }}>{label}:</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{val}</td>
                  </tr>
                ))}
              </table>
            </div>
          </div>

          {/* ── CUSTOMER ── */}
          <div style={{ background: '#f0f6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 16px', marginBottom: '18px', fontSize: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 20px' }}>
              <div><span style={{ color: '#64748b' }}>{isVN ? 'Kính gửi' : 'Attention'}: </span><strong style={{ color: '#0f172a' }}>{project.customer_name}</strong></div>
              {project.customer_contact && <div><span style={{ color: '#64748b' }}>{isVN ? 'Người phụ trách' : 'Contact'}: </span><span>{project.customer_contact}</span></div>}
              {project.customer_address && <div><span style={{ color: '#64748b' }}>{isVN ? 'Địa chỉ' : 'Address'}: </span><span>{project.customer_address}</span></div>}
              {project.customer_phone && <div><span style={{ color: '#64748b' }}>{isVN ? 'Điện thoại' : 'Phone'}: </span><span>{project.customer_phone}</span></div>}
              {project.customer_email && <div><span style={{ color: '#64748b' }}>Email: </span><span>{project.customer_email}</span></div>}
              {project.subject && <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#64748b' }}>{isVN ? 'Nội dung' : 'Subject'}: </span><span>{project.subject}</span></div>}
            </div>
          </div>

          {/* ── TABLE ── */}
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr>
                  {[
                    { label: isVN ? 'STT' : 'No.', align: 'center' },
                    { label: isVN ? 'Mã SP' : 'Part No.', align: 'left' },
                    { label: isVN ? 'Tên chi tiết' : 'Part Name', align: 'left' },
                    { label: isVN ? 'Vật liệu / Màu' : 'Material / Color', align: 'left' },
                    { label: isVN ? 'TL (g/cái)' : 'Weight (g)', align: 'right' },
                    { label: 'Cav', align: 'center' },
                    { label: isVN ? 'Giá khuôn (VND)' : 'Mold (VND)', align: 'right' },
                    { label: isVN ? 'Giá khuôn (USD)' : 'Mold (USD)', align: 'right' },
                    { label: isVN ? 'Đơn giá (VND/cái)' : 'Unit Price (VND)', align: 'right' },
                    { label: isVN ? 'Đơn giá (USD/pc)' : 'Unit Price (USD)', align: 'right' },
                    { label: isVN ? 'Ghi chú' : 'Notes', align: 'left' },
                  ].map((h, i) => (
                    <th key={i} style={{
                      padding: '8px 10px', textAlign: h.align as any,
                      background: '#0a1628', color: 'white', fontWeight: 700, fontSize: '10px',
                      whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.1)',
                    }}>{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const bom = bomMap[item.bom_item_id]
                  const mat = [bom?.material?.name, bom?.material_spec].filter(Boolean).join(' ')
                  const color = bom?.color ? ` / ${bom.color}` : ''
                  return (
                    <tr key={item.id} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>{i + 1}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', fontFamily: 'monospace', fontWeight: 600, color: '#1e5ab4', whiteSpace: 'nowrap' }}>{bom?.part_number ?? '—'}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#0f172a', minWidth: '110px' }}>{bom?.part_name ?? '—'}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', color: '#475569', whiteSpace: 'nowrap' }}>{mat}{color}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontFamily: 'monospace', color: '#475569' }}>{bom?.weight_g ? bom.weight_g.toFixed(1) : '—'}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#475569' }}>{bom?.cavity ?? '—'}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontFamily: 'monospace', color: '#374151' }}>{item.tool_price_vnd > 0 ? fmt(item.tool_price_vnd) : '—'}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontFamily: 'monospace', color: '#374151' }}>{item.tool_price_usd > 0 ? fmtUSD(item.tool_price_usd) : '—'}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#1e5ab4', whiteSpace: 'nowrap' }}>{fmt(item.unit_price_vnd)}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#0369a1', whiteSpace: 'nowrap' }}>{fmtUSD(item.unit_price_usd)}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '10px' }}></td>
                    </tr>
                  )
                })}
                {items.length === 0 && (
                  <tr><td colSpan={11} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Chưa có sản phẩm</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── TERMS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#0a1628', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {isVN ? 'Điều khoản & Điều kiện' : 'Terms & Conditions'}
              </div>
              <div style={{ fontSize: '11px', color: '#374151', lineHeight: 2 }}>
                {isVN ? <>
                  <div>✦ Giá chưa bao gồm thuế VAT 10%</div>
                  <div>✦ Thời gian làm khuôn: <strong>{quotation.delivery_mold_days}</strong> ngày làm việc từ khi nhận PO</div>
                  <div>✦ Thời gian làm mẫu T1: <strong>{quotation.delivery_sample_days}</strong> ngày sau khi hoàn thành khuôn</div>
                  <div>✦ Thời gian sản xuất: <strong>{quotation.delivery_production_days}</strong> ngày làm việc từ khi nhận PO</div>
                  <div>✦ Đóng gói: Túi PP / thùng carton tiêu chuẩn</div>
                  <div>✦ Giao hàng: EXW kho ELASTEC, Bình Dương</div>
                  <div>✦ Báo giá có hiệu lực <strong>{quotation.validity_days}</strong> ngày kể từ ngày báo giá</div>
                </> : <>
                  <div>✦ Price excludes 10% VAT</div>
                  <div>✦ Mold lead time: <strong>{quotation.delivery_mold_days}</strong> working days from PO</div>
                  <div>✦ T1 sample lead time: <strong>{quotation.delivery_sample_days}</strong> days after mold completion</div>
                  <div>✦ Production lead time: <strong>{quotation.delivery_production_days}</strong> working days from PO</div>
                  <div>✦ Packaging: PP bag / standard carton</div>
                  <div>✦ Incoterm: {quotation.incoterm || 'EXW ELASTEC, Binh Duong'}</div>
                  <div>✦ Quotation valid for <strong>{quotation.validity_days}</strong> days from date of issue</div>
                </>}
              </div>
            </div>
            <div style={{ background: '#f0f6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#0a1628', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {isVN ? 'Điều khoản thanh toán' : 'Payment Terms'}
              </div>
              <div style={{ fontSize: '11px', color: '#374151', lineHeight: 2 }}>
                {isVN ? <>
                  <div style={{ fontWeight: 700, color: '#1e5ab4' }}>KHUÔN MẪU:</div>
                  <div>✦ Đặt cọc <strong>{quotation.payment_mold_deposit}%</strong> khi ký hợp đồng / nhận PO</div>
                  <div>✦ Thanh toán phần còn lại sau khi nghiệm thu mẫu T1</div>
                  <div style={{ fontWeight: 700, color: '#1e5ab4', marginTop: '6px' }}>SẢN PHẨM:</div>
                  <div>✦ Đặt cọc 30% khi nhận PO</div>
                  <div>✦ Thanh toán 70% trong 15 ngày kể từ ngày nhận hóa đơn</div>
                </> : <>
                  <div style={{ fontWeight: 700, color: '#1e5ab4' }}>TOOLING:</div>
                  <div>✦ <strong>{quotation.payment_mold_deposit}%</strong> T/T in advance upon PO confirmation</div>
                  <div>✦ Balance payment after T1 sample approval</div>
                  <div style={{ fontWeight: 700, color: '#1e5ab4', marginTop: '6px' }}>PRODUCTION:</div>
                  <div>✦ 30% T/T in advance upon PO</div>
                  <div>✦ 70% T/T within 15 days against invoice</div>
                </>}
              </div>
            </div>
          </div>

          {/* ── SIGNATURES ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', textAlign: 'center' }}>
              {project.customer_logo_url && (
                <img src={project.customer_logo_url} alt="Logo KH" style={{ height: '32px', objectFit: 'contain', margin: '0 auto 8px', display: 'block' }} />
              )}
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#374151' }}>{isVN ? 'ĐẠI DIỆN BÊN MUA' : "BUYER'S REPRESENTATIVE"}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '50px' }}>{isVN ? 'Ký tên, đóng dấu' : 'Signature & Stamp'}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#0f172a' }}>{project.customer_name}</div>
            </div>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', textAlign: 'center', background: '#f8fafc' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#374151' }}>{isVN ? 'ĐẠI DIỆN BÊN BÁN' : "SELLER'S REPRESENTATIVE"}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '32px' }}>{isVN ? 'Ký tên' : 'Signature'}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>Đỗ Tư Nguyên Hùng</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>CÔNG TY CỔ PHẦN CÔNG NGHIỆP ELASTEC</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>+84 909 543 579</div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
