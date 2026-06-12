import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const quotId = searchParams.get('quotId')
  if (!quotId) return NextResponse.json({ error: 'Missing quotId' }, { status: 400 })

  const supabase = await createClient()
  const { data: quot } = await supabase
    .from('quotations')
    .select('*, items:quotation_items(*)')
    .eq('id', quotId)
    .single()

  if (!quot) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: project } = await supabase.from('projects').select('*').eq('id', quot.project_id).single()
  const { data: bomItems } = await supabase
    .from('bom_items')
    .select('*, material:materials!material_id(*), machine:machines(*)')
    .eq('project_id', quot.project_id)
    .order('sort_order')

  const bomMap = Object.fromEntries((bomItems ?? []).map((b: any) => [b.id, b]))
  const isVN = quot.lang === 'vn'
  const today = new Date(quot.created_at)
  const validUntil = new Date(today.getTime() + quot.validity_days * 86400000)
  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n))
  const fmtUSD = (n: number) => Number(n).toFixed(4)
  const refNo = `${project?.code}-Rev${String(quot.revision).padStart(2, '0')}`

  const rows = (quot.items ?? []).map((item: any, i: number) => {
    const bom = bomMap[item.bom_item_id] as any
    const mat = [bom?.material?.name, bom?.material_spec].filter(Boolean).join(' ')
    const color = bom?.color ? ` / ${bom.color}` : ''
    return `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
      <td style="text-align:center;color:#64748b">${i + 1}</td>
      <td style="font-family:monospace;font-weight:600;color:#1e5ab4;white-space:nowrap">${bom?.part_number ?? '—'}</td>
      <td style="font-weight:600;color:#0f172a">${bom?.part_name ?? '—'}</td>
      <td style="color:#475569;white-space:nowrap">${mat}${color}</td>
      <td style="text-align:right;font-family:monospace;color:#475569">${bom?.weight_g ? Number(bom.weight_g).toFixed(1) : '—'}</td>
      <td style="text-align:center;color:#475569">${bom?.cavity ?? '—'}</td>
      <td style="text-align:right;font-family:monospace">${item.tool_price_vnd > 0 ? fmt(item.tool_price_vnd) : '—'}</td>
      <td style="text-align:right;font-family:monospace">${item.tool_price_usd > 0 ? fmtUSD(item.tool_price_usd) : '—'}</td>
      <td style="text-align:right;font-family:monospace;font-weight:700;color:#1e5ab4">${fmt(item.unit_price_vnd)}</td>
      <td style="text-align:right;font-family:monospace;font-weight:700;color:#0369a1">${fmtUSD(item.unit_price_usd)}</td>
      <td></td>
    </tr>`
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="${isVN ? 'vi' : 'en'}">
<head>
<meta charset="UTF-8">
<title>${isVN ? 'Báo giá' : 'Quotation'} ${refNo}</title>
<style>
  @page { size: A4 landscape; margin: 12mm 14mm; }
  @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } .no-print { display: none !important; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #333; background: white; }

  .print-btn { position: fixed; top: 12px; right: 12px; background: #1e5ab4; color: white; border: none; padding: 9px 18px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 700; z-index: 99; }

  /* Header */
  .header { display: grid; grid-template-columns: 1fr auto; gap: 20px; padding-bottom: 12px; border-bottom: 3px solid #1e5ab4; margin-bottom: 14px; }
  .company-block { display: flex; gap: 12px; align-items: flex-start; }
  .company-logo { width: 52px; height: 52px; object-fit: contain; border-radius: 6px; }
  .company-name { font-size: 12px; font-weight: 800; color: #0a1628; }
  .company-info { font-size: 9.5px; color: #475569; margin-top: 4px; line-height: 1.7; }
  .quot-ref { text-align: right; min-width: 200px; }
  .quot-title { font-size: 14px; font-weight: 900; color: #1e5ab4; }
  .ref-table { margin-top: 8px; margin-left: auto; font-size: 10px; border-collapse: collapse; }
  .ref-table td { padding-bottom: 2px; }
  .ref-table td:first-child { color: #64748b; padding-right: 10px; }
  .ref-table td:last-child { font-weight: 700; color: #0f172a; }

  /* Customer */
  .customer { background: #f0f6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; font-size: 10px; }
  .customer-label { color: #64748b; }
  .customer-value { font-weight: 600; color: #0f172a; }

  /* Table */
  table.items { width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 14px; }
  table.items th { background: #0a1628; color: white; padding: 7px 8px; font-weight: 700; font-size: 9px; white-space: nowrap; border-right: 1px solid rgba(255,255,255,0.1); }
  table.items td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }

  /* Terms */
  .terms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; }
  .terms-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; }
  .terms-box.blue { background: #f0f6ff; border-color: #bfdbfe; }
  .terms-title { font-size: 9px; font-weight: 800; color: #0a1628; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 7px; }
  .terms-body { font-size: 9.5px; color: #374151; line-height: 2; }
  .terms-sub { font-weight: 700; color: #1e5ab4; }

  /* Signatures */
  .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .sig-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; text-align: center; }
  .sig-box.seller { background: #f8fafc; }
  .sig-title { font-size: 10px; font-weight: 700; color: #374151; margin-bottom: 4px; }
  .sig-note { font-size: 9px; color: #94a3b8; margin-bottom: 44px; }
  .sig-name { font-size: 10px; font-weight: 700; color: #0f172a; }
  .sig-sub { font-size: 9px; color: #64748b; }
</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">🖨️ In PDF</button>

<div class="header">
  <div class="company-block">
    <img class="company-logo" src="/elastec-logo.png.jpeg" alt="Elastec" />
    <div>
      <div class="company-name">CÔNG TY CỔ PHẦN CÔNG NGHIỆP ELASTEC</div>
      <div class="company-info">
        Số 41 Đường số 7, KCN Việt Nam–Singapore III, Tân Uyên, TP. HCM<br>
        Tel: +84 274 3543 574 &nbsp;|&nbsp; Fax: +84 274 3543 572<br>
        Contact: Đỗ Tư Nguyên Hùng &nbsp;|&nbsp; +84 909 543 579
      </div>
    </div>
  </div>
  <div class="quot-ref">
    <div class="quot-title">${isVN ? 'BẢNG BÁO GIÁ SẢN PHẨM NHỰA' : 'PLASTIC PARTS QUOTATION'}</div>
    <table class="ref-table">
      <tr><td>${isVN ? 'Số báo giá' : 'Quotation No.'}</td><td>${refNo}</td></tr>
      <tr><td>${isVN ? 'Ngày' : 'Date'}</td><td>${today.toLocaleDateString(isVN ? 'vi-VN' : 'en-GB')}</td></tr>
      <tr><td>${isVN ? 'Có hiệu lực đến' : 'Valid until'}</td><td>${validUntil.toLocaleDateString(isVN ? 'vi-VN' : 'en-GB')}</td></tr>
      <tr><td>Rev</td><td>${quot.revision}</td></tr>
    </table>
  </div>
</div>

<div class="customer">
  <div><span class="customer-label">${isVN ? 'Kính gửi' : 'Attention'}: </span><span class="customer-value">${project?.customer_name ?? ''}</span></div>
  ${project?.customer_contact ? `<div><span class="customer-label">${isVN ? 'Người phụ trách' : 'Contact'}: </span><span>${project.customer_contact}</span></div>` : ''}
  ${project?.customer_address ? `<div><span class="customer-label">${isVN ? 'Địa chỉ' : 'Address'}: </span><span>${project.customer_address}</span></div>` : ''}
  ${project?.customer_phone ? `<div><span class="customer-label">${isVN ? 'Điện thoại' : 'Phone'}: </span><span>${project.customer_phone}</span></div>` : ''}
  ${project?.customer_email ? `<div><span class="customer-label">Email: </span><span>${project.customer_email}</span></div>` : ''}
  ${project?.subject ? `<div style="grid-column:1/-1"><span class="customer-label">${isVN ? 'Nội dung' : 'Subject'}: </span><span>${project.subject}</span></div>` : ''}
</div>

<table class="items">
  <thead>
    <tr>
      <th style="text-align:center">${isVN ? 'STT' : 'No.'}</th>
      <th style="text-align:left">${isVN ? 'Mã SP' : 'Part No.'}</th>
      <th style="text-align:left">${isVN ? 'Tên chi tiết' : 'Part Name'}</th>
      <th style="text-align:left">${isVN ? 'Vật liệu / Màu' : 'Material / Color'}</th>
      <th style="text-align:right">${isVN ? 'TL (g/cái)' : 'Weight (g)'}</th>
      <th style="text-align:center">Cav</th>
      <th style="text-align:right">${isVN ? 'Giá khuôn (VND)' : 'Mold (VND)'}</th>
      <th style="text-align:right">${isVN ? 'Giá khuôn (USD)' : 'Mold (USD)'}</th>
      <th style="text-align:right">${isVN ? 'Đơn giá (VND/cái)' : 'Unit Price (VND)'}</th>
      <th style="text-align:right">${isVN ? 'Đơn giá (USD/pc)' : 'Unit Price (USD)'}</th>
      <th style="text-align:left">${isVN ? 'Ghi chú' : 'Notes'}</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>

<div class="terms-grid">
  <div class="terms-box">
    <div class="terms-title">${isVN ? 'Điều khoản & Điều kiện' : 'Terms & Conditions'}</div>
    <div class="terms-body">
      ${isVN ? `
      ✦ Giá chưa bao gồm thuế VAT 10%<br>
      ✦ Thời gian làm khuôn: <strong>${quot.delivery_mold_days}</strong> ngày làm việc từ khi nhận PO<br>
      ✦ Thời gian làm mẫu T1: <strong>${quot.delivery_sample_days}</strong> ngày sau khi hoàn thành khuôn<br>
      ✦ Thời gian sản xuất: <strong>${quot.delivery_production_days}</strong> ngày làm việc từ khi nhận PO<br>
      ✦ Đóng gói: Túi PP / thùng carton tiêu chuẩn<br>
      ✦ Giao hàng: EXW kho ELASTEC, Bình Dương<br>
      ✦ Báo giá có hiệu lực <strong>${quot.validity_days}</strong> ngày kể từ ngày báo giá
      ` : `
      ✦ Price excludes 10% VAT<br>
      ✦ Mold lead time: <strong>${quot.delivery_mold_days}</strong> working days from PO<br>
      ✦ T1 sample lead time: <strong>${quot.delivery_sample_days}</strong> days after mold completion<br>
      ✦ Production lead time: <strong>${quot.delivery_production_days}</strong> working days from PO<br>
      ✦ Packaging: PP bag / standard carton<br>
      ✦ Incoterm: ${quot.incoterm || 'EXW ELASTEC, Binh Duong'}<br>
      ✦ Quotation valid for <strong>${quot.validity_days}</strong> days from date of issue
      `}
    </div>
  </div>
  <div class="terms-box blue">
    <div class="terms-title">${isVN ? 'Điều khoản thanh toán' : 'Payment Terms'}</div>
    <div class="terms-body">
      ${isVN ? `
      <span class="terms-sub">KHUÔN MẪU:</span><br>
      ✦ Đặt cọc <strong>${quot.payment_mold_deposit}%</strong> khi ký hợp đồng / nhận PO<br>
      ✦ Thanh toán phần còn lại sau khi nghiệm thu mẫu T1<br>
      <span class="terms-sub">SẢN PHẨM:</span><br>
      ✦ Đặt cọc 30% khi nhận PO<br>
      ✦ Thanh toán 70% trong 15 ngày kể từ ngày nhận hóa đơn
      ` : `
      <span class="terms-sub">TOOLING:</span><br>
      ✦ <strong>${quot.payment_mold_deposit}%</strong> T/T in advance upon PO confirmation<br>
      ✦ Balance payment after T1 sample approval<br>
      <span class="terms-sub">PRODUCTION:</span><br>
      ✦ 30% T/T in advance upon PO<br>
      ✦ 70% T/T within 15 days against invoice
      `}
    </div>
  </div>
</div>

<div class="sig-grid">
  <div class="sig-box">
    <div class="sig-title">${isVN ? 'ĐẠI DIỆN BÊN MUA' : "BUYER'S REPRESENTATIVE"}</div>
    <div class="sig-note">${isVN ? 'Ký tên, đóng dấu' : 'Signature & Stamp'}</div>
    <div class="sig-name">${project?.customer_name ?? ''}</div>
  </div>
  <div class="sig-box seller">
    <div class="sig-title">${isVN ? 'ĐẠI DIỆN BÊN BÁN' : "SELLER'S REPRESENTATIVE"}</div>
    <div class="sig-note">${isVN ? 'Ký tên' : 'Signature'}</div>
    <div class="sig-name">Đỗ Tư Nguyên Hùng</div>
    <div class="sig-sub">CÔNG TY CỔ PHẦN CÔNG NGHIỆP ELASTEC</div>
    <div class="sig-sub">+84 909 543 579</div>
  </div>
</div>

</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
