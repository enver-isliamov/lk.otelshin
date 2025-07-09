
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')

console.log('🔧 Telegram Webhook Setup функция загружена')
console.log('🤖 BOT_TOKEN:', BOT_TOKEN ? 'установлен' : 'отсутствует')

async function setupTelegramWebhook() {
  try {
    if (!BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN не установлен')
    }

    // URL вашего webhook (Edge Function)
    const webhookUrl = `https://tzkehqpiyzddzvnwxhez.supabase.co/functions/v1/telegram-bot`
    
    console.log('🔗 Настройка webhook URL:', webhookUrl)
    
    // Устанавливаем webhook
    const setWebhookResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message']
        })
      }
    )

    const webhookResult = await setWebhookResponse.json()
    console.log('🔗 Результат установки webhook:', webhookResult)

    if (!webhookResult.ok) {
      throw new Error(`Ошибка установки webhook: ${webhookResult.description}`)
    }

    // Проверяем информацию о webhook
    const getWebhookResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    )

    const webhookInfo = await getWebhookResponse.json()
    console.log('ℹ️ Информация о webhook:', webhookInfo)

    return {
      success: true,
      webhook_set: webhookResult.ok,
      webhook_info: webhookInfo.result
    }

  } catch (error) {
    console.error('❌ Ошибка настройки webhook:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

serve(async (req) => {
  console.log('\n🔧 === TELEGRAM WEBHOOK SETUP ===')
  console.log('⏰ Время запроса:', new Date().toISOString())

  // Обработка CORS
  if (req.method === 'OPTIONS') {
    console.log('⚙️ Обработка CORS OPTIONS запроса')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const result = await setupTelegramWebhook()
    
    console.log('📤 Отправляем результат:', result)
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: result.success ? 200 : 500
    })

  } catch (error) {
    console.error('💥 КРИТИЧЕСКАЯ ОШИБКА в telegram-webhook-setup:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
