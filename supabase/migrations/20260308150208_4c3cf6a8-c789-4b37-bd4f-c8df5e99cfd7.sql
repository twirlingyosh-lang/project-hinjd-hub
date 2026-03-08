
-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    user_id UUID NOT NULL,
    amount NUMERIC,
    status TEXT DEFAULT 'pending',
    customer_email TEXT,
    split_business NUMERIC,
    split_scholarship NUMERIC
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    user_id UUID NOT NULL,
    part_name TEXT,
    part_price NUMERIC,
    shipping_address TEXT,
    status TEXT DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Transactions: authenticated users can insert/view their own, admins see all
CREATE POLICY "Auth insert own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth view own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth admins view all transactions" ON public.transactions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Auth admins insert transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

-- Orders: authenticated users can insert/view their own, admins see all
CREATE POLICY "Auth insert own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth admins view all orders" ON public.orders FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Auth admins insert orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
