
-- Создаем тестового пользователя если его нет
INSERT INTO public.profiles (id, user_id, chat_id, phone, name, address, is_admin, created_at, updated_at)
VALUES (
  'b1234567-8901-2345-6789-012345678901'::uuid,
  null,
  'tester_user',
  'Tester',
  'Тестовый пользователь',
  null,
  false,
  now(),
  now()
) ON CONFLICT (chat_id, phone) DO NOTHING;

-- Добавляем тестовый заказ для демонстрации
INSERT INTO public.tire_orders (
  id,
  profile_id,
  client_name,
  phone,
  car_number,
  tire_count,
  has_disks,
  start_date,
  storage_period,
  end_date,
  monthly_price,
  total_amount,
  debt,
  deal_status,
  storage_location,
  storage_cell,
  created_at
) VALUES (
  gen_random_uuid(),
  'b1234567-8901-2345-6789-012345678901'::uuid,
  'Тестовый пользователь',
  'Tester',
  'T123ES',
  4,
  true,
  '2024-01-15',
  6,
  '2024-07-15',
  2000,
  12000,
  0,
  'active',
  'Склад А',
  'А-15',
  now()
) ON CONFLICT DO NOTHING;
