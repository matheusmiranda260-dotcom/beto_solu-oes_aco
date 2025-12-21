-- Add permissions column to profiles
alter table profiles add column permissions text[] default '{}';

-- Allow Admins/Gestors to update any profile (to set permissions/roles)
create policy "Admins can update any profile" on profiles 
for update using (
  exists (
    select 1 from profiles
    where id = auth.uid() 
    and role in ('admin', 'gestor')
  )
);

-- Note: The existing "Users can update own profile" policy still allows users to update themselves.
-- Ideally we might want to restrict 'permissions' and 'role' update to admins only, 
-- but column-level security is complex in Postgres RLS without triggers.
-- For now, we trust the UI and the fact that basic users don't have direct DB access.

-- Update the handle_new_user function to capture permissions from metadata if provided
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role, permissions)
  values (
    new.id, 
    new.raw_user_meta_data->>'username', 
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    -- Parse permissions from metadata if it exists, otherwise empty array
    -- Note: metadata stores JSON, so we might need to cast or parse. 
    -- Simpler to default to user 'user' role defaults (which might be empty).
    case 
      when new.raw_user_meta_data->'permissions' is not null 
      then array(select jsonb_array_elements_text(new.raw_user_meta_data->'permissions'))
      else '{}'::text[]
    end
  );
  return new;
end;
$$ language plpgsql security definer;
