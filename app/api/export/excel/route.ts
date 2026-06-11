import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calcCost } from '@/lib/costing'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const quotId = searchParams.get('quotId')

  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  const supabase = await createClient()

  const [{ data: project }, { data: bomItems }, { data: settings }, { data: quotation }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', projectId).single(),
    supabase.from('bom_items').select('*, material:materials!material_id(*), colorant:materials!colorant_id(*), machine:machines(*), tool_cost:tool_costs(*)').eq('project_id', projectId).order('sort_order'),
    supabase.from('cost_settings').select('*').eq('id', 1).single(),
    quotId ? supabase.from('quotations').select('*, items:quotation_items(*)').eq('id', quotId).single() : Promise.resolve({ data: null }),
  ])

  if (!project || !settings) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const wb = XLSX.utils.book_new()

  // Sheet 1: BOM
  const bomData = [
    ['BILL OF MATERIALS', '', '', '', '', '', '', '', ''],
    [`Dự án: ${project.code}`, '', `Khách hàng: ${project.customer_name}`, '', '', '', '', '', ''],
    [],
    ['STT', 'Part Number', 'Tên SP', 'Màu sắc', 'Cavity', 'Trọng lượng (g)', 'Tỷ lệ đạt', 'Nhựa', 'Đặc tính', 'Máy ép', 'Chu kỳ (s)', 'Giá khuôn (VND)'],
    ...(bomItems ?? []).map((item: any, i: number) => [
      i + 1,
      item.part_number ?? '',
      item.part_name ?? '',
      item.color ?? '',
      item.cavity,
      item.weight_g,
      item.yield_rate,
      item.material?.name ?? '',
      item.material_spec ?? '',
      item.machine ? `${item.machine.code} (${item.machine.tonnage}T)` : '',
      item.cycle_time_s,
      item.tool_cost?.tool_price ?? 0,
    ]),
  ]
  const wsBom = XLSX.utils.aoa_to_sheet(bomData)
  XLSX.utils.book_append_sheet(wb, wsBom, 'BOM')

  // Sheet 2: Costing
  const costRows = [
    ['BẢNG TÍNH GIÁ THÀNH', '', '', '', '', '', '', '', ''],
    [`Dự án: ${project.code}`, '', `Khách hàng: ${project.customer_name}`, '', '', '', '', '', ''],
    [`Lương CN/tháng: ${settings.labor_cost_per_month}đ`, '', `Điện: ${settings.electricity_price}đ/kWh`, '', `Tỷ giá: ${settings.usd_rate}đ/$`],
    [],
    ['STT', 'Part Number', 'Tên SP', 'Máy ép', 'Chi phí điện/SP', 'Khấu hao/SP', 'Nhân công/SP', 'Gia công/SP', 'Nhựa/SP', 'Bột màu/SP', 'Tổng NVL/SP', 'Giá thành/SP', 'Overhead%', 'Giá bán VND', 'Giá bán USD'],
    ...(bomItems ?? []).map((item: any, i: number) => {
      const cost = calcCost(item, settings)
      return [
        i + 1,
        item.part_number ?? '',
        item.part_name ?? '',
        item.machine ? `${item.machine.code} (${item.machine.tonnage}T)` : '',
        Math.round(cost.electricity_cost_per_shot),
        Math.round(cost.depreciation_cost_per_shot),
        Math.round(cost.labor_cost_per_shot),
        Math.round(cost.processing_cost_per_pc),
        Math.round(cost.resin_cost_per_pc),
        Math.round(cost.colorant_cost_per_pc),
        Math.round(cost.material_cost_per_pc),
        Math.round(cost.base_cost_per_pc),
        `${(cost.total_overhead_pct * 100).toFixed(0)}%`,
        cost.unit_price_vnd,
        +cost.unit_price_usd.toFixed(6),
      ]
    }),
  ]
  const wsCost = XLSX.utils.aoa_to_sheet(costRows)
  XLSX.utils.book_append_sheet(wb, wsCost, 'COSTING')

  // Sheet 3: Báo giá (nếu có)
  if (quotation) {
    const q = quotation as any
    const quotRows = [
      ['BẢNG BÁO GIÁ', '', '', '', '', ''],
      [`Số BG: ${project.code}-${String(q.revision).padStart(2,'0')}`, '', `Ngày: ${new Date(q.created_at).toLocaleDateString('vi-VN')}`, '', '', ''],
      [`Khách hàng: ${project.customer_name}`],
      [],
      ['STT', 'Part Number', 'Nguyên liệu', 'Cavity', 'Giá khuôn (VND)', 'Đơn giá (VND)', 'Đơn giá (USD)', 'MOQ 500', 'MOQ 1000'],
      ...(q.items ?? []).map((item: any, i: number) => {
        const bom = (bomItems ?? []).find((b: any) => b.id === item.bom_item_id) as any
        return [
          i + 1,
          bom?.part_number ?? '',
          `${bom?.material?.name ?? ''} ${bom?.material_spec ?? ''}`.trim(),
          bom?.cavity ?? '',
          item.tool_price_vnd ?? 0,
          item.unit_price_vnd ?? 0,
          +(item.unit_price_usd ?? 0).toFixed(6),
          item.unit_price_vnd ?? 0,
          Math.ceil((item.unit_price_vnd ?? 0) * 0.92),
        ]
      }),
    ]
    const wsQuot = XLSX.utils.aoa_to_sheet(quotRows)
    XLSX.utils.book_append_sheet(wb, wsQuot, `BG_Rev${q.revision}`)
  }

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const filename = `${project.code}_BOM_Costing.xlsx`

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
