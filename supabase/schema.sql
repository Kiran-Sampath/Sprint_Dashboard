create extension if not exists pgcrypto;

create type public.team_name as enum ('Agentic AI', 'Infrastructure', 'OTel', 'Security', 'Testing');
create type public.member_role as enum ('Team Lead', 'Technical Lead', 'Module Owner', 'Contributor', 'Reviewer', 'Tester');
create type public.update_status as enum ('Completed', 'On track', 'In progress', 'Blocked', 'No progress today');
create type public.blocker_severity as enum ('Low', 'Medium', 'High', 'Critical');
create type public.review_readiness as enum ('Yes', 'Partially', 'Not yet', 'Blocked');

create table public.members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  asu_id text not null unique,
  email text not null unique,
  team public.team_name not null,
  role public.member_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.daily_updates (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  reporting_date date not null default current_date,
  sub_task_category text not null,
  sprint_goal text not null,
  worked_on text not null,
  completed_today text not null,
  hours_spent numeric(5,2) not null check (hours_spent >= 0 and hours_spent <= 24),
  supporting_evidence text,
  current_status public.update_status not null,
  blocker_details text not null default 'None',
  blocker_severity public.blocker_severity,
  dependency_owner text not null default 'None',
  plan_tomorrow text not null,
  review_readiness public.review_readiness not null,
  no_progress_explanation text,
  leadership_contributions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(member_id, reporting_date),
  constraint blocked_requires_severity check (current_status <> 'Blocked' or blocker_severity is not null),
  constraint no_progress_requires_reason check (current_status <> 'No progress today' or length(trim(coalesce(no_progress_explanation, ''))) > 0),
  constraint completed_requires_evidence check (current_status <> 'Completed' or length(trim(coalesce(supporting_evidence, ''))) > 0)
);

create index daily_updates_date_idx on public.daily_updates(reporting_date desc);
create index daily_updates_status_idx on public.daily_updates(current_status);
create index daily_updates_member_idx on public.daily_updates(member_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger daily_updates_set_updated_at
before update on public.daily_updates
for each row execute function public.set_updated_at();

-- Authentication is deferred. The backend uses the service-role key and is the only
-- component that should access these tables. Never put that key in the React app.
alter table public.members enable row level security;
alter table public.daily_updates enable row level security;

