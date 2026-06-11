-- ============================================================
-- BOMCOSTING DATABASE SCHEMA
-- ============================================================

-- PROFILES (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('sales','technical','director')),
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can view all profiles" on profiles for select using (auth.role() = 'authenticated');
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- MACHINES (danh mục máy ép)
create table machines (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  tonnage int not null,
  kwh numeric(6,2) not null,
  original_value bigint not null default 0,
  depreciation_years int not null default 10,
  notes text,
  created_at timestamptz default now()
);
alter table machines enable row level security;
create policy "Authenticated read machines" on machines for select using (auth.role() = 'authenticated');
create policy "Technical/Director manage machines" on machines for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('technical','director'))
);

-- MATERIALS (danh mục nguyên vật liệu: nhựa, bột màu, mực in)
create table materials (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  name text not null,
  type text not null check (type in ('resin','colorant','ink','other')),
  unit_price bigint not null default 0,
  unit text not null default 'kg',
  supplier text,
  notes text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);
alter table materials enable row level security;
create policy "Authenticated read materials" on materials for select using (auth.role() = 'authenticated');
create policy "Technical/Director manage materials" on materials for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('technical','director'))
);

-- COST SETTINGS (cài đặt toàn hệ thống)
create table cost_settings (
  id int primary key default 1 check (id = 1),
  usd_rate int not null default 25000,
  labor_cost_per_month bigint not null default 14000000,
  electricity_price int not null default 2000,
  working_hours_per_day numeric(4,2) not null default 22.75,
  depreciation_months int not null default 120,
  overhead_factory numeric(4,3) not null default 0.05,
  overhead_qc numeric(4,3) not null default 0.05,
  overhead_packaging numeric(4,3) not null default 0.05,
  overhead_admin numeric(4,3) not null default 0.10,
  overhead_shipping numeric(4,3) not null default 0.10,
  overhead_profit numeric(4,3) not null default 0.40,
  updated_at timestamptz default now(),
  updated_by uuid references auth.users
);
alter table cost_settings enable row level security;
create policy "Authenticated read cost_settings" on cost_settings for select using (auth.role() = 'authenticated');
create policy "Director manage cost_settings" on cost_settings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'director')
);

