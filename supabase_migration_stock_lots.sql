-- Create table for Stock Lots (Raw Material / Incoming)
CREATE TABLE IF NOT EXISTS public.stock_lots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lot_number TEXT NOT NULL,
    supplier TEXT NOT NULL,
    label_weight NUMERIC(10,2) NOT NULL, -- Peso Balança
    scale_weight NUMERIC(10,2) NOT NULL, -- Peso Etiqueta
    difference NUMERIC(10,2) GENERATED ALWAYS AS (scale_weight - label_weight) STORED,
    status TEXT DEFAULT 'Conferido',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.stock_lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stock lots" ON public.stock_lots
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stock lots" ON public.stock_lots
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stock lots" ON public.stock_lots
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stock lots" ON public.stock_lots
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stock_lots_user_id ON public.stock_lots(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_lots_created_at ON public.stock_lots(created_at);
