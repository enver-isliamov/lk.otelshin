
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHash, createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') ?? ''
const GOOGLE_SHEETS_CREDENTIALS = Deno.env.get('GOOGLE_SHEETS_CREDENTIALS') ?? ''
const GOOGLE_SHEETS_ID = Deno.env.get('GOOGLE_SHEETS_ID') ?? ''

console.log('🔧 Telegram OAuth Auth - проверка настроек')
console.log('🤖 TELEGRAM_BOT_TOKEN:', TELEGRAM_BOT_TOKEN ? 'установлен' : 'отсутствует')
console.log('📊 GOOGLE_SHEETS_ID:', GOOGLE_SHEETS_ID ? 'установлен' : 'отсутствует')
console.log('🔑 GOOGLE_SHEETS_CREDENTIALS:', GOOGLE_SHEETS_CREDENTIALS ? 'установлен' : 'отсутствует')

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

// Проверка подписи Telegram OAuth
function verifyTelegramData(data: any, botToken: string): boolean {
  try {
    console.log('🔍 Проверка подписи Telegram OAuth данных')
    
    const { hash, ...userData } = data
    
    if (!hash) {
      console.error('❌ Отсутствует hash в данных')
      return false
    }

    // Создаем строку для проверки подписи
    const dataCheckString = Object.keys(userData)
      .sort()
      .map(key => `${key}=${userData[key]}`)
      .join('\n')
    
    console.log('📝 Data check string:', dataCheckString)

    // Создаем секретный ключ из токена бота
    const secretKey = createHash("sha256")
      .update(botToken)
      .digest()

    // Создаем HMAC подпись
    const hmac = createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex")

    console.log('🔑 Вычисленный hash:', hmac)
    console.log('📩 Полученный hash:', hash)

    const isValid = hmac === hash
    console.log(isValid ? '✅ Подпись валидна' : '❌ Подпись невалидна')
    
    return isValid
  } catch (error) {
    console.error('❌ Ошибка проверки подписи:', error)
    return false
  }
}

// Поиск пользователя в Google Sheets WebBase по Telegram данным
async function findUserInWebBase(telegramId: string, firstName: string, lastName?: string, username?: string) {
  try {
    console.log('🔍 Поиск пользователя в WebBase по Telegram данным:', { telegramId, firstName, lastName, username })
    
    const accessToken = await getGoogleAccessToken()
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/WebBase!A:D`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    )

    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ Ошибка доступа к Google Sheets:', data)
      return null
    }

    console.log('📊 Строк в WebBase:', data.values?.length || 0)

    if (!data.values || data.values.length === 0) {
      console.log('📄 WebBase пуст')
      return null
    }

    // Ищем пользователя по разным критериям
    for (let i = 1; i < data.values.length; i++) {
      const row = data.values[i]
      const rowChatId = row[0]?.toString().trim()
      const rowClientName = row[1]?.toString().trim() || ''
      const rowPhone = row[2]?.toString().trim() || ''
      const rowCarNumber = row[3]?.toString().trim() || ''

      // Проверяем по Chat ID (если он совпадает с Telegram ID)
      if (rowChatId === telegramId) {
        console.log('✅ Найден пользователь по Chat ID:', rowChatId)
        return {
          chat_id: rowChatId,
          client_name: rowClientName,
          phone: rowPhone,
          car_number: rowCarNumber
        }
      }

      // Проверяем по имени (если имена похожи)
      const fullName = `${firstName} ${lastName || ''}`.trim()
      if (rowClientName && fullName && rowClientName.toLowerCase().includes(firstName.toLowerCase())) {
        console.log('✅ Найден пользователь по имени:', rowClientName)
        return {
          chat_id: rowChatId,
          client_name: rowClientName,
          phone: rowPhone,
          car_number: rowCarNumber
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

// Логирование OAuth авторизации в Google Sheets
async function logOAuthAttempt(telegramUser: any, success: boolean, foundUser?: any) {
  try {
    console.log('📝 Логирование OAuth попытки в Google Sheets')
    
    const accessToken = await getGoogleAccessToken()
    
    // Убеждаемся, что лист oauth_logs существует
    await ensureOAuthLogsSheet(accessToken)
    
    const currentTime = new Date().toISOString()
    const logData = [
      currentTime,
      telegramUser.id?.toString() || '',
      telegramUser.first_name || '',
      telegramUser.last_name || '',
      telegramUser.username || '',
      success ? 'SUCCESS' : 'FAILED',
      foundUser ? foundUser.client_name : 'NOT_FOUND',
      foundUser ? foundUser.phone : '',
      foundUser ? foundUser.chat_id : ''
    ]

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/oauth_logs!A:I:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [logData]
        })
      }
    )

    if (response.ok) {
      console.log('✅ OAuth попытка залогирована')
    } else {
      console.error('❌ Ошибка логирования OAuth попытки')
    }
  } catch (error) {
    console.error('❌ Ошибка логирования OAuth:', error)
  }
}

// Создание листа oauth_logs если его нет
async function ensureOAuthLogsSheet(accessToken: string) {
  try {
    // Проверяем существование листа
    const sheetsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    )

    const sheetsData = await sheetsResponse.json()
    const existingSheet = sheetsData.sheets?.find((sheet: any) => 
      sheet.properties.title === 'oauth_logs'
    )

    if (!existingSheet) {
      console.log('📄 Создаем лист oauth_logs')
      
      // Создаем новый лист
      const createResponse = await fetch(
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
                  title: 'oauth_logs'
                }
              }
            }]
          })
        }
      )

      if (createResponse.ok) {
        // Добавляем заголовки
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/oauth_logs!A1:I1?valueInputOption=USER_ENTERED`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              values: [['timestamp', 'telegram_id', 'first_name', 'last_name', 'username', 'status', 'found_client_name', 'found_phone', 'found_chat_id']]
            })
          }
        )
        
        console.log('✅ Лист oauth_logs создан с заголовками')
      }
    } else {
      console.log('✅ Лист oauth_logs уже существует')
    }

  } catch (error) {
    console.error('❌ Ошибка создания листа oauth_logs:', error)
  }
}

