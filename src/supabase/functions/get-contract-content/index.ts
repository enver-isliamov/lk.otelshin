import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_SHEETS_CREDENTIALS = Deno.env.get('GOOGLE_SHEETS_CREDENTIALS') ?? ''
const GOOGLE_SHEETS_ID = Deno.env.get('GOOGLE_SHEETS_ID') ?? ''

// Функция для получения Google Access Token
async function getGoogleAccessToken() {
  try {
    if (!GOOGLE_SHEETS_CREDENTIALS) {
      throw new Error('GOOGLE_SHEETS_CREDENTIALS не установлен')
    }

    const credentials = JSON.parse(GOOGLE_SHEETS_CREDENTIALS)
    
    const header = { alg: 'RS256', typ: 'JWT' }
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
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
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

    return tokenData.access_token
  } catch (error) {
    console.error('❌ Ошибка получения access token:', error)
    throw error
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const accessToken = await getGoogleAccessToken()
    
    // Проверяем существование листа content
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/content!A:B`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      // Лист не существует, создаем с дефолтным контентом
      await createContentSheet(accessToken)
      
      return new Response(
        JSON.stringify({
          success: true,
          content: `# ДОГОВОР НА УСЛУГИ ХРАНЕНИЯ ШИН

## 1. ОБЩИЕ ПОЛОЖЕНИЯ

Настоящий договор заключается между Исполнителем и Заказчиком на предоставление услуг хранения автомобильных шин.

## 2. ПРЕДМЕТ ДОГОВОРА

2.1. Исполнитель обязуется предоставить Заказчику услуги по хранению автомобильных шин в специально оборудованном помещении.

2.2. Заказчик обязуется оплатить услуги согласно установленным тарифам.`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    const rows = data.values || []
    
    // Ищем контент договора
    let contractContent = ''
    for (const row of rows) {
      if (row[0] === 'contract') {
        contractContent = row[1] || ''
        break
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        content: contractContent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Ошибка получения контента:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Ошибка загрузки контента'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function createContentSheet(accessToken: string) {
  try {
    // Создаем лист content
    await fetch(
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
                title: 'content'
              }
            }
          }]
        })
      }
    )

    // Добавляем дефолтный контент
    const defaultContent = `# ДОГОВОР НА УСЛУГИ ХРАНЕНИЯ ШИН

## 1. ОБЩИЕ ПОЛОЖЕНИЯ

Настоящий договор заключается между Исполнителем и Заказчиком на предоставление услуг хранения автомобильных шин.

## 2. ПРЕДМЕТ ДОГОВОРА

2.1. Исполнитель обязуется предоставить Заказчику услуги по хранению автомобильных шин в специально оборудованном помещении.

2.2. Заказчик обязуется оплатить услуги согласно установленным тарифам.`

    const values = [['contract', defaultContent]]

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/content!A:B:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      }
    )

    console.log('✅ Лист content создан с дефолтным контентом')
  } catch (error) {
    console.error('❌ Ошибка создания листа content:', error)
  }
}