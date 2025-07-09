
-- Добавляем несколько тестовых заказов для демонстрации
INSERT INTO public.tire_orders (
  profile_id, chat_id, client_name, phone, car_number, monthly_price, 
  tire_count, has_disks, start_date, storage_period, end_date, 
  storage_location, storage_cell, total_amount, debt, deal_status
) VALUES 
-- Заказ для существующего тестового пользователя
(
  (SELECT id FROM public.profiles WHERE phone = 'Tester'),
  'tester_user', 'Иванов Петр Сергеевич', '+7 (978) 123-45-67', 'А123АА777',
  1200, 4, true, '2024-11-01', 6, '2025-05-01',
  'Склад №1', 'A-15', 7200, 0, 'active'
),
-- Дополнительные заказы для демонстрации разных статусов
(
  (SELECT id FROM public.profiles WHERE phone = 'Tester'),
  'tester_user', 'Сидоров Алексей Иванович', '+7 (978) 987-65-43', 'В456ВВ123',
  800, 4, false, '2024-09-15', 4, '2025-01-15',
  'Склад №2', 'B-22', 3200, 0, 'completed'
),
(
  (SELECT id FROM public.profiles WHERE phone = 'Tester'),
  'tester_user', 'Петрова Мария Александровна', '+7 (978) 555-33-22', 'С789СС456',
  1000, 4, true, '2024-08-01', 6, '2025-02-01',
  'Склад №1', 'C-08', 6000, 1000, 'overdue'
),
-- Создаем дополнительный профиль клиента для разнообразия
(
  (SELECT id FROM public.profiles WHERE phone = 'Demo'),
  'demo_client_1', 'Козлов Дмитрий Владимирович', '+7 (978) 777-88-99', 'Д101ДД789',
  1500, 4, true, '2024-12-01', 12, '2025-12-01',
  'Склад №3', 'D-33', 18000, 0, 'active'
),
(
  (SELECT id FROM public.profiles WHERE phone = 'Demo'),
  'demo_client_2', 'Николаева Елена Сергеевна', '+7 (978) 444-55-66', 'Е202ЕЕ321',
  900, 4, false, '2024-10-15', 8, '2025-06-15',
  'Склад №2', 'E-44', 7200, 300, 'active'
);

-- Добавляем еще один профиль клиента для полноты картины
INSERT INTO public.profiles (chat_id, phone, name, is_admin) VALUES 
('client_003', '+7 (978) 333-22-11', 'Смирнова Ольга Петровна', false);

-- И заказ для этого клиента
INSERT INTO public.tire_orders (
  profile_id, chat_id, client_name, phone, car_number, monthly_price, 
  tire_count, has_disks, start_date, storage_period, end_date, 
  storage_location, storage_cell, total_amount, debt, deal_status
) VALUES (
  (SELECT id FROM public.profiles WHERE phone = '+7 (978) 333-22-11'),
  'client_003', 'Смирнова Ольга Петровна', '+7 (978) 333-22-11', 'Ж303ЖЖ654',
  1100, 4, true, '2024-11-15', 6, '2025-05-15',
  'Склад №1', 'F-55', 6600, 0, 'active'
);
