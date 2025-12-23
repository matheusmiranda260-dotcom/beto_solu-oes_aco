-- Create spare_parts table
CREATE TABLE IF NOT EXISTS public.spare_parts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    code TEXT,
    category TEXT NOT NULL DEFAULT 'Trefila',
    quantity INTEGER DEFAULT 0,
    min_level INTEGER DEFAULT 1,
    location TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own spare parts" ON public.spare_parts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spare parts" ON public.spare_parts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spare parts" ON public.spare_parts
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spare parts" ON public.spare_parts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_spare_parts_user_id ON public.spare_parts(user_id);
