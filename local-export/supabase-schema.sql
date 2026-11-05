-- Optional: run this in the Supabase SQL editor to back the app with Postgres.
-- Without it the app runs entirely from localStorage.

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  role text default 'user',
  roblox_username text default '',
  created_date timestamptz default now()
);

create table if not exists public.moderations (
  id uuid primary key default gen_random_uuid(),
  roblox_username text not null,
  moderation_type text not null default 'Warning',
  reason text not null,
  details text,
  duration text,
  status text not null default 'Active',
  staff_member text,
  moderation_date timestamptz,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

create table if not exists public.appeals (
  id uuid primary key default gen_random_uuid(),
  roblox_username text not null,
  moderation_id text,
  appeal_reason text not null,
  why_accepted text,
  deserved_infraction text,
  status text not null default 'Pending',
  staff_response text,
  decided_by text,
  decided_at timestamptz,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text default 'General',
  status text default 'draft',
  questions text,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

create table if not exists public.application_responses (
  id uuid primary key default gen_random_uuid(),
  application_id text,
  application_title text,
  roblox_username text,
  answers text,
  status text default 'submitted',
  reviewed_by text,
  reviewed_at timestamptz,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  roblox_username text not null,
  title text not null,
  body text,
  read boolean default false,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  roblox_username text not null,
  title text not null,
  description text not null,
  severity text default 'Low',
  status text default 'Submitted',
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- Demo-friendly row security: anyone signed in can read/write their own
-- portal rows; tighten these before going to production.
alter table public.moderations enable row level security;
alter table public.appeals enable row level security;
alter table public.applications enable row level security;
alter table public.application_responses enable row level security;
alter table public.notifications enable row level security;
alter table public.bug_reports enable row level security;
alter table public.profiles enable row level security;

create policy "profiles self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "authenticated read" on public.moderations for select using (auth.role() = 'authenticated');
create policy "authenticated write" on public.moderations for all using (auth.role() = 'authenticated');

create policy "authenticated read" on public.appeals for select using (auth.role() = 'authenticated');
create policy "authenticated write" on public.appeals for all using (auth.role() = 'authenticated');

create policy "authenticated read" on public.applications for select using (auth.role() = 'authenticated');
create policy "authenticated write" on public.applications for all using (auth.role() = 'authenticated');

create policy "authenticated read" on public.application_responses for select using (auth.role() = 'authenticated');
create policy "authenticated write" on public.application_responses for all using (auth.role() = 'authenticated');

create policy "authenticated read" on public.notifications for select using (auth.role() = 'authenticated');
create policy "authenticated write" on public.notifications for all using (auth.role() = 'authenticated');

create policy "authenticated read" on public.bug_reports for select using (auth.role() = 'authenticated');
create policy "authenticated write" on public.bug_reports for all using (auth.role() = 'authenticated');