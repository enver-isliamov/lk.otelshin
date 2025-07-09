import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('🚀 TELEGRAM BOT функция загружена для автоматической авторизации')

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const GOOGLE_SHEETS_CREDENTIALS = Deno.env.get('GOOGLE_SHEETS_CREDENTIALS') ?? ''
const GOOGLE_SHEETS_ID = Deno.env.get('GOOGLE_SHEETS_ID') ?? ''

console.log('🔍 Переменные окружения проверены')
console.log('🤖 BOT_TOKEN:', BOT_TOKEN ? 'установлен' : 'отсутствует')
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

// Проверка пользователя в WebBase (обновлено для 20 столбцов)
async function checkUserInWebBase(chatId: string, userName: string) {
  try {
    console.log('🔍 Проверяем пользователя в WebBase:', { chatId, userName })
    
    const accessToken = await getGoogleAccessToken()
    
    // Получаем данные из листа WebBase (A-T, 20 столбцов)
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/WebBase!A:T`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      console.log('⚠️ WebBase не найден или пустой')
      return null
    }

    const data = await response.json()
    const rows = data.values || []
    
    if (rows.length <= 1) {
      console.log('📋 WebBase пуст')
      return null
    }

    // Ищем пользователя по Chat ID (колонка A)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const rowChatId = row[0] // Колонка A - Chat ID
      
      if (rowChatId === chatId) {
        console.log('✅ Пользователь найден в WebBase:', row)
        return {
          rowIndex: i + 1,
          chatId: row[0] || chatId, // A - Chat ID
          name: row[1] || userName, // B - Имя клиента
          phone: row[2] || '', // C - Телефон
          carNumber: row[3] || '', // D - Номер Авто
          order: row[4] || '', // E - Заказ - QR
          monthlyPrice: row[5] || '', // F - Цена за месяц
          tireCount: row[6] || '', // G - Кол-во шин
          hasRims: row[7] || '', // H - Наличие дисков
          startDate: row[8] || '', // I - Начало
          term: row[9] || '', // J - Срок
          reminder: row[10] || '', // K - Напомнить
          endDate: row[11] || '', // L - Окончание
          storage: row[12] || '', // M - Склад хранения
          cell: row[13] || '', // N - Ячейка
          totalSum: row[14] || '', // O - Общая сумма
          debt: row[15] || '', // P - Долг
          contract: row[16] || '', // Q - Договор
          // Не включаем R, S, T (адрес клиента, статус сделки, источник трафика)
          isAdmin: false // Админ статус определяется отдельно
        }
      }
    }
    
    console.log('❌ Пользователь не найден в WebBase')
    return null
    
  } catch (error) {
    console.error('❌ Ошибка проверки пользователя в WebBase:', error)
    return null
  }
}

// Добавление нового пользователя в WebBase (обновлено для 20 столбцов)
async function addUserToWebBase(chatId: string, userName: string) {
  try {
    console.log('➕ Добавляем пользователя в WebBase:', { chatId, userName })
    
    const accessToken = await getGoogleAccessToken()
    
    // Добавляем новую строку в WebBase: A-Chat ID, B-Имя клиента, C-Телефон, остальные пустые
    const values = [[
      chatId, // A - Chat ID
      userName, // B - Имя клиента
      '', // C - Телефон (будет заполнен при получении контакта)
      '', // D - Номер Авто
      '', // E - Заказ - QR
      '', // F - Цена за месяц
      '', // G - Кол-во шин
      '', // H - Наличие дисков
      '', // I - Начало
      '', // J - Срок
      '', // K - Напомнить
      '', // L - Окончание
      '', // M - Склад хранения
      '', // N - Ячейка
      '', // O - Общая сумма
      '', // P - Долг
      '', // Q - Договор
      '', // R - Адрес клиента
      '', // S - Статус сделки
      '' // T - Источник трафика
    ]]

    const appendResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/WebBase!A:T:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      }
    )

    if (!appendResponse.ok) {
      const error = await appendResponse.text()
      throw new Error(`Ошибка добавления в WebBase: ${error}`)
    }

    const result = await appendResponse.json()
    const addedRowIndex = result.updates?.updatedRange?.match(/(\d+)$/)?.[1]
    
    console.log('✅ Пользователь добавлен в WebBase, строка:', addedRowIndex)
    
    // Выделяем добавленную строку цветом
    if (addedRowIndex) {
      await highlightNewRow(accessToken, parseInt(addedRowIndex))
    }
    
    return parseInt(addedRowIndex) || null

  } catch (error) {
    console.error('❌ Ошибка добавления пользователя в WebBase:', error)
    throw error
  }
}

// Выделение новой строки цветом
async function highlightNewRow(accessToken: string, rowIndex: number) {
  try {
    console.log('🎨 Выделяем строку цветом:', rowIndex)
    
    const formatResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [{
            repeatCell: {
              range: {
                sheetId: 0, // Предполагаем что WebBase - первый лист
                startRowIndex: rowIndex - 1,
                endRowIndex: rowIndex,
                startColumnIndex: 0,
                endColumnIndex: 20 // Обновлено до 20 столбцов (A-T)
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.9,
                    green: 1.0,
                    blue: 0.9,
                    alpha: 1.0
                  }
                }
              },
              fields: 'userEnteredFormat.backgroundColor'
            }
          }]
        })
      }
    )
    
    if (formatResponse.ok) {
      console.log('✅ Строка выделена цветом')
    } else {
      console.log('⚠️ Не удалось выделить строку цветом')
    }
    
  } catch (error) {
    console.error('❌ Ошибка выделения строки:', error)
  }
}

// Сохранение сессии авторизации в Google Sheets
async function saveAuthSession(sessionId: string, chatId: string, userName: string) {
  try {
    console.log('💾 Сохраняем сессию авторизации:', { sessionId, chatId, userName })
    
    const accessToken = await getGoogleAccessToken()
    
    // Сначала пытаемся создать лист, если его нет
    try {
      console.log('🔍 Проверяем существование листа telegram_sessions')
      
      // Пытаемся добавить лист, если его нет
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
      } else {
        console.log('📋 Лист telegram_sessions уже существует')
      }
    } catch (sheetError) {
      console.log('📋 Лист telegram_sessions уже существует или ошибка создания:', sheetError.message)
    }
    
    // Создаем заголовки, если их нет
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
    
    // Добавляем новую строку с данными авторизации
    const values = [[
      sessionId,
      chatId,
      userName,
      '',  // телефон пока пустой
      'true',  // авторизован
      new Date().toISOString() // время авторизации
    ]]

    const appendResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/telegram_sessions!A:F:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      }
    )

    if (!appendResponse.ok) {
      const error = await appendResponse.text()
      throw new Error(`Ошибка сохранения в Google Sheets: ${error}`)
    }

    console.log('✅ Сессия авторизации сохранена в Google Sheets')

  } catch (error) {
    console.error('❌ Ошибка сохранения сессии авторизации:', error)
    throw error
  }
}

// Отправка сообщения в Telegram
async function sendTelegramMessage(chatId: string, message: string) {
  try {
    if (!BOT_TOKEN) {
      throw new Error('BOT_TOKEN не установлен')
    }

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Ошибка отправки сообщения: ${error}`)
    }

    console.log('✅ Сообщение отправлено в Telegram')

  } catch (error) {
    console.error('❌ Ошибка отправки сообщения в Telegram:', error)
  }
}

