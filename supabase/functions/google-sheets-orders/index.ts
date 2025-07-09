
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('📊 Google Sheets Orders function started');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, phone, chatId } = await req.json();
    
    console.log('📞 Запрос заказов:', { action, phone, chatId });

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
    
    // Process private key
    let privateKey = credentials.private_key;
    privateKey = privateKey.replace(/\\n/g, '\n');
    privateKey = privateKey.replace(/"/g, '');
    
    if (!privateKey.includes('-----BEGIN')) {
      console.error('❌ Неверный формат приватного ключа - отсутствует заголовок');
      throw new Error('Неверный формат приватного ключа');
    }

    console.log('🔑 Обработка приватного ключа...');
    
    try {
      const pemHeader = '-----BEGIN PRIVATE KEY-----';
      const pemFooter = '-----END PRIVATE KEY-----';
      
      const pemContents = privateKey
        .replace(pemHeader, '')
        .replace(pemFooter, '')
        .replace(/\s/g, '');
      
      const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

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

      // Получаем данные из Google Sheets (все листы с заказами)
      const getResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/WebBase!A:Z`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!getResponse.ok) {
        const errorText = await getResponse.text();
        console.error('❌ Ошибка чтения Google Sheets:', errorText);
        throw new Error(`Ошибка чтения Google Sheets: ${errorText}`);
      }

      const sheetsData = await getResponse.json();
      const rows = sheetsData.values || [];
      
      console.log(`📊 Получено строк из Google Sheets: ${rows.length}`);

      if (rows.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Google таблица пуста',
            orders: []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Предполагаем, что первая строка - заголовки
      const headers = rows[0] || [];
      const dataRows = rows.slice(1);

      console.log('📋 Заголовки таблицы:', headers);

      // Определяем индексы столбцов (строго по названиям из Google Sheets)
      const chatIdIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('chat')
      );
      const nameIndex = headers.findIndex(h => 
        h && (h.toLowerCase().includes('имя') || h.toLowerCase().includes('клиент'))
      );
      const phoneIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('телефон')
      );
      const carNumberIndex = headers.findIndex(h => 
        h && (h.toLowerCase().includes('авто') || h.toLowerCase().includes('номер'))
      );
      const orderQrIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('заказ')
      );
      const monthlyPriceIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('цена за месяц')
      );
      const tireCountIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('кол-во')
      );
      const hasDisksIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('диск')
      );
      const startDateIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('начало')
      );
      const storagePeriodIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('срок')
      );
      const reminderDateIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('напоминить')
      );
      const endDateIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('окончание')
      );
      const storageLocationIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('склад')
      );
      const storageCellIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('ячейка')
      );
      const totalAmountIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('общая сумма')
      );
      const debtIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('долг')
      );
      const contractIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('договор')
      );
      const clientAddressIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('адрес')
      );
      const dealStatusIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('статус')
      );
      const trafficSourceIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('источник')
      );

      console.log('📍 Найденные индексы столбцов:', {
        chatId: chatIdIndex,
        name: nameIndex,
        phone: phoneIndex,
        carNumber: carNumberIndex
      });

      // Строгая проверка: ищем ТОЧНОЕ совпадение телефона И ChatID
      let userFound = false;
      let orders = [];

      for (const row of dataRows) {
        if (!row || row.length === 0) continue;

        const rowChatId = chatIdIndex >= 0 ? row[chatIdIndex]?.toString().trim() : '';
        const rowPhone = phoneIndex >= 0 ? row[phoneIndex]?.toString().trim() : '';
        const rowName = nameIndex >= 0 ? row[nameIndex]?.toString().trim() : '';

        console.log('🔍 Проверяем строку:', { rowChatId, rowPhone, rowName });

        // СТРОГАЯ ПРОВЕРКА: точное совпадение телефона И ChatID
        if (rowPhone === phone && rowChatId === chatId) {
          userFound = true;
          console.log('✅ Найдено точное соответствие телефона и ChatID');
          
          // Создаем заказ из этой строки
          const order = {
            id: `order_${Date.now()}_${Math.random()}`,
            chat_id: rowChatId,
            client_name: rowName,
            phone: rowPhone,
            car_number: carNumberIndex >= 0 ? row[carNumberIndex]?.toString().trim() : '',
            order_qr: orderQrIndex >= 0 ? row[orderQrIndex]?.toString().trim() : '',
            monthly_price: monthlyPriceIndex >= 0 ? parseFloat(row[monthlyPriceIndex]) || 0 : 0,
            tire_count: tireCountIndex >= 0 ? parseInt(row[tireCountIndex]) || 0 : 0,
            has_disks: hasDisksIndex >= 0 ? (row[hasDisksIndex]?.toString().toLowerCase().includes('да') || false) : false,
            start_date: startDateIndex >= 0 ? row[startDateIndex]?.toString().trim() : '',
            storage_period: storagePeriodIndex >= 0 ? parseInt(row[storagePeriodIndex]) || 0 : 0,
            reminder_date: reminderDateIndex >= 0 ? row[reminderDateIndex]?.toString().trim() : '',
            end_date: endDateIndex >= 0 ? row[endDateIndex]?.toString().trim() : '',
            storage_location: storageLocationIndex >= 0 ? row[storageLocationIndex]?.toString().trim() : '',
            storage_cell: storageCellIndex >= 0 ? row[storageCellIndex]?.toString().trim() : '',
            total_amount: totalAmountIndex >= 0 ? parseFloat(row[totalAmountIndex]) || 0 : 0,
            debt: debtIndex >= 0 ? parseFloat(row[debtIndex]) || 0 : 0,
            contract: contractIndex >= 0 ? row[contractIndex]?.toString().trim() : '',
            client_address: clientAddressIndex >= 0 ? row[clientAddressIndex]?.toString().trim() : '',
            deal_status: dealStatusIndex >= 0 ? row[dealStatusIndex]?.toString().trim() : 'new',
            traffic_source: trafficSourceIndex >= 0 ? row[trafficSourceIndex]?.toString().trim() : '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          orders.push(order);
        }
      }

      // Проверяем, есть ли номер телефона с другим ChatID
      const phoneExists = dataRows.some(row => {
        const rowPhone = phoneIndex >= 0 ? row[phoneIndex]?.toString().trim() : '';
        const rowChatId = chatIdIndex >= 0 ? row[chatIdIndex]?.toString().trim() : '';
        return rowPhone === phone && rowChatId !== chatId;
      });

      if (!userFound && phoneExists) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Номер телефона найден, но Chat ID не совпадает. Проверьте правильность введенного Chat ID.',
            error: 'PHONE_CHATID_MISMATCH',
            orders: []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!userFound) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Пользователь с указанными телефоном и Chat ID не найден',
            error: 'USER_NOT_FOUND',
            orders: []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Найдено заказов: ${orders.length}`,
          orders: orders
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
        success: false,
        orders: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
