import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PDF generation using HTML → browser print is simpler and avoids @react-pdf/renderer server issues
// We return HTML that can be printed to PDF via browser
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
  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)
  const refNo = `${project?.code}-${String(quot.revision).padStart(2,'0')}`

  const html = `<!DOCTYPE html>
<html lang="${isVN ? 'vi' : 'en'}">
<head>
<meta charset="UTF-8">
<title>${isVN ? 'Báo giá' : 'Quotation'} ${refNo}</title>
<style>
  @page { size: A4; margin: 15mm; }
  @media print { body { print-color-adjust: exact; } .no-print { display: none; } }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #333; }
  h1 { font-size: 18px; color: #4338ca; text-align: center; margin: 0; }
  .header { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px; border-bottom: 2px solid #4338ca; padding-bottom: 12px; }
  .company { font-size: 10px; line-height: 1.6; }
  .company strong { font-size: 12px; }
  .ref { text-align: right; font-size: 10px; line-height: 1.8; }
  .customer { background: #f5f5f5; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; font-size: 10px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10px; }
  th { background: #4338ca; color: white; padding: 6px 8px; text-align: left; }
  td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #f9fafb; }
  .price { font-weight: bold; color: #4338ca; }
  .notes { font-size: 9px; color: #666; line-height: 1.8; }
  .footer { margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .sign-box { border: 1px solid #ccc; border-radius: 4px; padding: 12px; text-align: center; min-height: 60px; }
  .print-btn { position: fixed; top: 10px; right: 10px; background: #4338ca; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 13px; }
</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">🖨️ In PDF</button>

<div class="header">
  <div class="company">
    <strong>CÔNG TY CỔ PHẦN CÔNG NGHIỆP ELASTEC</strong><br>
    Số 41 Đường số 7, KCN Việt Nam-Singapore III<br>
    Phường Tân Uyên, TP. Hồ Chí Minh, Việt Nam<br>
    Tel: +84 274 3543 574 | Fax: +84 274 3543 572<br>
    Contact: Đỗ Tư Nguyên Hùng | +84 909 543 579
  </div>
  <div class="ref">
    <h1>${isVN ? 'BẢNG BÁO GIÁ' : 'QUOTATION'}</h1>
    <br>
    <strong>${isVN ? 'Số báo giá:' : 'Ref #:'}</strong> ${refNo}<br>
    <strong>${isVN ? 'Ngày:' : 'Date:'}</strong> ${today.toLocaleDateString(isVN ? 'vi-VN' : 'en-GB')}<br>
    <strong>${isVN ? 'Hiệu lực đến:' : 'Valid until:'}</strong> ${validUntil.toLocaleDateString(isVN ? 'vi-VN' : 'en-GB')}<br>
    <strong>Rev:</strong> ${quot.revision}
  </div>
</div>

<div class="customer">
  <strong>${isVN ? 'Kính gửi:' : 'To:'}</strong> ${project?.customer_name ?? ''}
  ${project?.customer_contact ? ` — ${project.customer_contact}` : ''}
  ${project?.customer_email ? ` — ${project.customer_email}` : ''}
</div>

<table>
  <thead>
    <tr>
      <th>#</th>
      <th>${isVN ? 'Mã SP' : 'P/N'}</th>
      <th>${isVN ? 'Nguyên liệu' : 'Material'}</th>
      <th style="text-align:center">Cav</th>
      <th style="text-align:right">${isVN ? 'Giá khuôn (VND)' : 'Mold (VND)'}</th>
      <th style="text-align:right">${isVN ? 'Đơn giá VND' : 'Price USD'}</th>
      <th style="text-align:right">MOQ 500</th>
      <th style="text-align:right">MOQ 1,000</th>
    </tr>
  </thead>
  <tbody>
    ${(quot.items ?? []).map((item: any, i: number) => {
      const bom = bomMap[item.bom_item_id] as any
      const priceMain = isVN ? fmt(item.unit_price_vnd) : item.unit_price_usd?.toFixed(4)
      const moq500 = isVN ? fmt(item.unit_price_vnd) : item.unit_price_usd?.toFixed(4)
      const moq1000 = isVN ? fmt(Math.ceil(item.unit_price_vnd * 0.92)) : (item.unit_price_usd * 0.92)?.toFixed(4)
      return `<tr>
        <td>${i+1}</td>
        <td style="font-family:monospace">${bom?.part_number ?? '—'}</td>
        <td>${bom?.material?.name ?? ''}${bom?.material_spec ? ' — '+bom.material_spec : ''}${bom?.color ? ' ('+bom.color+')' : ''}</td>
        <td style="text-align:center">${bom?.cavity ?? ''}</td>
        <td style="text-align:right;font-family:monospace">${item.tool_price_vnd > 0 ? fmt(item.tool_price_vnd) : '—'}</td>
        <td style="text-align:right;font-family:monospace" class="price">${priceMain}</td>
        <td style="text-align:right;font-family:monospace">${moq500}</td>
        <td style="text-align:right;font-family:monospace">${moq1000}</td>
      </tr>`
    }).join('')}
  </tbody>
</table>

<div class="notes">
  ${isVN ? `
  * Giá trên chưa bao gồm thuế VAT<br>
  * Giao hàng tại kho GPMI cho đơn hàng từ 50.000.000 đồng<br>
  * Đóng gói: Túi PP / thùng carton<br>
  * Thời gian hoàn thành khuôn: ${quot.delivery_mold_days} ngày làm việc kể từ ngày nhận PO<br>
  * Thời gian sản xuất sản phẩm: ${quot.delivery_production_days} ngày làm việc kể từ ngày nhận PO<br>
  * Khuôn: Đặt cọc ${quot.payment_mold_deposit}% khi nhận PO, 50% sau khi duyệt mẫu<br>
  * Sản phẩm: Cọc 30% khi nhận PO, thanh toán 70% còn lại trong 15 ngày kể từ ngày nhận HĐ tài chính
  ` : `
  + Price excludes VAT<br>
  + Incoterm: ${quot.incoterm}<br>
  + Packaging: Carton<br>
  + Mold lead time: ${quot.delivery_mold_days} working days from PO<br>
  + Production lead time: ${quot.delivery_production_days} working days from PO<br>
  + Mold: ${quot.payment_mold_deposit}% T/T in advance, 50% after confirmed sample<br>
  + PO: 30% T/T after PO confirmation, 70% against draft shipping docs
  `}
</div>

<div class="footer">
  <div class="sign-box">
    <div style="margin-bottom:30px">${isVN ? 'Xác nhận của khách hàng' : "Customer's confirmation"}</div>
    <div style="font-size:9px;color:#999">${isVN ? 'Ký tên và đóng dấu' : 'Signature & stamp'}</div>
  </div>
  <div class="sign-box">
    <div style="margin-bottom:4px">${isVN ? 'Đại diện công ty' : 'Company representative'}</div>
    <div style="font-size:9px">Đỗ Tư Nguyên Hùng</div>
    <div style="font-size:9px;color:#666">+84 909 543 579</div>
    <div style="margin-top:20px;font-size:9px;color:#999">${isVN ? 'Ký tên' : 'Signature'}</div>
  </div>
</div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
