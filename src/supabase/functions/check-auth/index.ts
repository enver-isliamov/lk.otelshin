import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_SHEETS_CREDENTIALS = Deno.env.get('GOOGLE_SHEETS_CREDENTIALS') ?? ''
const GOOGLE_SHEETS_ID = Deno.env.get('GOOGLE_SHEETS_ID') ?? ''

console.log('🔐 Check Auth function started')

// Функция для получения Google Access Token
async function getGoogleAccessToken() {
  try {
    console.log('🔐 Получение Google Access Token...')
    
    if (!GOOGLE_SHEETS_CREDENTIALS) {
      throw new Error('GOOGLE_SHEETS_CREDENTIALS не установлен')
    }

    const credentials = JSON.parse(GOOGLE_SHEETS_CREDENTIALS)
    
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    }

    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    }

    let privateKey = credentials.private_key.replace(/\\n/g, '\n')
    
    const pemHeader = '-----BEGIN PRIVATE KEY-----'
    const pemFooter = '-----END PRIVATE KEY-----'
    const pemContents = privateKey
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '')
    
    const binaryData = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))
    
    const keyData = await crypto.subtle.importKey(
      'pkcs8',
      binaryData,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    )

    const headerBase64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const payloadBase64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const unsignedToken = `${headerBase64}.${payloadBase64}`

    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      keyData,
      new TextEncoder().encode(unsignedToken)
    )

    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    
    const jwt = `${unsignedToken}.${signatureBase64}`

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    })

    const tokenData = await tokenResponse.json()
    
    if (!tokenResponse.ok) {
      throw new Error(`Ошибка токена: ${tokenData.error_description || tokenData.error}`)
    }

    console.log('✅ Access token получен')
    return tokenData.access_token

  } catch (error) {
    console.error('❌ Ошибка получения access token:', error)
    throw error
  }
}

// Проверка авторизации по sessionId
async function checkAuthBySessionId(sessionId: string) {
  try {
    console.log('🔍 НАЧАЛО проверки авторизации для sessionId:', sessionId)
    console.log('📊 Используем Google Sheets ID:', GOOGLE_SHEETS_ID)
    
    const accessToken = await getGoogleAccessToken()
    console.log('🔐 Access token получен для проверки авторизации')
    
    // Сначала пытаемся создать лист, если его нет
    try {
      console.log('🔍 Проверяем и создаем лист telegram_sessions если нужно')
      
      const addSheetResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [{
              addSheet: {
                properties: {
                  title: 'telegram_sessions'
                }
              }
            }]
          })
        }
      )
      
      if (addSheetResponse.ok) {
        console.log('✅ Лист telegram_sessions создан')
        // Добавляем заголовки
        const headerValues = [['SessionID', 'ChatID', 'UserName', 'Phone', 'Authorized', 'Timestamp']]
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/telegram_sessions!A1:F1?valueInputOption=RAW`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ values: headerValues })
          }
        )
      }
    } catch (sheetError) {
      console.log('📋 Лист telegram_sessions уже существует')
    }

    // Проверяем лист telegram_sessions с расширенным диапазоном
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/telegram_sessions!A:F`
    console.log('🌐 Запрос к Google Sheets:', sheetsUrl)
    
    const response = await fetch(sheetsUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ Ошибка доступа к Google Sheets:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      })
      
      // Если лист не найден, возвращаем null но не ошибку
      if (response.status === 400 && data?.error?.message?.includes('Unable to parse range')) {
        console.log('⚠️ Лист telegram_sessions не найден, возвращаем null')
        return null
      }
      
      return null
    }

    console.log('📊 ПОЛНЫЙ ответ от Google Sheets:', JSON.stringify(data, null, 2))
    console.log('📊 Всего строк в telegram_sessions:', data.values?.length || 0)

    if (!data.values || data.values.length === 0) {
      console.log('📄 Лист telegram_sessions пуст')
      return null
    }

    // Ищем авторизацию по sessionId (начинаем с последних записей)
    console.log('🔍 Начинаем поиск по строкам (снизу вверх)...')
    
    for (let i = data.values.length - 1; i >= 1; i--) {
      const row = data.values[i]
      const rowSessionId = row[0]?.toString().trim()
      const chatId = row[1]?.toString().trim()
      const userName = row[2]?.toString().trim()
      const phone = row[3]?.toString().trim()
      const isAuthorized = row[4]?.toString().trim()
      const timestamp = row[5]?.toString().trim()
      
      console.log(`🔍 Строка ${i}:`, { 
        rowSessionId, 
        chatId, 
        userName, 
        phone, 
        isAuthorized, 
        timestamp,
        matchesSession: rowSessionId === sessionId
      })
      
      if (rowSessionId === sessionId) {
        console.log('🎯 НАЙДЕН MATCHING SESSION ID в строке', i)
        
        if (isAuthorized === 'true') {
          console.log('✅ Сессия АВТОРИЗОВАНА! Получаем данные пользователя...')
          
          // Получаем полные данные пользователя из WebBase
          const userData = await getUserFromWebBase(chatId, accessToken)
          
          const finalUserData = userData || {
            chat_id: chatId,
            client_name: userName,
            phone: phone,
            car_number: '',
            client_address: ''
          }
          
          console.log('✅ ФИНАЛЬНЫЕ данные пользователя:', JSON.stringify(finalUserData, null, 2))
          return finalUserData
        } else {
          console.log('⚠️ Сессия найдена, но НЕ авторизована:', isAuthorized)
        }
        
        // Прерываем поиск, так как нашли нужную сессию
        break
      }
    }

    console.log('❌ Авторизованная сессия не найдена для sessionId:', sessionId)
    return null

  } catch (error) {
    console.error('❌ Ошибка проверки авторизации:', error)
    return null
  }
}

// Получение данных пользователя из WebBase
async function getUserFromWebBase(chatId: string, accessToken: string) {
  try {
    console.log('🔍 Поиск пользователя в WebBase:', chatId)
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/WebBase!A:D`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    )

    const data = await response.json()
    
    if (!response.ok || !data.values) {
      return null
    }

    // Поиск по Chat ID
    for (let i = 1; i < data.values.length; i++) {
      const row = data.values[i]
      const rowChatId = row[0]?.toString().trim()
      
      if (rowChatId === chatId) {
        console.log('✅ Пользователь найден в WebBase')
        return {
          chat_id: rowChatId,
          client_name: row[1] || '',
          phone: row[2] || '',
          car_number: row[3] || '',
          client_address: ''
        }
      }
    }

    console.log('❌ Пользователь не найден в WebBase')
    return null

  } catch (error) {
    console.error('❌ Ошибка поиска в WebBase:', error)
    return null
  }
}

serve(async (req) => {
  console.log('\n🔐 === CHECK AUTH REQUEST ===')
  console.log('⏰ Время:', new Date().toISOString())

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const sessionId = url.searchParams.get('session')
    
    if (!sessionId) {
      console.error('❌ Отсутствует sessionId в запросе')
      return new Response(JSON.stringify({ 
        authorized: false, 
        error: 'Session ID required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('🔍 Проверка авторизации для sessionId:', sessionId)

    const userData = await checkAuthBySessionId(sessionId)

    if (userData) {
      console.log('✅ Пользователь авторизован:', userData)
      return new Response(JSON.stringify({ 
        authorized: true, 
        user: userData 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      console.log('❌ Пользователь не авторизован')
      return new Response(JSON.stringify({ 
        authorized: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('💥 КРИТИЧЕСКАЯ ОШИБКА:', error)
    
    return new Response(JSON.stringify({ 
      authorized: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})