// Установка меню кнопки для бота (Web App кнопка)
async function setMenuButton(chatId: string) {
  try {
    if (!BOT_TOKEN) {
      throw new Error('BOT_TOKEN не установлен')
    }

    // Создаем новую авторизационную сессию для Web App кнопки
    const sessionId = `telegram_${chatId}_${Date.now()}`
    const authUrl = `https://id-preview--86de7c90-bfa2-4ea9-b1d2-216984f4b59d.lovable.app/dashboard?auth=${sessionId}`
    
    // Сохраняем сессию в Google Sheets
    await saveAuthSession(sessionId, chatId, 'WebApp')

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        menu_button: {
          type: 'web_app',
          text: 'Личный Кабинет',
          web_app: {
            url: authUrl
          }
        }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Ошибка установки меню кнопки:', error)
    } else {
      console.log('✅ Меню кнопка установлена для пользователя:', chatId)
    }

  } catch (error) {
    console.error('❌ Ошибка установки меню кнопки:', error)
  }
}

// Создание авторизационной сессии для входа в личный кабинет
async function createAuthSession(chatId: string, userName: string) {
  try {
    const sessionId = `telegram_${chatId}_${Date.now()}`
    console.log('🔑 Создаем авторизационную сессию:', sessionId)
    
    // Сохраняем сессию в Google Sheets
    await saveAuthSession(sessionId, chatId, userName)
    
    // Возвращаем ссылку для автоматической авторизации
    const authUrl = `https://id-preview--86de7c90-bfa2-4ea9-b1d2-216984f4b59d.lovable.app/dashboard?auth=${sessionId}`
    return authUrl
    
  } catch (error) {
    console.error('❌ Ошибка создания авторизационной сессии:', error)
    throw error
  }
}

