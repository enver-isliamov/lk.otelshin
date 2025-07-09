
-- Создаем таблицу для заказов шин
CREATE TABLE public.tire_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT,
  phone TEXT,
  address TEXT,
  tire_size TEXT,
  tire_brand TEXT,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10,2),
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Добавляем RLS
ALTER TABLE public.tire_orders ENABLE ROW LEVEL SECURITY;

-- Политика для чтения всех заказов
CREATE POLICY "Allow read access to tire_orders" 
  ON public.tire_orders 
  FOR SELECT 
  USING (true);

-- Политика для создания заказов
CREATE POLICY "Allow insert tire_orders" 
  ON public.tire_orders 
  FOR INSERT 
  WITH CHECK (true);

-- Политика для обновления заказов
CREATE POLICY "Allow update tire_orders" 
  ON public.tire_orders 
  FOR UPDATE 
  USING (true);

-- Политика для удаления заказов
CREATE POLICY "Allow delete tire_orders" 
  ON public.tire_orders 
  FOR DELETE 
  USING (true);