serve(async (req) => {
  const startTime = Date.now()
  console.log('\n🔐 === TELEGRAM OAUTH AUTH ЗАПУЩЕН ===')
  console.log('⏰ Время запроса:', new Date().toISOString())
  console.log('🌐 Метод:', req.method)

  // Обработка CORS
  if (req.method === 'OPTIONS') {
    console.log('⚙️ Обработка CORS OPTIONS запроса')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.text()
    console.log('📥 Получено тело запроса:', requestBody)

    let parsedBody
    try {
      parsedBody = JSON.parse(requestBody)
    } catch (parseError) {
      console.error('❌ Ошибка парсинга JSON:', parseError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON format',
        details: parseError.message 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { telegramUser } = parsedBody
    
    if (!telegramUser) {
      console.error('❌ Отсутствует telegramUser в запросе')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Telegram user data required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('🔍 Обработка Telegram OAuth данных:', telegramUser)

    // Проверяем подпись Telegram
    if (!TELEGRAM_BOT_TOKEN) {
      console.error('❌ TELEGRAM_BOT_TOKEN не настроен')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Bot token not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const isValidSignature = verifyTelegramData(telegramUser, TELEGRAM_BOT_TOKEN)
    
    if (!isValidSignature) {
      console.error('❌ Невалидная подпись Telegram данных')
      await logOAuthAttempt(telegramUser, false)
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid Telegram data signature' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('✅ Подпись Telegram данных валидна')

    // Ищем пользователя в WebBase
    const foundUser = await findUserInWebBase(
      telegramUser.id?.toString(),
      telegramUser.first_name,
      telegramUser.last_name,
      telegramUser.username
    )

    // Логируем попытку авторизации
    await logOAuthAttempt(telegramUser, !!foundUser, foundUser)

    if (!foundUser) {
      console.log('❌ Пользователь не найден в WebBase')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User not found in database',
        message: 'Пользователь не найден в базе клиентов'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('✅ Пользователь найден в WebBase:', foundUser)

    // Возвращаем данные пользователя
    const responseData = {
      success: true,
      user: foundUser
    }

    console.log('📤 Отправляем ответ:', responseData)

    const processingTime = Date.now() - startTime
    console.log('⏱️ Время обработки:', processingTime, 'мс')
    console.log('✅ === ЗАПРОС ОБРАБОТАН УСПЕШНО ===\n')

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('💥 КРИТИЧЕСКАЯ ОШИБКА в telegram-oauth-auth:')
    console.error('❌ Ошибка:', error)
    console.error('📊 Стек ошибки:', error.stack)
    console.error('⏱️ Время до ошибки:', processingTime, 'мс')
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