-- PROJECTS (dự án / yêu cầu báo giá)
create table projects (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  customer_name text not null,
  customer_contact text,
  customer_email text,
  customer_phone text,
  customer_address text,
  subject text,
  received_date date,
  status text not null default 'draft' check (status in ('draft','in_review','quoted','confirmed','cancelled')),
  notes text,
  created_by uuid references auth.users not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table projects enable row level security;
create policy "Authenticated read projects" on projects for select using (auth.role() = 'authenticated');
create policy "Sales/Technical/Director manage projects" on projects for all using (auth.role() = 'authenticated');

-- BOM ITEMS (chi tiết nhựa ép khuôn)
create table bom_items (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects on delete cascade not null,
  sort_order int not null default 0,
  part_number text,
  part_name text,
  color text,
  cavity int not null default 1,
  weight_g numeric(10,4) not null default 0,
  yield_rate numeric(4,3) not null default 0.97,
  material_id uuid references materials,
  material_spec text,
  colorant_id uuid references materials,
  colorant_pct numeric(5,3) not null default 0,
  ink_id uuid references materials,
  ink_qty_per_pc numeric(10,4) not null default 0,
  machine_id uuid references machines,
  cycle_time_s int not null default 60,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table bom_items enable row level security;
create policy "Authenticated manage bom_items" on bom_items for all using (auth.role() = 'authenticated');

-- TOOL COSTS (chi phí khuôn mẫu)
create table tool_costs (
  id uuid default gen_random_uuid() primary key,
  bom_item_id uuid references bom_items on delete cascade unique not null,
  tool_price bigint not null default 0,
  tool_material_cost bigint not null default 0,
  making_time_days int not null default 45,
  service_life_shots int not null default 500000,
  supplier text,
  notes text,
  created_at timestamptz default now()
);
alter table tool_costs enable row level security;
create policy "Authenticated manage tool_costs" on tool_costs for all using (auth.role() = 'authenticated');

-- QUOTATIONS (bảng báo giá, hỗ trợ nhiều revision)
create table quotations (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects on delete cascade not null,
  revision int not null default 0,
  lang text not null default 'vn' check (lang in ('vn','en')),
  validity_days int not null default 30,
  moq_500 int not null default 500,
  moq_1000 int not null default 1000,
  usd_rate int not null default 25000,
  overhead_factory numeric(4,3) not null default 0.05,
  overhead_qc numeric(4,3) not null default 0.05,
  overhead_packaging numeric(4,3) not null default 0.05,
  overhead_admin numeric(4,3) not null default 0.10,
  overhead_shipping numeric(4,3) not null default 0.10,
  overhead_profit numeric(4,3) not null default 0.40,
  delivery_mold_days int not null default 50,
  delivery_sample_days int not null default 5,
  delivery_production_days int not null default 15,
  payment_mold_deposit int not null default 50,
  incoterm text not null default 'FOB-HCM',
  status text not null default 'draft' check (status in ('draft','sent','approved','rejected')),
  notes text,
  created_by uuid references auth.users not null,
  approved_by uuid references auth.users,
  approved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, revision, lang)
);
alter table quotations enable row level security;
create policy "Authenticated manage quotations" on quotations for all using (auth.role() = 'authenticated');

-- QUOTATION ITEMS (snapshot giá từng chi tiết tại thời điểm báo giá)
create table quotation_items (
  id uuid default gen_random_uuid() primary key,
  quotation_id uuid references quotations on delete cascade not null,
  bom_item_id uuid references bom_items not null,
  -- Chi phí gia công
  electricity_cost_per_shot numeric(12,4),
  depreciation_cost_per_shot numeric(12,4),
  labor_cost_per_shot numeric(12,4),
  processing_cost_per_pc numeric(12,4),
  -- Nguyên vật liệu
  resin_cost_per_pc numeric(12,4),
  colorant_cost_per_pc numeric(12,4),
  ink_cost_per_pc numeric(12,4),
  material_cost_per_pc numeric(12,4),
  -- Tổng
  base_cost_per_pc numeric(12,4),
  total_overhead_pct numeric(6,4),
  unit_price_vnd bigint,
  unit_price_usd numeric(10,6),
  tool_price_vnd bigint,
  tool_price_usd numeric(10,2),
  created_at timestamptz default now()
);
alter table quotation_items enable row level security;
create policy "Authenticated manage quotation_items" on quotation_items for all using (auth.role() = 'authenticated');

-- ============================================================
-- SEED: máy ép mặc định (từ template)
-- ============================================================
insert into machines (code, tonnage, kwh, original_value) values
  ('IN-110', 86, 17, 450000000),
  ('IN-111', 90, 19, 470000000),
  ('IN-107', 120, 22, 480000000),
  ('IN-108', 120, 22, 480000000),
  ('IN-106', 160, 27, 510000000),
  ('IN-109', 160, 27, 510000000),
  ('INE-101', 160, 27, 510000000),
  ('IN-105', 200, 32, 650000000),
  ('IN-102', 250, 35, 650000000),
  ('IN-206', 280, 37, 700000000),
  ('IN-202', 320, 40, 1300000000),
  ('IN-205', 320, 40, 1300000000),
  ('IN-204', 380, 45, 1400000000),
  ('IN-207', 450, 50, 1450000000),
  ('IN-201', 600, 60, 1600000000),
  ('INE-104', 130, 52, 500000000);

-- SEED: cost settings mặc định
insert into cost_settings (id) values (1);

-- SEED: một số nhựa thông dụng
insert into materials (code, name, type, unit_price, unit) values
  ('PA6', 'PA6 (Nylon 6)', 'resin', 170000, 'kg'),
  ('PA6-GF33', 'PA6 33GF', 'resin', 185000, 'kg'),
  ('ABS', 'ABS', 'resin', 75000, 'kg'),
  ('PP', 'PP Homopolymer', 'resin', 32000, 'kg'),
  ('PP-GF20', 'PP 20GF', 'resin', 55000, 'kg'),
  ('PC', 'Polycarbonate', 'resin', 120000, 'kg'),
  ('POM', 'POM (Acetal)', 'resin', 95000, 'kg'),
  ('EPDM', 'EPDM Rubber', 'resin', 80000, 'kg'),
  ('GRY24520UV', 'GRY24520UV (Brenntag)', 'colorant', 250000, 'kg'),
  ('BLACK-MB', 'Black Masterbatch', 'colorant', 150000, 'kg');
