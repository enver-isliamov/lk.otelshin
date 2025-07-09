import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const TelegramWebhookSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const setupWebhook = async () => {
    console.log('🔧 Начинаем настройку Telegram webhook...');
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        'https://tzkehqpiyzddzvnwxhez.supabase.co/functions/v1/telegram-webhook-setup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('📡 Статус ответа:', response.status, response.statusText);

      const data = await response.json();
      console.log('📥 Результат настройки webhook:', JSON.stringify(data, null, 2));
      
      setResult(data);

      if (data.success) {
        toast({
          title: "Успешно!",
          description: "Telegram webhook настроен успешно"
        });
      } else {
        toast({
          title: "Ошибка",
          description: `Не удалось настроить webhook: ${data.error}`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('💥 Ошибка настройки webhook:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при настройке webhook",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 border border-border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Настройка Telegram Webhook</h3>
      
      <Button
        onClick={setupWebhook}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Настройка webhook...
          </>
        ) : (
          'Настроить Telegram Webhook'
        )}
      </Button>

      {result && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Результат:</h4>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        <p><strong>Что произойдет после настройки:</strong></p>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>Telegram webhook будет настроен на функцию telegram-bot</li>
          <li>Бот начнет получать сообщения от пользователей</li>
          <li>При команде /start с sessionId авторизация будет сохранена в Google Sheets</li>
          <li>Функция check-auth найдет авторизацию и авторизует пользователя</li>
        </ol>
      </div>
    </div>
  );
};