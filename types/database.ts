export type Role = 'sales' | 'technical' | 'director'
export type ProjectStatus = 'draft' | 'in_review' | 'quoted' | 'confirmed' | 'cancelled'
export type QuotationStatus = 'draft' | 'sent' | 'approved' | 'rejected'
export type MaterialType = 'resin' | 'colorant' | 'ink' | 'metal_insert' | 'other'
export type QuotationLang = 'vn' | 'en'

export interface Profile {
  id: string
  full_name: string
  role: Role
  created_at: string
}

export interface Machine {
  id: string
  code: string
  tonnage: number
  kwh: number
  original_value: number
  depreciation_years: number
  notes?: string
  created_at: string
}

export interface Material {
  id: string
  code: string
  name: string
  type: MaterialType
  unit_price: number
  unit: string
  supplier?: string
  notes?: string
  updated_at: string
  created_at: string
}

export interface CostSettings {
  id: number
  usd_rate: number
  labor_cost_per_month: number
  electricity_price: number
  working_hours_per_day: number
  depreciation_months: number
  overhead_factory: number
  overhead_qc: number
  overhead_packaging: number
  overhead_admin: number
  overhead_shipping: number
  overhead_profit: number
  updated_at: string
  updated_by?: string
}

export interface Project {
  id: string
  code: string
  customer_name: string
  customer_contact?: string
  customer_email?: string
  customer_phone?: string
  customer_address?: string
  customer_logo_url?: string
  subject?: string
  received_date?: string
  status: ProjectStatus
  notes?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface BomItem {
  id: string
  project_id: string
  sort_order: number
  part_number?: string
  part_name?: string
  color?: string
  cavity: number
  weight_g: number
  yield_rate: number
  material_id?: string
  material_spec?: string
  colorant_id?: string
  colorant_pct: number
  ink_id?: string
  ink_qty_per_pc: number
  machine_id?: string
  cycle_time_s: number
  metal_insert_name?: string
  metal_insert_qty: number
  metal_insert_unit_price: number
  image_url?: string
  created_at: string
  updated_at: string
  // joins
  material?: Material
  colorant?: Material
  ink?: Material
  machine?: Machine
  tool_cost?: ToolCost
}

export interface ToolCost {
  id: string
  bom_item_id: string
  tool_price: number
  tool_material_cost: number
  making_time_days: number
  service_life_shots: number
  supplier?: string
  notes?: string
  created_at: string
}

export interface Quotation {
  id: string
  project_id: string
  revision: number
  lang: QuotationLang
  validity_days: number
  moq_500: number
  moq_1000: number
  usd_rate: number
  overhead_factory: number
  overhead_qc: number
  overhead_packaging: number
  overhead_admin: number
  overhead_shipping: number
  overhead_profit: number
  delivery_mold_days: number
  delivery_sample_days: number
  delivery_production_days: number
  payment_mold_deposit: number
  incoterm: string
  status: QuotationStatus
  notes?: string
  created_by: string
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
  items?: QuotationItem[]
}

export interface QuotationItem {
  id: string
  quotation_id: string
  bom_item_id: string
  electricity_cost_per_shot: number
  depreciation_cost_per_shot: number
  labor_cost_per_shot: number
  processing_cost_per_pc: number
  resin_cost_per_pc: number
  colorant_cost_per_pc: number
  ink_cost_per_pc: number
  material_cost_per_pc: number
  base_cost_per_pc: number
  total_overhead_pct: number
  unit_price_vnd: number
  unit_price_usd: number
  tool_price_vnd: number
  tool_price_usd: number
  created_at: string
  bom_item?: BomItem
}
