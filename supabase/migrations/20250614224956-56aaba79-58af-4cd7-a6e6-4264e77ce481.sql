
-- Удаляем существующие политики
DROP POLICY IF EXISTS "Users can view their own orders or admins can view all" ON public.tire_orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.tire_orders;
DROP POLICY IF EXISTS "Users can update their own orders or admins can update all" ON public.tire_orders;
DROP POLICY IF EXISTS "Only admins can delete orders" ON public.tire_orders;

-- Создаем функцию для проверки админа (обходит проблемы с RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  );
$$;

-- Политика для просмотра: админы видят все, пользователи только свои
CREATE POLICY "View orders policy" 
ON public.tire_orders 
FOR SELECT 
USING (
  profile_id = auth.uid() OR public.is_admin()
);

-- Политика для создания: только админы могут создавать заказы
CREATE POLICY "Create orders policy" 
ON public.tire_orders 
FOR INSERT 
WITH CHECK (public.is_admin());

-- Политика для обновления: только админы
CREATE POLICY "Update orders policy" 
ON public.tire_orders 
FOR UPDATE 
USING (public.is_admin());

-- Политика для удаления: только админы
CREATE POLICY "Delete orders policy" 
ON public.tire_orders 
FOR DELETE 
USING (public.is_admin());
