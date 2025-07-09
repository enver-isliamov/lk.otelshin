
-- Создание таблицы для профилей пользователей
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  chat_id text UNIQUE,
  phone text UNIQUE,
  name text,
  address text,
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Создание таблицы для заказов на хранение шин
CREATE TABLE public.tire_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  chat_id text,
  client_name text,
  phone text,
  car_number text,
  qr_code text,
  monthly_price decimal(10,2),
  tire_count integer,
  has_disks boolean DEFAULT false,
  start_date date,
  storage_period integer, -- в месяцах
  reminder_date date,
  end_date date,
  storage_location text,
  storage_cell text,
  total_amount decimal(10,2),
  debt decimal(10,2) DEFAULT 0,
  contract_number text,
  deal_status text DEFAULT 'active',
  traffic_source text,
  client_address text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Включение Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tire_orders ENABLE ROW LEVEL SECURITY;

-- Политики для profiles
CREATE POLICY "Пользователи могут видеть свой профиль" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = user_id OR is_admin = true);

CREATE POLICY "Пользователи могут создавать свой профиль" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять свой профиль" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Политики для tire_orders
CREATE POLICY "Пользователи могут видеть свои заказы" 
  ON public.tire_orders 
  FOR SELECT 
  USING (
    profile_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Администраторы могут создавать заказы" 
  ON public.tire_orders 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Администраторы могут обновлять заказы" 
  ON public.tire_orders 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Функция для автоматического создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, phone)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'phone'
  );
  RETURN new;
END;
$$;

-- Триггер для создания профиля при регистрации
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Вставка тестовых данных
INSERT INTO public.profiles (chat_id, phone, name, is_admin) VALUES 
('demo_admin', 'Demo', 'Администратор (Demo)', true),
('tester_user', 'Tester', 'Тестовый пользователь', false);

-- Пример тестового заказа
INSERT INTO public.tire_orders (
  profile_id, chat_id, client_name, phone, car_number, monthly_price, 
  tire_count, has_disks, start_date, storage_period, end_date, 
  storage_location, total_amount, deal_status
) VALUES (
  (SELECT id FROM public.profiles WHERE phone = 'Tester'),
  'tester_user', 'Тестовый пользователь', 'Tester', 'А123АА777',
  800, 4, true, '2024-10-01', 6, '2025-04-01',
  'Склад №1', 4800, 'active'
);