// Отправка сообщения с кнопками в Telegram
async function sendTelegramMessageWithKeyboard(chatId: string, message: string, keyboard: any, parseMode: string = 'Markdown') {
  try {
    if (!BOT_TOKEN) {
      throw new Error('BOT_TOKEN не установлен')
    }

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
        reply_markup: keyboard
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Ошибка отправки сообщения с кнопками: ${error}`)
    }

    console.log('✅ Сообщение с кнопками отправлено в Telegram')

  } catch (error) {
    console.error('❌ Ошибка отправки сообщения с кнопками в Telegram:', error)
  }
}

// Запрос контактной информации от пользователя
async function requestContactInfo(chatId: string, message: string) {
  try {
    if (!BOT_TOKEN) {
      throw new Error('BOT_TOKEN не установлен')
    }

    const keyboard = {
      keyboard: [[
        {
          text: "📱 Поделиться номером телефона",
          request_contact: true
        }
      ]],
      one_time_keyboard: true,
      resize_keyboard: true
    }

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Ошибка запроса контакта: ${error}`)
    }

    console.log('✅ Запрос контакта отправлен в Telegram')

  } catch (error) {
    console.error('❌ Ошибка запроса контакта в Telegram:', error)
  }
}

// Обновление пользователя в WebBase (обновлено для 20 столбцов)
async function updateUserInWebBase(chatId: string, phone: string, name: string) {
  try {
    console.log('🔄 Обновляем пользователя в WebBase:', { chatId, phone, name })
    
    const accessToken = await getGoogleAccessToken()
    
    // Получаем данные из листа WebBase (A-T, 20 столбцов)
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/WebBase!A:T`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Не удалось получить данные WebBase')
    }

    const data = await response.json()
    const rows = data.values || []
    
    // Ищем пользователя по Chat ID (колонка A)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const rowChatId = row[0] // Колонка A - Chat ID
      
      if (rowChatId === chatId) {
        console.log('👤 Найден пользователь для обновления, строка:', i + 1)
        
        // Обновляем только телефон и имя, остальные данные сохраняем
        const updateValues = [[
          chatId, // A - Chat ID (не изменяется)
          name || row[1] || '', // B - Имя клиента
          phone || row[2] || '', // C - Телефон (главное обновление)
          row[3] || '', // D - Номер Авто
          row[4] || '', // E - Заказ - QR
          row[5] || '', // F - Цена за месяц
          row[6] || '', // G - Кол-во шин
          row[7] || '', // H - Наличие дисков
          row[8] || '', // I - Начало
          row[9] || '', // J - Срок
          row[10] || '', // K - Напомнить
          row[11] || '', // L - Окончание
          row[12] || '', // M - Склад хранения
          row[13] || '', // N - Ячейка
          row[14] || '', // O - Общая сумма
          row[15] || '', // P - Долг
          row[16] || '', // Q - Договор
          row[17] || '', // R - Адрес клиента
          row[18] || '', // S - Статус сделки
          row[19] || '' // T - Источник трафика
        ]]

        const updateResponse = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/WebBase!A${i + 1}:T${i + 1}?valueInputOption=RAW`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ values: updateValues })
          }
        )

        if (!updateResponse.ok) {
          throw new Error('Ошибка обновления пользователя в WebBase')
        }

        console.log('✅ Пользователь обновлен в WebBase')
        return true
      }
    }
    
    return false
    
  } catch (error) {
    console.error('❌ Ошибка обновления пользователя в WebBase:', error)
    throw error
  }
}

