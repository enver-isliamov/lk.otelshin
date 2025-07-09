import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('🔐 TELEGRAM AUTH CHECK функция загружена')

const GOOGLE_SHEETS_CREDENTIALS = Deno.env.get('GOOGLE_SHEETS_CREDENTIALS') ?? ''
const GOOGLE_SHEETS_ID = Deno.env.get('GOOGLE_SHEETS_ID') ?? ''

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

// Проверка сессии авторизации в Google Sheets
async function checkAuthSession(sessionId: string) {
  try {
    console.log('🔍 Проверяем сессию авторизации:', sessionId)
    
    const accessToken = await getGoogleAccessToken()
    
    // Получаем данные из листа telegram_sessions
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/telegram_sessions!A:F`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      console.log('⚠️ Лист telegram_sessions не найден или пустой')
      return null
    }

    const data = await response.json()
    const rows = data.values || []
    
    if (rows.length <= 1) {
      console.log('📋 Лист telegram_sessions пуст')
      return null
    }

    // Ищем сессию по SessionID (колонка A)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const rowSessionId = row[0] // Колонка A - SessionID
      
      if (rowSessionId === sessionId) {
        console.log('✅ Найдена сессия:', row)
        
        // Проверяем что сессия авторизована
        const isAuthorized = row[4] === 'true' // Колонка E - Authorized
        
        if (!isAuthorized) {
          console.log('❌ Сессия не авторизована')
          return null
        }
        
        // Получаем пользователя из WebBase по ChatID
        const chatId = row[1] // Колонка B - ChatID
        const user = await getUserFromWebBase(chatId, accessToken)
        
        return user
      }
    }
    
    console.log('❌ Сессия не найдена')
    return null
    
  } catch (error) {
    console.error('❌ Ошибка проверки сессии авторизации:', error)
    return null
  }
}

// Получение пользователя из WebBase
async function getUserFromWebBase(chatId: string, accessToken: string) {
  try {
    console.log('👤 Получаем пользователя из WebBase:', chatId)
    
    // Получаем данные из листа WebBase
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/WebBase!A:H`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      console.log('⚠️ WebBase не найден')
      return null
    }

    const data = await response.json()
    const rows = data.values || []
    
    // Ищем пользователя по Chat ID (колонка A)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const rowChatId = row[0] // Колонка A - Chat ID
      
      if (rowChatId === chatId) {
        console.log('✅ Пользователь найден в WebBase')
        return {
          chatId: row[0] || '', // Колонка A - Chat ID
          name: row[1] || '', // Колонка B - Имя клиента
          phone: row[2] || '', // Колонка C - Телефон
          address: row[3] || '', // Колонка D - Адрес
          carNumber: row[4] || '', // Колонка E - Номер авто
          order: row[5] || '', // Колонка F - Заказ
          deadline: row[6] || '', // Колонка G - Сроки
          isAdmin: row[7] === 'TRUE' || false // Колонка H - Админ
        }
      }
    }
    
    console.log('❌ Пользователь не найден в WebBase')
    return null
    
  } catch (error) {
    console.error('❌ Ошибка получения пользователя из WebBase:', error)
    return null
  }
}

serve(async (req) => {
  console.log('\n🔐 === TELEGRAM AUTH CHECK ===')
  console.log('⏰ Время:', new Date().toISOString())

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionId } = await req.json()
    
    console.log('🔍 Проверка сессии:', sessionId)
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'SessionID не предоставлен' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Проверяем сессию авторизации
    const user = await checkAuthSession(sessionId)
    
    if (user) {
      console.log('✅ Авторизация успешна для пользователя:', user.name)
      return new Response(
        JSON.stringify({ 
          success: true, 
          user: user 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      console.log('❌ Сессия недействительна или пользователь не найден')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Сессия недействительна или пользователь не найден' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('💥 КРИТИЧЕСКАЯ ОШИБКА в telegram-auth-check:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Внутренняя ошибка сервера' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})