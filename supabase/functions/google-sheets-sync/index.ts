
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('🚀 Google Sheets Sync function started');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get environment variables
    const sheetsId = Deno.env.get('GOOGLE_SHEETS_ID');
    const credentialsJson = Deno.env.get('GOOGLE_SHEETS_CREDENTIALS');

    if (!sheetsId || !credentialsJson) {
      console.error('❌ Missing Google Sheets configuration');
      throw new Error('Google Sheets ID или учетные данные не настроены');
    }

    console.log('📋 Google Sheets ID:', sheetsId);

    // Parse credentials
    let credentials;
    try {
      credentials = JSON.parse(credentialsJson);
      console.log('✅ Учетные данные успешно распарсены');
    } catch (error) {
      console.error('❌ Ошибка парсинга учетных данных:', error);
      throw new Error('Неверный формат учетных данных Google');
    }

    // Create JWT token for Google API
    const now = Math.floor(Date.now() / 1000);
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const payload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    // Encode header and payload
    const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    // Create signature
    const message = `${headerB64}.${payloadB64}`;
    
    // Process private key - улучшенная обработка
    let privateKey = credentials.private_key;
    
    // Убираем экранирование и лишние символы
    privateKey = privateKey.replace(/\\n/g, '\n');
    privateKey = privateKey.replace(/"/g, '');
    
    // Убеждаемся, что есть правильные заголовки
    if (!privateKey.includes('-----BEGIN')) {
      console.error('❌ Неверный формат приватного ключа - отсутствует заголовок');
      throw new Error('Неверный формат приватного ключа');
    }

    console.log('🔑 Обработка приватного ключа...');
    
    try {
      // Преобразуем приватный ключ в нужный формат для Web Crypto API
      const pemHeader = '-----BEGIN PRIVATE KEY-----';
      const pemFooter = '-----END PRIVATE KEY-----';
      
      // Удаляем заголовки и переносы строк
      const pemContents = privateKey
        .replace(pemHeader, '')
        .replace(pemFooter, '')
        .replace(/\s/g, '');
      
      // Декодируем base64
      const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

      // Импортируем ключ
      const keyData = await crypto.subtle.importKey(
        'pkcs8',
        binaryDer.buffer,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256',
        },
        false,
        ['sign']
      );

      console.log('✅ Приватный ключ успешно импортирован');

      // Подписываем сообщение
      const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        keyData,
        new TextEncoder().encode(message)
      );

      const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

      const jwt = `${message}.${signatureB64}`;
      console.log('✅ JWT токен создан');

      // Get access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('❌ Ошибка получения токена:', errorText);
        throw new Error(`Ошибка аутентификации: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      console.log('✅ Access token получен');

      // Fetch orders from Supabase (using service role key bypasses RLS)
      const { data: orders, error: ordersError } = await supabase
        .from('tire_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('❌ Ошибка загрузки заказов:', ordersError);
        throw ordersError;
      }

      console.log(`📊 Загружено заказов: ${orders?.length || 0}`);

      // Получаем существующие данные из таблицы
      const getResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/WebBase!A:Z`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      let existingData = [];
      if (getResponse.ok) {
        const existingDataResponse = await getResponse.json();
        existingData = existingDataResponse.values || [];
        console.log(`📋 Существующих строк в таблице: ${existingData.length}`);
      }

      // Подготавливаем данные для записи
      const headers = [
        'ID', 'Имя клиента', 'Телефон', 'Номер авто', 'Количество шин', 
        'С дисками', 'Дата начала', 'Период (мес)', 'Дата окончания', 
        'Цена за месяц', 'Общая сумма', 'Долг', 'Статус', 'Склад', 
        'Ячейка', 'Дата создания'
      ];

      const orderRows = orders?.map(order => [
        order.id,
        order.client_name || '',
        order.phone || '',
        order.car_number || '',
        order.tire_count || 0,
        order.has_disks ? 'Да' : 'Нет',
        order.start_date || '',
        order.storage_period || 0,
        order.end_date || '',
        order.monthly_price || 0,
        order.total_amount || 0,
        order.debt || 0,
        order.deal_status || '',
        order.storage_location || '',
        order.storage_cell || '',
        order.created_at || ''
      ]) || [];

      // Определяем что нужно записать
      let dataToWrite = [];
      let newOrdersCount = 0;
      
      if (existingData.length === 0) {
        // Если таблица пустая, записываем заголовки и все заказы
        dataToWrite = [headers, ...orderRows];
        newOrdersCount = orderRows.length;
        console.log('📝 Записываем данные с заголовками (новая таблица)');
      } else {
        // Проверяем, есть ли уже заголовки
        const hasHeaders = existingData[0] && existingData[0].includes('ID');
        
        if (!hasHeaders) {
          // Если нет заголовков, добавляем их
          dataToWrite = [headers, ...existingData, ...orderRows];
          newOrdersCount = orderRows.length;
          console.log('📝 Добавляем заголовки и все данные');
        } else {
          // Получаем ID существующих заказов из второй колонки (индекс 0)
          const existingIds = new Set();
          for (let i = 1; i < existingData.length; i++) {
            if (existingData[i] && existingData[i][0]) {
              existingIds.add(existingData[i][0]);
            }
          }

          // Фильтруем только новые заказы
          const newOrderRows = orderRows.filter(row => !existingIds.has(row[0]));
          newOrdersCount = newOrderRows.length;
          
          if (newOrderRows.length > 0) {
            // Добавляем только новые заказы к существующим данным
            dataToWrite = [...existingData, ...newOrderRows];
            console.log(`📝 Добавляем ${newOrderRows.length} новых заказов к существующим данным`);
          } else {
            console.log('✅ Все заказы уже присутствуют в таблице, обновление не требуется');
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: 'Все заказы уже синхронизированы',
                total_orders: orders?.length || 0,
                new_orders: 0
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }

      // Записываем данные в Google Sheets (только если есть изменения)
      const writeResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/WebBase!A1?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: dataToWrite
          }),
        }
      );

      if (!writeResponse.ok) {
        const errorText = await writeResponse.text();
        console.error('❌ Ошибка записи в Google Sheets:', errorText);
        throw new Error(`Ошибка записи в Google Sheets: ${errorText}`);
      }

      const writeResult = await writeResponse.json();
      console.log('✅ Данные успешно синхронизированы с Google Sheets');
      console.log(`📊 Обновлено строк: ${writeResult.updatedRows || 0}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Синхронизация завершена. Добавлено новых заказов: ${newOrdersCount}`,
          total_orders: orders?.length || 0,
          new_orders: newOrdersCount,
          updated_rows: writeResult.updatedRows || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (keyError) {
      console.error('❌ Ошибка при работе с приватным ключом:', keyError);
      throw new Error(`Ошибка обработки приватного ключа: ${keyError.message}`);
    }

  } catch (error) {
    console.error('💥 Критическая ошибка:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Неизвестная ошибка',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
