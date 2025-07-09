
-- Создаем таблицу webbase для хранения данных из Google таблицы
CREATE TABLE public.webbase (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT,
  chat_id TEXT,
  client_name TEXT,
  car_number TEXT,
  client_address TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Добавляем RLS для безопасности
ALTER TABLE public.webbase ENABLE ROW LEVEL SECURITY;

-- Политика для чтения данных (для авторизации)
CREATE POLICY "Allow read access to webbase" 
  ON public.webbase 
  FOR SELECT 
  USING (true);

-- Политика для админов на все операции
CREATE POLICY "Allow admin full access to webbase" 
  ON public.webbase 
  FOR ALL 
  USING (
    EXISTS(
      SELECT 1 FROM public.webbase w 
      WHERE w.chat_id = current_setting('request.jwt.claims', true)::json->>'chat_id'
      AND w.is_admin = true
    )
  );
