import type { BomItem, CostSettings, QuotationItem } from '@/types/database'

export interface CostBreakdown {
  // Gia công
  electricity_cost_per_shot: number
  depreciation_cost_per_shot: number
  labor_cost_per_shot: number
  processing_cost_per_pc: number
  // NVL
  resin_cost_per_pc: number
  colorant_cost_per_pc: number
  ink_cost_per_pc: number
  metal_insert_cost_per_pc: number
  material_cost_per_pc: number
  // Tổng
  base_cost_per_pc: number
  total_overhead_pct: number
  unit_price_vnd: number
  unit_price_usd: number
  // Năng suất
  capacity_daily: number
  capacity_monthly: number
}

export function calcCost(item: BomItem, settings: CostSettings, overrides?: Partial<CostSettings>): CostBreakdown {
  const s = { ...settings, ...overrides }

  const machine = item.machine
  if (!machine) {
    return zeroCost(s)
  }

  // --- Chi phí điện ---
  // Điện/12h ca = KWH × đơn giá × 12
  const elec_per_12h = machine.kwh * s.electricity_price * 12
  // Điện/shot = elec_per_12h / (shots per 12h)
  const shots_per_12h = (s.working_hours_per_day * 3600) / item.cycle_time_s * item.cavity
  const electricity_cost_per_shot = shots_per_12h > 0 ? elec_per_12h / shots_per_12h : 0

  // --- Chi phí khấu hao máy ---
  // Khấu hao/ca 12h = nguyên giá / (depreciation_months × 30 ngày × 2 ca/ngày)
  const depreciation_per_12h = machine.original_value / (s.depreciation_months * 30 * 2)
  const depreciation_cost_per_shot = shots_per_12h > 0 ? depreciation_per_12h / shots_per_12h : 0

  // --- Chi phí nhân công ---
  // 1 công nhân/máy, lương tháng / (26 ngày × 2 ca × 12h/ca × 3600s/h) × cycle_time
  const labor_per_hour = s.labor_cost_per_month / (26 * 2 * 12)
  const labor_per_12h = labor_per_hour * 12
  const labor_cost_per_shot = shots_per_12h > 0 ? labor_per_12h / shots_per_12h : 0

  // Chi phí gia công / 1 sản phẩm
  const processing_cost_per_pc = (electricity_cost_per_shot + depreciation_cost_per_shot + labor_cost_per_shot)

  // --- Nguyên vật liệu ---
  const resin_price = item.material?.unit_price ?? 0
  // Trọng lượng thực = weight_g / yield_rate (tính hao hụt)
  const effective_weight_g = item.yield_rate > 0 ? item.weight_g / item.yield_rate : item.weight_g
  const resin_cost_per_pc = (effective_weight_g / 1000) * resin_price

  const colorant_price = item.colorant?.unit_price ?? 0
  const colorant_cost_per_pc = (item.weight_g / 1000) * item.colorant_pct * colorant_price

  const ink_price = item.ink?.unit_price ?? 0
  const ink_cost_per_pc = item.ink_qty_per_pc * ink_price

  const metal_insert_cost_per_pc = (item.metal_insert_qty ?? 0) * (item.metal_insert_unit_price ?? 0)

  const material_cost_per_pc = resin_cost_per_pc + colorant_cost_per_pc + ink_cost_per_pc + metal_insert_cost_per_pc

  // --- Tổng giá thành cơ bản ---
  const base_cost_per_pc = processing_cost_per_pc + material_cost_per_pc

  // --- Overhead + Lợi nhuận ---
  const total_overhead_pct =
    s.overhead_factory +
    s.overhead_qc +
    s.overhead_packaging +
    s.overhead_admin +
    s.overhead_shipping +
    s.overhead_profit

  const unit_price_vnd = Math.ceil(base_cost_per_pc * (1 + total_overhead_pct))
  const unit_price_usd = s.usd_rate > 0 ? unit_price_vnd / s.usd_rate : 0

  // --- Năng suất ---
  const capacity_daily = shots_per_12h
  const capacity_monthly = capacity_daily * 26

  return {
    electricity_cost_per_shot,
    depreciation_cost_per_shot,
    labor_cost_per_shot,
    processing_cost_per_pc,
    resin_cost_per_pc,
    colorant_cost_per_pc,
    ink_cost_per_pc,
    metal_insert_cost_per_pc,
    material_cost_per_pc,
    base_cost_per_pc,
    total_overhead_pct,
    unit_price_vnd,
    unit_price_usd,
    capacity_daily,
    capacity_monthly,
  }
}

function zeroCost(s: CostSettings): CostBreakdown {
  const total_overhead_pct = s.overhead_factory + s.overhead_qc + s.overhead_packaging + s.overhead_admin + s.overhead_shipping + s.overhead_profit
  return {
    electricity_cost_per_shot: 0, depreciation_cost_per_shot: 0, labor_cost_per_shot: 0,
    processing_cost_per_pc: 0, resin_cost_per_pc: 0, colorant_cost_per_pc: 0,
    ink_cost_per_pc: 0, metal_insert_cost_per_pc: 0, material_cost_per_pc: 0, base_cost_per_pc: 0,
    total_overhead_pct, unit_price_vnd: 0, unit_price_usd: 0,
    capacity_daily: 0, capacity_monthly: 0,
  }
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount)
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(amount)
}
