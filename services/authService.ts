
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';
import { createPhoneVariants } from '@/utils/phoneUtils';

export class AuthService {
  // Поиск пользователя в Google Sheets через Edge Function со строгой проверкой
  static async findUserInGoogleSheets(phone: string, chatId: string): Promise<any | null> {
    console.log('🔐 Попытка авторизации через Google Sheets WebBase:', { phone, chatId });

    try {
      // Вызываем Edge Function для поиска в Google Sheets
      const { data, error } = await supabase.functions.invoke('google-sheets-auth', {
        body: { 
          phone: phone.trim(),
          chatId: chatId.trim(),
          action: 'authenticate'
        }
      });

      if (error) {
        console.error('❌ Ошибка вызова функции авторизации:', error);
        return null;
      }

      if (data && data.success && data.user) {
        console.log('✅ Найден пользователь в Google Sheets:', data.user);
        return data.user;
      }

      console.log('❌ Пользователь не найден в Google Sheets или неверные учетные данные');
      return null;

    } catch (error) {
      console.error('💥 Критическая ошибка при поиске в Google Sheets:', error);
      return null;
    }
  }

  // Создание профиля для совместимости с системой
  static createUserProfile(googleSheetsUser: any): UserProfile {
    return {
      id: googleSheetsUser.chat_id || `user_${Date.now()}`,
      name: googleSheetsUser.client_name || 'Клиент',
      phone: googleSheetsUser.phone || '',
      chat_id: googleSheetsUser.chat_id || '',
      is_admin: false, // В Google Sheets может не быть этого поля
      address: googleSheetsUser.client_address || '',
      car_number: googleSheetsUser.car_number || ''
    };
  }
}
