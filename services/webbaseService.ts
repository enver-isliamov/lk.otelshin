
import { supabase } from '@/integrations/supabase/client';
import { WebBaseRecord } from '@/types/auth';
import { createPhoneVariants } from '@/utils/phoneUtils';

export class WebbaseService {
  // Поиск всех записей для анализа
  static async getAllRecords(): Promise<{ data: WebBaseRecord[] | null; error: any }> {
    console.log('📋 Получаем все записи из WebBase...');
    const { data, error } = await supabase
      .from('webbase')
      .select('*');

    if (error) {
      console.error('❌ Ошибка получения всех записей из WebBase:', error);
    } else {
      console.log('📋 Всего записей в WebBase:', data?.length);
      console.log('📋 Все записи WebBase:', data);
    }

    return { data: data as WebBaseRecord[] | null, error };
  }

  // Поиск по точному совпадению телефона и Chat ID
  static async findByPhoneAndChatId(phone: string, chatId: string): Promise<WebBaseRecord | null> {
    const phoneVariants = createPhoneVariants(phone);
    
    for (const phoneVariant of phoneVariants) {
      console.log('🔍 Поиск в WebBase по телефону:', phoneVariant, 'и Chat ID:', chatId);
      
      const { data, error } = await supabase
        .from('webbase')
        .select('*')
        .eq('phone', phoneVariant)
        .eq('chat_id', chatId);

      console.log('🔍 Результат поиска в WebBase для', phoneVariant, ':', data, 'Ошибка:', error);

      if (data && data.length > 0) {
        return data[0] as WebBaseRecord;
      }
    }
    
    return null;
  }

  // Поиск только по Chat ID
  static async findByChatId(chatId: string): Promise<WebBaseRecord | null> {
    console.log('🔍 Поиск в WebBase только по Chat ID:', chatId);
    const { data, error } = await supabase
      .from('webbase')
      .select('*')
      .eq('chat_id', chatId);

    console.log('🔍 Результат поиска по Chat ID в WebBase:', data, 'Ошибка:', error);

    if (data && data.length > 0) {
      return data[0] as WebBaseRecord;
    }
    
    return null;
  }

  // Поиск только по телефону
  static async findByPhone(phone: string): Promise<WebBaseRecord | null> {
    const phoneVariants = createPhoneVariants(phone);
    
    for (const phoneVariant of phoneVariants) {
      console.log('🔍 Поиск в WebBase только по телефону:', phoneVariant);
      
      const { data, error } = await supabase
        .from('webbase')
        .select('*')
        .eq('phone', phoneVariant);

      console.log('🔍 Результат поиска по телефону в WebBase:', phoneVariant, ':', data);

      if (data && data.length > 0) {
        return data[0] as WebBaseRecord;
      }
    }
    
    return null;
  }

  // Поиск с ILIKE (нечувствительный к регистру)
  static async findWithILike(phone: string, chatId: string): Promise<WebBaseRecord | null> {
    const phoneVariants = createPhoneVariants(phone);
    
    console.log('🔍 Попытка поиска в WebBase с ILIKE...');
    for (const phoneVariant of phoneVariants) {
      const { data, error } = await supabase
        .from('webbase')
        .select('*')
        .ilike('phone', `%${phoneVariant}%`);

      console.log('🔍 ILIKE поиск в WebBase для:', phoneVariant, 'результат:', data);

      if (data && data.length > 0) {
        // Дополнительная проверка Chat ID среди найденных
        const matchedRecord = (data as WebBaseRecord[]).find(p => p.chat_id === chatId);
        if (matchedRecord) {
          return matchedRecord;
        }
      }
    }
    
    return null;
  }
}
