-- 1. Create Profiles table to map Auth Users to Usernames/Roles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  role text default 'user', -- 'admin' or 'user'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add user_id column to all content tables
-- We use "default auth.uid()" so inserts automatically capture the logged-in user

-- Meshes
alter table meshes add column user_id uuid references auth.users default auth.uid();
-- Companies
alter table companies add column user_id uuid references auth.users default auth.uid();
-- Commission Entries
alter table commission_entries add column user_id uuid references auth.users default auth.uid();
-- Financial Records
alter table financial_records add column user_id uuid references auth.users default auth.uid();
-- Consulting Jobs
alter table consulting_jobs add column user_id uuid references auth.users default auth.uid();
-- Trefila Recipes
alter table trefila_recipes add column user_id uuid references auth.users default auth.uid();
-- Trusses
alter table trusses add column user_id uuid references auth.users default auth.uid();
-- Saved Quotes
alter table saved_quotes add column user_id uuid references auth.users default auth.uid();

-- Leads currently come from the public site, so they might be "shared" or managed by admin. 
-- We won't isolate them strictly yet, or we assign them to "admin". 
-- leaving leads as public read for authenticated users for now.

-- 3. Enable RLS and Create Isolation Policies
-- This ensures 'What Matheus does stays with Matheus'

-- Helper macro not available in standard SQL here, so writing explicit policies.

-- Meshes
alter table meshes enable row level security;
drop policy if exists "Enable all access for public" on meshes; 
create policy "Individuals can see their own meshes" on meshes for select using (auth.uid() = user_id);
create policy "Individuals can insert their own meshes" on meshes for insert with check (auth.uid() = user_id);
create policy "Individuals can update their own meshes" on meshes for update using (auth.uid() = user_id);
create policy "Individuals can delete their own meshes" on meshes for delete using (auth.uid() = user_id);

-- Companies
alter table companies enable row level security;
drop policy if exists "Enable all access for public" on companies;
create policy "Individuals can see their own companies" on companies for select using (auth.uid() = user_id);
create policy "Individuals can insert their own companies" on companies for insert with check (auth.uid() = user_id);
create policy "Individuals can update their own companies" on companies for update using (auth.uid() = user_id);
create policy "Individuals can delete their own companies" on companies for delete using (auth.uid() = user_id);

-- Commission Entries
alter table commission_entries enable row level security;
drop policy if exists "Enable all access for public" on commission_entries;
create policy "Individuals can see their own commissions" on commission_entries for select using (auth.uid() = user_id);
create policy "Individuals can insert their own commissions" on commission_entries for insert with check (auth.uid() = user_id);
create policy "Individuals can update their own commissions" on commission_entries for update using (auth.uid() = user_id);
create policy "Individuals can delete their own commissions" on commission_entries for delete using (auth.uid() = user_id);

-- Financial Records
alter table financial_records enable row level security;
drop policy if exists "Enable all access for public" on financial_records;
create policy "Individuals can see their own records" on financial_records for select using (auth.uid() = user_id);
create policy "Individuals can insert their own records" on financial_records for insert with check (auth.uid() = user_id);
create policy "Individuals can update their own records" on financial_records for update using (auth.uid() = user_id);
create policy "Individuals can delete their own records" on financial_records for delete using (auth.uid() = user_id);

-- Consulting Jobs
alter table consulting_jobs enable row level security;
drop policy if exists "Enable all access for public" on consulting_jobs;
create policy "Individuals can see their own jobs" on consulting_jobs for select using (auth.uid() = user_id);
create policy "Individuals can insert their own jobs" on consulting_jobs for insert with check (auth.uid() = user_id);
create policy "Individuals can update their own jobs" on consulting_jobs for update using (auth.uid() = user_id);
create policy "Individuals can delete their own jobs" on consulting_jobs for delete using (auth.uid() = user_id);

-- Trefila Recipes
alter table trefila_recipes enable row level security;
drop policy if exists "Enable all access for public" on trefila_recipes;
create policy "Individuals can see their own recipes" on trefila_recipes for select using (auth.uid() = user_id);
create policy "Individuals can insert their own recipes" on trefila_recipes for insert with check (auth.uid() = user_id);
create policy "Individuals can update their own recipes" on trefila_recipes for update using (auth.uid() = user_id);
create policy "Individuals can delete their own recipes" on trefila_recipes for delete using (auth.uid() = user_id);

-- Trusses
alter table trusses enable row level security;
drop policy if exists "Enable all access for public" on trusses;
create policy "Individuals can see their own trusses" on trusses for select using (auth.uid() = user_id);
create policy "Individuals can insert their own trusses" on trusses for insert with check (auth.uid() = user_id);
create policy "Individuals can update their own trusses" on trusses for update using (auth.uid() = user_id);
create policy "Individuals can delete their own trusses" on trusses for delete using (auth.uid() = user_id);

-- Saved Quotes
alter table saved_quotes enable row level security;
drop policy if exists "Enable all access for public" on saved_quotes;
create policy "Individuals can see their own quotes" on saved_quotes for select using (auth.uid() = user_id);
create policy "Individuals can insert their own quotes" on saved_quotes for insert with check (auth.uid() = user_id);
create policy "Individuals can update their own quotes" on saved_quotes for update using (auth.uid() = user_id);
create policy "Individuals can delete their own quotes" on saved_quotes for delete using (auth.uid() = user_id);


-- Profiles RLS
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Function to handle new user signup automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role)
  values (new.id, new.raw_user_meta_data->>'username', 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
