
-- Создание таблицы для хранения сессий Telegram авторизации
CREATE TABLE IF NOT EXISTS telegram_auth_sessions (
  id SERIAL PRIMARY KEY,
  auth_code VARCHAR(255) UNIQUE NOT NULL,
  chat_id VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  user_name VARCHAR(255),
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes')
);

-- Индекс для быстрого поиска по коду авторизации
CREATE INDEX IF NOT EXISTS idx_telegram_auth_sessions_auth_code ON telegram_auth_sessions(auth_code);

-- Индекс для очистки истекших сессий
CREATE INDEX IF NOT EXISTS idx_telegram_auth_sessions_expires_at ON telegram_auth_sessions(expires_at);

-- Функция для автоматической очистки истекших сессий
CREATE OR REPLACE FUNCTION cleanup_expired_auth_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM telegram_auth_sessions 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Комментарии к таблице
COMMENT ON TABLE telegram_auth_sessions IS 'Сессии авторизации через Telegram бот';
COMMENT ON COLUMN telegram_auth_sessions.auth_code IS 'Уникальный код авторизации';
COMMENT ON COLUMN telegram_auth_sessions.chat_id IS 'ID чата пользователя в Telegram';
COMMENT ON COLUMN telegram_auth_sessions.phone IS 'Номер телефона пользователя';
COMMENT ON COLUMN telegram_auth_sessions.user_name IS 'Имя пользователя';
COMMENT ON COLUMN telegram_auth_sessions.is_completed IS 'Флаг завершенной авторизации';
COMMENT ON COLUMN telegram_auth_sessions.expires_at IS 'Время истечения сессии (10 минут)';
