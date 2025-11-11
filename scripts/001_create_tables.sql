-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User profiles table (references auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null check (role in ('admin', 'applicant')) default 'applicant',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Job positions table
create table if not exists public.job_positions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  location text,
  employment_type text,
  salary_range text,
  is_active boolean default true,
  created_by uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Dynamic form fields configuration
create table if not exists public.form_fields (
  id uuid primary key default uuid_generate_v4(),
  job_position_id uuid references public.job_positions(id) on delete cascade,
  field_name text not null,
  field_type text not null check (field_type in ('text', 'email', 'tel', 'textarea', 'select', 'file', 'date', 'number')),
  field_label text not null,
  field_options jsonb, -- For select dropdowns
  is_required boolean default false,
  field_order integer default 0,
  created_at timestamp with time zone default now()
);

-- Applications table
create table if not exists public.applications (
  id uuid primary key default uuid_generate_v4(),
  job_position_id uuid references public.job_positions(id) on delete cascade,
  applicant_id uuid references public.profiles(id) on delete cascade,
  status text not null check (status in ('submitted', 'under_review', 'interview', 'accepted', 'rejected')) default 'submitted',
  profile_photo_url text,
  form_data jsonb not null, -- Dynamic form responses
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.job_positions enable row level security;
alter table public.form_fields enable row level security;
alter table public.applications enable row level security;

-- Profiles policies
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Admins can view all profiles
create policy "profiles_select_admin"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Job positions policies (public can view active jobs)
create policy "job_positions_select_active"
  on public.job_positions for select
  using (is_active = true or created_by = auth.uid());

-- Only admins can insert/update/delete jobs
create policy "job_positions_insert_admin"
  on public.job_positions for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "job_positions_update_admin"
  on public.job_positions for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "job_positions_delete_admin"
  on public.job_positions for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Form fields policies (follow job positions access)
create policy "form_fields_select_all"
  on public.form_fields for select
  using (
    exists (
      select 1 from public.job_positions
      where id = form_fields.job_position_id and is_active = true
    )
  );

create policy "form_fields_insert_admin"
  on public.form_fields for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "form_fields_update_admin"
  on public.form_fields for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "form_fields_delete_admin"
  on public.form_fields for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Applications policies
create policy "applications_select_own"
  on public.applications for select
  using (applicant_id = auth.uid());

create policy "applications_insert_own"
  on public.applications for insert
  with check (applicant_id = auth.uid());

create policy "applications_update_own"
  on public.applications for update
  using (applicant_id = auth.uid());

-- Admins can view and update all applications
create policy "applications_select_admin"
  on public.applications for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "applications_update_admin"
  on public.applications for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create indexes for better performance
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_job_positions_is_active on public.job_positions(is_active);
create index if not exists idx_form_fields_job_position on public.form_fields(job_position_id);
create index if not exists idx_applications_job_position on public.applications(job_position_id);
create index if not exists idx_applications_applicant on public.applications(applicant_id);
create index if not exists idx_applications_status on public.applications(status);