serve(async (req) => {
  console.log('\n🤖 === TELEGRAM BOT WEBHOOK ===')
  console.log('⏰ Время:', new Date().toISOString())
  console.log('🔗 URL запроса:', req.url)
  console.log('📡 Метод запроса:', req.method)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    console.log('📥 Получены данные от Telegram:', body)
    
    // Проверяем, что тело запроса не пустое
    if (!body || body.trim() === '') {
      console.log('⚠️ Пустое тело запроса')
      return new Response('OK', { headers: corsHeaders })
    }
    
    let parsedBody
    try {
      parsedBody = JSON.parse(body)
    } catch (parseError) {
      console.error('❌ Ошибка парсинга JSON:', parseError)
      console.error('📄 Содержимое тела:', body)
      return new Response('OK', { headers: corsHeaders }) // Возвращаем OK для Telegram
    }

    const message = parsedBody?.message
    const contact = message?.contact
    
    if (!message) {
      console.log('📄 Нет сообщения в запросе')
      return new Response('OK', { headers: corsHeaders })
    }

    const chatId = message.chat?.id?.toString()
    const text = message.text
    const userName = message.from?.first_name || message.from?.username || 'Unknown'
    
    console.log('💬 Сообщение от пользователя:', { chatId, text, userName, contact: !!contact })

    // Обработка поделенного контакта
    if (contact) {
      console.log('📱 Получен контакт от пользователя:', contact)
      const phoneNumber = contact.phone_number
      const contactName = contact.first_name || contact.last_name || userName
      
      try {
        // Обновляем пользователя в WebBase
        await updateUserInWebBase(chatId, phoneNumber, contactName)
        
        // Создаем авторизационную сессию
        const authUrl = await createAuthSession(chatId, contactName)
        
        // Отправляем подтверждение с прямой ссылкой в личный кабинет
        const confirmMessage = `✅ Спасибо! Ваши данные обновлены:

👤 Имя: ${contactName}
📱 Телефон: ${phoneNumber}
🆔 Код доступа: \`${chatId}\`

🏠 Теперь вы можете войти в личный кабинет!`

        const keyboard = {
          inline_keyboard: [
            [
              {
                text: "🏠 Личный Кабинет",
                url: authUrl
              }
            ],
            [
              {
                text: "🌐 Сайт",
                url: "https://id-preview--86de7c90-bfa2-4ea9-b1d2-216984f4b59d.lovable.app/"
              },
              {
                text: "📄 Договор",
                url: "https://id-preview--86de7c90-bfa2-4ea9-b1d2-216984f4b59d.lovable.app/contract"
              }
            ]
          ]
        }

        await sendTelegramMessageWithKeyboard(chatId, confirmMessage, keyboard)
        
        // Устанавливаем Web App кнопку для постоянного доступа к ЛК
        await setMenuButton(chatId)
        
      } catch (error) {
        console.error('❌ Ошибка обновления контакта:', error)
        await sendTelegramMessage(chatId, '❌ Произошла ошибка при обновлении данных. Попробуйте еще раз.')
      }
      
      return new Response('OK', { headers: corsHeaders })
    }
    
    console.log('💬 Текстовое сообщение от пользователя:', { chatId, text, userName })

    // Обработка команды /start с sessionId
    if (text?.startsWith('/start ')) {
      const sessionId = text.replace('/start ', '').trim()
      console.log('🔑 Получен sessionId из команды /start:', sessionId)
      console.log('👤 Данные пользователя:', { chatId, userName, userId: message.from?.id })
      
      if (sessionId && sessionId !== '/start' && sessionId.length > 5) {
        console.log('✅ Валидация sessionId успешна, подтверждаем авторизацию для:', sessionId)
        
        try {
          console.log('💾 Начинаем сохранение авторизации в Google Sheets...')
          
          // Проверяем пользователя в WebBase
          const existingUser = await checkUserInWebBase(chatId, userName)
          
          if (existingUser) {
            console.log('👤 Найден существующий пользователь в WebBase')
            
            // Сохраняем авторизацию
            await saveAuthSession(sessionId, chatId, userName)
            
            // Создаем авторизационную сессию
            const authUrl = await createAuthSession(chatId, userName)
            
            // Отправляем информацию о существующем пользователе
            let userInfoMessage = `✅ Добро пожаловать, ${existingUser.name}!

👤 **Ваши данные:**
🆔 Код доступа: \`${existingUser.chatId}\``

            // Добавляем только непустые поля
            if (existingUser.phone) userInfoMessage += `\n📱 Телефон: ${existingUser.phone}`
            if (existingUser.carNumber) userInfoMessage += `\n🚗 Номер авто: ${existingUser.carNumber}`
            if (existingUser.order) userInfoMessage += `\n📦 Заказ: ${existingUser.order}`
            if (existingUser.monthlyPrice) userInfoMessage += `\n💰 Цена за месяц: ${existingUser.monthlyPrice}`
            if (existingUser.tireCount) userInfoMessage += `\n🔢 Кол-во шин: ${existingUser.tireCount}`
            if (existingUser.hasRims) userInfoMessage += `\n💿 Диски: ${existingUser.hasRims}`
            if (existingUser.startDate) userInfoMessage += `\n📅 Начало: ${existingUser.startDate}`
            if (existingUser.term) userInfoMessage += `\n⏱️ Срок: ${existingUser.term}`
            if (existingUser.endDate) userInfoMessage += `\n📅 Окончание: ${existingUser.endDate}`
            if (existingUser.storage) userInfoMessage += `\n🏭 Склад: ${existingUser.storage}`
            if (existingUser.cell) userInfoMessage += `\n📍 Ячейка: ${existingUser.cell}`
            if (existingUser.totalSum) userInfoMessage += `\n💵 Общая сумма: ${existingUser.totalSum}`
            if (existingUser.debt) userInfoMessage += `\n⚠️ Долг: ${existingUser.debt}`
            if (existingUser.contract) userInfoMessage += `\n📋 Договор: ${existingUser.contract}`

            userInfoMessage += `\n\n🌐 Вход выполнен автоматически!`

            const keyboard = {
              inline_keyboard: [
                [
                  {
                    text: "🏠 Личный Кабинет",
                    url: authUrl
                  }
                ],
                [
                  {
                    text: "🌐 Сайт",
                    url: "https://id-preview--86de7c90-bfa2-4ea9-b1d2-216984f4b59d.lovable.app/"
                  },
                  {
                    text: "📄 Договор",
                    url: "https://id-preview--86de7c90-bfa2-4ea9-b1d2-216984f4b59d.lovable.app/contract"
                  }
                ]
              ]
            }

            await sendTelegramMessageWithKeyboard(chatId, userInfoMessage, keyboard)
            
            // Устанавливаем Web App кнопку для постоянного доступа к ЛК
            await setMenuButton(chatId)
            
          } else {
            console.log('🆕 Новый пользователь - добавляем в WebBase')
            
            // Добавляем нового пользователя в WebBase
            await addUserToWebBase(chatId, userName)
            
            // Сохраняем авторизацию
            await saveAuthSession(sessionId, chatId, userName)
            
            // Отправляем приветствие новому пользователю
            // Создаем авторизационную сессию для нового пользователя
            const authUrl = await createAuthSession(chatId, userName)
            
            const newUserMessage = `🎉 <span style="color: #007bff;">Добро пожаловать в ОтельШин!</span>

✅ <span style="color: #007bff;">Регистрация прошла успешно!</span>
👤 Имя: <span style="color: #007bff;">${userName}</span>
🆔 Код доступа: <span style="color: #007bff;">\`${chatId}\`</span>

🌐 <span style="color: #007bff;">Вы автоматически вошли в личный кабинет!</span>`

            const keyboard = {
              inline_keyboard: [
                [
                  {
                    text: "🏠 Личный Кабинет",
                    url: authUrl
                  }
                ],
                [
                  {
                    text: "🌐 Сайт",
                    url: "https://id-preview--86de7c90-bfa2-4ea9-b1d2-216984f4b59d.lovable.app/"
                  },
                  {
                    text: "📄 Договор",
                    url: "https://id-preview--86de7c90-bfa2-4ea9-b1d2-216984f4b59d.lovable.app/contract"
                  }
                ]
              ]
            }

            await sendTelegramMessageWithKeyboard(chatId, newUserMessage, keyboard, 'HTML')
            
            // Устанавливаем Web App кнопку для постоянного доступа к ЛК
            await setMenuButton(chatId)
            
            // Отправляем красиво отформатированную инструкцию по установке
            const installMessage = `📱 *Установите приложение на главный экран!*

╔═════════════════════════════════╗
║ 🔄 *Удобный доступ к личному кабинету* ║
╚═════════════════════════════════╝

🌟 Добавьте ОтельШин на главный экран как обычное приложение:

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📱 **iPhone/iPad:**                ┃
┃ 1️⃣ Откройте сайт в Safari           ┃
┃ 2️⃣ Нажмите кнопку "Поделиться" ⬆️    ┃
┃ 3️⃣ Выберите "На экран Домой" 🏠     ┃
┃ 4️⃣ Нажмите "Добавить" ✅            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🤖 **Android:**                   ┃
┃ 1️⃣ Откройте сайт в Chrome           ┃
┃ 2️⃣ Нажмите меню (⋮) в правом углу   ┃
┃ 3️⃣ Выберите "Добавить на экран" 🏠  ┃
┃ 4️⃣ Нажмите "Добавить" ✅            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🎉 **Готово!** ОтельШин будет открываться как обычное приложение с иконкой на рабочем столе!

💡 *Теперь доступ к личному кабинету - в один клик!*`

            setTimeout(() => {
              sendTelegramMessage(chatId, installMessage)
            }, 2000)
          }
          
          console.log('🎉 АВТОРИЗАЦИЯ ПОЛНОСТЬЮ ЗАВЕРШЕНА для sessionId:', sessionId)
          
        } catch (authError) {
          console.error('❌ КРИТИЧЕСКАЯ ОШИБКА при сохранении авторизации:', {
            error: authError.message,
            stack: authError.stack,
            sessionId,
            chatId,
            userName
          })
          await sendTelegramMessage(chatId, '❌ Произошла ошибка авторизации. Попробуйте еще раз.')
        }
        
        return new Response('OK', { headers: corsHeaders })
      } else {
        console.log('⚠️ Некорректный sessionId:', sessionId)
        await sendTelegramMessage(chatId, '⚠️ Некорректная ссылка авторизации. Попробуйте еще раз с сайта.')
      }
    }

    // Обычная команда /start без параметров
    if (text === '/start') {
      console.log('📋 Обычная команда /start без параметров')
      
      // Проверяем пользователя в WebBase
      const existingUser = await checkUserInWebBase(chatId, userName)
      
      if (existingUser) {
        // Проверяем, есть ли недостающие данные
        const missingPhone = !existingUser.phone || existingUser.phone.trim() === ''
        const missingName = !existingUser.name || existingUser.name.trim() === '' || existingUser.name === 'Unknown'
        
        if (missingPhone) {
          // Запрашиваем номер телефона
          const requestMessage = `👋 Добро пожаловать, ${existingUser.name || userName}!

📱 Для завершения регистрации поделитесь номером телефона:`

          await requestContactInfo(chatId, requestMessage)
        } else {
          // Есть номер телефона, создаем авторизационную сессию и показываем кнопки
          const authUrl = await createAuthSession(chatId, existingUser.name)
          
          let userInfoMessage = `👋 Добро пожаловать, ${existingUser.name}!

👤 **Ваши данные:**
🆔 Код доступа: \`${existingUser.chatId}\``

          // Добавляем только непустые поля
          if (existingUser.phone) userInfoMessage += `\n📱 Телефон: ${existingUser.phone}`
          if (existingUser.carNumber) userInfoMessage += `\n🚗 Номер авто: ${existingUser.carNumber}`
          if (existingUser.order) userInfoMessage += `\n📦 Заказ: ${existingUser.order}`
          if (existingUser.monthlyPrice) userInfoMessage += `\n💰 Цена за месяц: ${existingUser.monthlyPrice}`
          if (existingUser.tireCount) userInfoMessage += `\n🔢 Кол-во шин: ${existingUser.tireCount}`
          if (existingUser.hasRims) userInfoMessage += `\n💿 Диски: ${existingUser.hasRims}`
          if (existingUser.startDate) userInfoMessage += `\n📅 Начало: ${existingUser.startDate}`
          if (existingUser.term) userInfoMessage += `\n⏱️ Срок: ${existingUser.term}`
          if (existingUser.endDate) userInfoMessage += `\n📅 Окончание: ${existingUser.endDate}`
          if (existingUser.storage) userInfoMessage += `\n🏭 Склад: ${existingUser.storage}`
          if (existingUser.cell) userInfoMessage += `\n📍 Ячейка: ${existingUser.cell}`
          if (existingUser.totalSum) userInfoMessage += `\n💵 Общая сумма: ${existingUser.totalSum}`
          if (existingUser.debt) userInfoMessage += `\n⚠️ Долг: ${existingUser.debt}`
          if (existingUser.contract) userInfoMessage += `\n📋 Договор: ${existingUser.contract}`

          const keyboard = {
            inline_keyboard: [
              [
                {
                  text: "🏠 Личный Кабинет",
                  url: authUrl
                }
              ],
              [
                {
                  text: "🌐 Сайт",
                  url: "https://id-preview--86de7c90-bfa2-4ea9-b1d2-216984f4b59d.lovable.app/"
                },
                {
                  text: "📄 Договор",
                  url: "https://id-preview--86de7c90-bfa2-4ea9-b1d2-216984f4b59d.lovable.app/contract"
                }
              ]
            ]
          }

          await sendTelegramMessageWithKeyboard(chatId, userInfoMessage, keyboard)
          
          // Устанавливаем Web App кнопку для постоянного доступа к ЛК
          await setMenuButton(chatId)
        }
      } else {
        // Новый пользователь, не найден в WebBase
        console.log('🆕 Новый пользователь, добавляем в WebBase и запрашиваем контакт')
        
        // Добавляем пользователя в WebBase
        await addUserToWebBase(chatId, userName)
        
        const welcomeMessage = `🎉 Добро пожаловать в ОтельШин!

✅ Регистрация прошла успешно!
👤 Имя: ${userName}
🆔 Код доступа: \`${chatId}\`

📱 Для завершения регистрации поделитесь номером телефона:`

        // Отправляем приветствие и сразу запрашиваем номер телефона
        await sendTelegramMessage(chatId, welcomeMessage)
        
        // Запрашиваем номер телефона
        setTimeout(async () => {
          await requestContactInfo(chatId, `📱 Поделитесь номером телефона для завершения регистрации:`)
        }, 1000)
      }
      
      return new Response('OK', { headers: corsHeaders })
    }

    // Обработка неизвестных команд и сообщений
    console.log('📝 Неизвестная команда или сообщение:', text)
    
    try {
      const helpMessage = `🤖 Извините, я не понимаю эту команду.

📞 Для получения помощи обратитесь к нашему менеджеру: @EnrikeTomas

📋 Доступные команды:
• /start - Главное меню
• Поделиться контактом - Обновить данные`

      await sendTelegramMessage(chatId, helpMessage)
    } catch (error) {
      console.error('❌ Ошибка отправки справочного сообщения:', error)
    }
    
    return new Response('OK', { headers: corsHeaders })

  } catch (error) {
    console.error('💥 КРИТИЧЕСКАЯ ОШИБКА в Telegram Bot:')
    console.error('❌ Ошибка:', error)
    console.error('📍 Stack trace:', error.stack)
    
    return new Response('Internal Server Error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})