
// Функция для нормализации номера телефона
export const normalizePhone = (phone: string): string => {
  // Убираем все не-цифровые символы
  const digits = phone.replace(/\D/g, '');
  console.log('🔧 Цифры из номера:', digits);
  
  // Различные форматы российских номеров
  if (digits.startsWith('8') && digits.length === 11) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.startsWith('7') && digits.length === 11) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+7${digits}`;
  }
  
  return phone; // Возвращаем исходный формат если не удалось нормализовать
};

// Создаем различные варианты поиска номера телефона
export const createPhoneVariants = (phone: string): string[] => {
  const normalizedPhone = normalizePhone(phone);
  
  const phoneVariants = [
    phone.trim(), // Исходный формат (с trim)
    normalizedPhone, // Нормализованный формат
    phone.replace(/\D/g, ''), // Только цифры
    phone.replace(/[\s\-\(\)]/g, ''), // Без пробелов и скобок
    phone.replace(/\+/g, ''), // Без плюса
  ];

  // Убираем дубликаты
  return [...new Set(phoneVariants)];
};
