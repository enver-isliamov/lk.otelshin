
-- Включаем RLS для таблицы tire_orders
ALTER TABLE public.tire_orders ENABLE ROW LEVEL SECURITY;

-- Политика для просмотра заказов (администраторы видят все, обычные пользователи только свои)
CREATE POLICY "Users can view their own orders or admins can view all" 
ON public.tire_orders 
FOR SELECT 
USING (
  profile_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
  )
);

-- Политика для создания заказов (все авторизованные пользователи могут создавать)
CREATE POLICY "Authenticated users can create orders" 
ON public.tire_orders 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Политика для обновления заказов (пользователи могут обновлять свои заказы или администраторы все)
CREATE POLICY "Users can update their own orders or admins can update all" 
ON public.tire_orders 
FOR UPDATE 
USING (
  profile_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
  )
);

-- Политика для удаления заказов (только администраторы)
CREATE POLICY "Only admins can delete orders" 
ON public.tire_orders 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
  )
);
