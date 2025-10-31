create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

drop view if exists trader_dashboard_metrics;
drop table if exists feedback cascade;
drop table if exists subscribers cascade;
drop table if exists bookings cascade;
drop table if exists traders cascade;
drop table if exists profiles cascade;

create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  role text not null check (role in ('trader','client')),
  display_name text not null,
  bio text,
  avatar_url text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table traders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  price_per_minute numeric(10,2) not null default 5.00,
  categories text[] not null default '{}',
  rating numeric(3,2) not null default 5.00,
  created_at timestamptz not null default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete restrict,
  trader_id uuid not null references auth.users(id) on delete restrict,
  minutes int not null check (minutes between 5 and 240),
  status text not null default 'pending' check (status in ('pending','accepted','rejected','completed','cancelled')),
  scheduled_at timestamptz,
  estimated_cost numeric(10,2) not null,
  note text,
  created_at timestamptz not null default now()
);

create table subscribers (
  id uuid primary key default gen_random_uuid(),
  trader_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(trader_id, user_id)
);

create table feedback (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  trader_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create view trader_dashboard_metrics as
select
  b.trader_id,
  coalesce(sum(case when b.status = 'completed' then b.minutes end), 0)::int as total_minutes,
  coalesce(sum(case when b.status = 'completed' then b.estimated_cost end), 0)::numeric(12,2) as total_revenue,
  (select count(*) from subscribers s where s.trader_id = b.trader_id) as active_subscribers
from bookings b
group by b.trader_id;
