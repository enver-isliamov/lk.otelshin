
-- Удаляем таблицу если существует и создаем заново с правильными настройками
DROP TABLE IF EXISTS public.telegram_auth_sessions CASCADE;

-- Создаем таблицу telegram_auth_sessions с правильной структурой
CREATE TABLE public.telegram_auth_sessions (
  id SERIAL PRIMARY KEY,
  auth_code VARCHAR(255) UNIQUE NOT NULL,
  chat_id VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  user_name VARCHAR(255),
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes')
);

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_telegram_auth_sessions_auth_code ON public.telegram_auth_sessions(auth_code);
CREATE INDEX IF NOT EXISTS idx_telegram_auth_sessions_expires_at ON public.telegram_auth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_telegram_auth_sessions_completed ON public.telegram_auth_sessions(is_completed);

-- Функция для автоматической очистки истекших сессий
CREATE OR REPLACE FUNCTION cleanup_expired_auth_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.telegram_auth_sessions 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Включаем RLS (Row Level Security)
ALTER TABLE public.telegram_auth_sessions ENABLE ROW LEVEL SECURITY;

-- Политика для анонимного доступа (нужно для функций)
CREATE POLICY "Allow anonymous access to telegram auth sessions" ON public.telegram_auth_sessions
  FOR ALL USING (true);

-- Комментарии к таблице
COMMENT ON TABLE public.telegram_auth_sessions IS 'Сессии авторизации через Telegram бот';
COMMENT ON COLUMN public.telegram_auth_sessions.auth_code IS 'Уникальный код авторизации';
COMMENT ON COLUMN public.telegram_auth_sessions.chat_id IS 'ID чата пользователя в Telegram';
COMMENT ON COLUMN public.telegram_auth_sessions.phone IS 'Номер телефона пользователя';
COMMENT ON COLUMN public.telegram_auth_sessions.user_name IS 'Имя пользователя';
COMMENT ON COLUMN public.telegram_auth_sessions.is_completed IS 'Флаг завершенной авторизации';
COMMENT ON COLUMN public.telegram_auth_sessions.expires_at IS 'Время истечения сессии (10 минут)';
