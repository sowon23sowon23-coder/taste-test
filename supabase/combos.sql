create table if not exists public.combos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null default 'You',
  flavor text not null,
  toppings text[] not null default '{}',
  vibe text not null default 'Custom',
  description text not null default '',
  likes integer not null default 1,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.combos enable row level security;

create policy "Public read combos"
on public.combos
for select
to anon, authenticated
using (true);

create policy "Public insert combos"
on public.combos
for insert
to anon, authenticated
with check (true);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  flavor text not null,
  toppings text[] not null default '{}',
  store_name text not null,
  created_at timestamptz not null default now()
);

alter table public.coupon_redemptions enable row level security;

create policy "Public insert coupon redemptions"
on public.coupon_redemptions
for insert
to anon, authenticated
with check (true);
