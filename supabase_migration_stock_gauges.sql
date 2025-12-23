-- Create table for Gauges (Bitolas) Configuration
CREATE TABLE IF NOT EXISTS public.stock_gauges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Fio Máquina', 'CA60')),
    gauge NUMERIC(4,2) NOT NULL, -- e.g. 5.5, 6.0
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.stock_gauges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own gauges" ON public.stock_gauges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own gauges" ON public.stock_gauges
    FOR ALL USING (auth.uid() = user_id);


-- Update stock_lots table to include type and gauge
ALTER TABLE public.stock_lots 
ADD COLUMN IF NOT EXISTS material_type TEXT CHECK (material_type IN ('Fio Máquina', 'CA60')),
ADD COLUMN IF NOT EXISTS gauge NUMERIC(4,2);
