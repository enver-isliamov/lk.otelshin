
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('🚀 WebBase Google Sheets Sync function started');

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

      // Получаем данные из Google Sheets с листа WebBase
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
            imported_records: 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Предполагаем, что первая строка - заголовки
      const headers = rows[0] || [];
      const dataRows = rows.slice(1);

      console.log('📋 Заголовки таблицы:', headers);

      // Определяем индексы столбцов (гибко, по названиям)
      const phoneIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('телефон') || h.toLowerCase().includes('phone')
      );
      const chatIdIndex = headers.findIndex(h => 
        h && (h.toLowerCase().includes('chat') || h.toLowerCase().includes('id'))
      );
      const nameIndex = headers.findIndex(h => 
        h && (h.toLowerCase().includes('имя') || h.toLowerCase().includes('name') || h.toLowerCase().includes('клиент'))
      );
      const carNumberIndex = headers.findIndex(h => 
        h && (h.toLowerCase().includes('авто') || h.toLowerCase().includes('машин') || h.toLowerCase().includes('номер'))
      );
      const addressIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('адрес')
      );

      console.log('📍 Найденные индексы столбцов:', {
        phone: phoneIndex,
        chatId: chatIdIndex,
        name: nameIndex,
        carNumber: carNumberIndex,
        address: addressIndex
      });

      // Очищаем существующие данные в webbase
      const { error: deleteError } = await supabase
        .from('webbase')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Удаляем все записи

      if (deleteError) {
        console.error('❌ Ошибка очистки таблицы webbase:', deleteError);
      } else {
        console.log('✅ Таблица webbase очищена');
      }

      // Импортируем новые данные
      const webbaseRecords = [];
      let importedCount = 0;

      for (const row of dataRows) {
        if (!row || row.length === 0) continue;

        const phone = phoneIndex >= 0 ? row[phoneIndex]?.trim() : '';
        const chatId = chatIdIndex >= 0 ? row[chatIdIndex]?.trim() : '';
        const clientName = nameIndex >= 0 ? row[nameIndex]?.trim() : '';
        const carNumber = carNumberIndex >= 0 ? row[carNumberIndex]?.trim() : '';
        const address = addressIndex >= 0 ? row[addressIndex]?.trim() : '';

        // Пропускаем строки без телефона или Chat ID
        if (!phone && !chatId) continue;

        const record = {
          phone: phone || null,
          chat_id: chatId || null,
          client_name: clientName || null,
          car_number: carNumber || null,
          client_address: address || null,
          is_admin: false
        };

        webbaseRecords.push(record);
        importedCount++;
      }

      console.log(`📊 Подготовлено записей для импорта: ${webbaseRecords.length}`);

      // Вставляем данные пакетами
      if (webbaseRecords.length > 0) {
        const { error: insertError } = await supabase
          .from('webbase')
          .insert(webbaseRecords);

        if (insertError) {
          console.error('❌ Ошибка вставки данных в webbase:', insertError);
          throw insertError;
        }

        console.log('✅ Данные успешно импортированы в webbase');
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Синхронизация WebBase завершена. Импортировано записей: ${importedCount}`,
          imported_records: importedCount,
          total_rows: dataRows.length
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
