-- Run this in Supabase SQL editor
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  type text not null check (type in ('IN_STOCK', 'PREORDER')),
  target_ready_date date,
  client_name text not null,
  status text not null check (status in ('PLACED', 'IN_PROGRESS', 'SEWING', 'DONE')) default 'PLACED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute procedure public.set_updated_at();

alter table public.orders enable row level security;

-- MVP demo policy (open). Replace with strict role policies after hackathon.
drop policy if exists "mvp_open_orders" on public.orders;
create policy "mvp_open_orders"
on public.orders
for all
using (true)
with check (true);
