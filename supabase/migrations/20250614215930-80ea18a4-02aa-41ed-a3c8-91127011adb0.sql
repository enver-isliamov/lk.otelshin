
-- Проверяем существующие профили и добавляем только заказы
INSERT INTO public.tire_orders (
  profile_id, client_name, phone, car_number, tire_count, has_disks, 
  storage_period, start_date, end_date, monthly_price, total_amount, 
  debt, deal_status, storage_location, storage_cell, created_at
) VALUES 
-- Заказы для администратора (используем существующий профиль Demo)
(
  (SELECT id FROM public.profiles WHERE chat_id = 'demo_admin' LIMIT 1),
  'Иванов Иван', '+7-999-123-4567', 'А123БВ77', 4, true, 6, 
  '2024-11-01', '2025-05-01', 1500, 9000, 0, 'active', 'Склад А', 'A-15', now()
),
(
  (SELECT id FROM public.profiles WHERE chat_id = 'demo_admin' LIMIT 1),
  'Петров Петр', '+7-999-234-5678', 'В456ГД78', 4, false, 8, 
  '2024-10-15', '2025-06-15', 1200, 9600, 1200, 'overdue', 'Склад Б', 'B-23', now()
),
(
  (SELECT id FROM public.profiles WHERE chat_id = 'demo_admin' LIMIT 1),
  'Сидоров Сидор', '+7-999-345-6789', 'Е789ЖЗ79', 4, true, 4, 
  '2024-12-01', '2025-04-01', 1800, 7200, 0, 'active', 'Склад А', 'A-08', now()
),

-- Заказы для тестового пользователя (используем существующий профиль Tester)
(
  (SELECT id FROM public.profiles WHERE chat_id = 'tester_user' LIMIT 1),
  'Тестовый пользователь', 'Tester', 'Т123ЕС83', 4, true, 6, 
  '2024-11-01', '2025-05-01', 1500, 9000, 0, 'active', 'Склад А', 'A-30', now()
),
(
  (SELECT id FROM public.profiles WHERE chat_id = 'tester_user' LIMIT 1),
  'Тестовый пользователь', 'Tester', 'У456ВА84', 4, false, 4, 
  '2024-12-01', '2025-04-01', 1200, 4800, 0, 'active', 'Склад Б', 'B-31', now()
),
(
  (SELECT id FROM public.profiles WHERE chat_id = 'tester_user' LIMIT 1),
  'Тестовый пользователь', 'Tester', 'Ф789ГД85', 4, true, 8, 
  '2024-10-15', '2025-06-15', 1600, 12800, 1600, 'overdue', 'Склад В', 'C-32', now()
);
