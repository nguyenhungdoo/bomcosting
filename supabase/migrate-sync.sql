-- ============================================================
-- MIGRATION: Sync database to match schema.sql & TypeScript types
-- Run in Supabase SQL Editor (one-time)
-- ============================================================

-- 1. CUSTOMERS table
create table if not exists customers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  contact text,
  email text,
  phone text,
  address text,
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table customers enable row level security;
do $$ begin
  create policy "Authenticated read customers" on customers for select using (auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Authenticated manage customers" on customers for all using (auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;

-- 2. Materials: add 'metal_insert' to type CHECK
alter table materials drop constraint if exists materials_type_check;
alter table materials add constraint materials_type_check
  check (type in ('resin','colorant','ink','metal_insert','other'));

-- 3. Projects: add customer_logo_url, fix status CHECK
alter table projects add column if not exists customer_logo_url text;

alter table projects drop constraint if exists projects_status_check;
alter table projects add constraint projects_status_check
  check (status in ('draft','quoting','quoted','cancelled','other'));

-- Migrate existing status values
update projects set status = 'quoting' where status = 'in_review';
update projects set status = 'other' where status = 'confirmed';

-- 4. BOM items: add metal insert columns
alter table bom_items add column if not exists metal_insert_name text;
alter table bom_items add column if not exists metal_insert_qty numeric(10,2) not null default 0;
alter table bom_items add column if not exists metal_insert_unit_price bigint not null default 0;
alter table bom_items add column if not exists metal_insert_image_url text;
