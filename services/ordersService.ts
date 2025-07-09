
import { supabase } from '@/integrations/supabase/client';
import { TireOrder } from '@/types/auth';

export class OrdersService {
  // Получение заказов из Google Sheets через Edge Function
  static async getOrdersFromGoogleSheets(phone: string, chatId: string): Promise<{ data: TireOrder[] | null; error: any }> {
    console.log('📊 Получаем заказы из Google Sheets для:', { phone, chatId });

    try {
      // Вызываем Edge Function для получения заказов из Google Sheets
      const { data, error } = await supabase.functions.invoke('google-sheets-orders', {
        body: { 
          action: 'get_orders',
          phone: phone.trim(),
          chatId: chatId.trim()
        }
      });

      if (error) {
        console.error('❌ Ошибка вызова функции получения заказов:', error);
        return { data: null, error };
      }

      if (data && data.success) {
        console.log('✅ Получены заказы из Google Sheets:', data.orders?.length || 0);
        return { data: data.orders || [], error: null };
      }

      if (data && data.error === 'PHONE_CHATID_MISMATCH') {
        console.log('❌ Несоответствие телефона и ChatID');
        return { 
          data: null, 
          error: { 
            message: data.message,
            type: 'PHONE_CHATID_MISMATCH'
          }
        };
      }

      console.log('❌ Заказы не найдены в Google Sheets');
      return { data: [], error: null };

    } catch (error) {
      console.error('💥 Критическая ошибка при получении заказов из Google Sheets:', error);
      return { 
        data: null, 
        error: { 
          message: 'Произошла ошибка при получении заказов из Google Таблицы',
          type: 'CRITICAL_ERROR'
        }
      };
    }
  }

  // Проверка администратора (только для отображения всех данных)
  static async getAllOrdersForAdmin(): Promise<{ data: TireOrder[] | null; error: any }> {
    console.log('👑 Администратор запрашивает все заказы');
    
    // Для админа можем использовать специальный запрос или те же данные
    // В данном случае админ должен видеть все строки из Google Sheets
    try {
      const { data, error } = await supabase.functions.invoke('google-sheets-orders', {
        body: { 
          action: 'get_all_orders_admin',
          phone: '',
          chatId: ''
        }
      });

      if (error) {
        console.error('❌ Ошибка получения всех заказов для админа:', error);
        return { data: null, error };
      }

      return { data: data?.orders || [], error: null };

    } catch (error) {
      console.error('💥 Критическая ошибка получения заказов для админа:', error);
      return { 
        data: null, 
        error: { 
          message: 'Ошибка получения данных для администратора'
        }
      };
    }
  }
}
