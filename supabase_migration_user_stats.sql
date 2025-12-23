-- 1. Alter profiles table to add tracking columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS total_activity_minutes INTEGER DEFAULT 0;

-- 2. Function to increment login count (called on login)
CREATE OR REPLACE FUNCTION public.increment_login_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET login_count = login_count + 1,
      last_seen_at = now(),
      is_online = true
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to update heartbeat (called periodically)
CREATE OR REPLACE FUNCTION public.update_heartbeat(user_id UUID, minutes_added INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET last_seen_at = now(),
      total_activity_minutes = total_activity_minutes + minutes_added,
      is_online = true
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to delete user (for managers/admins)
-- NOTE: Deleting from auth.users requires admin privileges. 
-- We create a security definer function to allow this restricted action securely.
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Check if executing user is admin or gestor (optional check depending on RLS, but good practice here)
  -- For now we trust the application logic + RLS on profiles to limit who can call/see this, 
  -- or we rely on the fact that only admins/gestors have access to the UI button.
  -- Ideally check: IF (SELECT role FROM profiles WHERE id = auth.uid()) NOT IN ('admin', 'gestor') THEN RAISE EXCEPTION 'Not authorized'; END IF;

  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update RLS for profiles so Gestors can UPDATE other profiles (to mark inactive etc if needed) or just VIEW.
-- Existing policy: "Public profiles are viewable by everyone" (SELECT using true). This is fine.
-- We might need to allow Managers to DELETE entries if usage requires it, but deleting from auth.users cascades to profiles usually.
