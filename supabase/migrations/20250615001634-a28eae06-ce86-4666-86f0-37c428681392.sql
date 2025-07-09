
-- Создаем таблицу tire_orders в Supabase для соответствия типам
CREATE TABLE public.tire_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id text,
  chat_id text,
  client_name text,
  phone text,
  car_number text,
  order_qr text,
  monthly_price numeric,
  tire_count integer,
  has_disks boolean DEFAULT false,
  start_date date,
  storage_period integer,
  reminder_date date,
  end_date date,
  storage_location text,
  storage_cell text,
  total_amount numeric,
  debt numeric DEFAULT 0,
  contract text,
  client_address text,
  deal_status text DEFAULT 'new',
  tire_size text,
  tire_brand text,
  quantity integer,
  price numeric,
  status text DEFAULT 'new',
  notes text,
  address text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Включаем Row Level Security
ALTER TABLE public.tire_orders ENABLE ROW LEVEL SECURITY;

-- Создаем политику для администраторов (полный доступ)
CREATE POLICY "Admins can manage all tire orders" 
  ON public.tire_orders 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Создаем политику для обычных пользователей (только свои заказы по chat_id)
CREATE POLICY "Users can view their own tire orders" 
  ON public.tire_orders 
  FOR SELECT 
  USING (
    chat_id IN (
      SELECT profiles.chat_id FROM public.profiles 
      WHERE profiles.user_id = auth.uid()
    )
  );
