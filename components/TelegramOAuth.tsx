
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TelegramOAuthProps {
  onSuccess: () => void;
}

export const TelegramOAuth = ({ onSuccess }: TelegramOAuthProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const { toast } = useToast();

  const handleTelegramAuth = () => {
    console.log('🚀 Начинаем авторизацию через Telegram')
    
    // Генерируем уникальный sessionId
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('🔑 Сгенерирован sessionId:', newSessionId);
    
    // Сохраняем sessionId для отслеживания
    setSessionId(newSessionId);
    
    // Формируем ссылку на бота с параметром sessionId
    const botUrl = `https://t.me/ShiniSimfBot?start=${newSessionId}`;
    
    toast({
      title: "Переход к боту",
      description: "Сейчас откроется Telegram бот для авторизации"
    });
    
    // Открываем бота в новой вкладке
    window.open(botUrl, '_blank');
    
    // Запускаем автоматическую проверку авторизации
    startAuthPolling(newSessionId);
  };

  const startAuthPolling = (sessionId: string) => {
    console.log('🔄 Запуск автоматической проверки авторизации для sessionId:', sessionId);
    setIsLoading(true);
    
    let pollCount = 0;
    const maxPolls = 300; // 5 минут проверки
    
    const pollInterval = setInterval(async () => {
      pollCount++;
      
      try {
        console.log(`🔍 Проверка авторизации #${pollCount}/${maxPolls} для sessionId:`, sessionId);
        
        // Используем эндпоинт check-auth с улучшенным логированием
        const checkUrl = `https://tzkehqpiyzddzvnwxhez.supabase.co/functions/v1/check-auth?session=${sessionId}`;
        console.log('🌐 Отправляем запрос на:', checkUrl);
        
        const response = await fetch(checkUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        console.log('📡 Статус ответа:', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Ошибка запроса к check-auth:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          return;
        }

        const data = await response.json();
        console.log('📥 Полный ответ от проверки авторизации:', JSON.stringify(data, null, 2));

        if (data.authorized && data.user) {
          console.log('✅ АВТОРИЗАЦИЯ УСПЕШНА! Данные пользователя:', JSON.stringify(data.user, null, 2));
          
          // Сохраняем данные пользователя с дополнительными проверками
          const profileData = {
            id: data.user.chat_id || sessionId,
            name: data.user.client_name || data.user.userName || 'Пользователь',
            phone: data.user.phone || '',
            chat_id: data.user.chat_id || '',
            is_admin: data.user.is_admin || false,
            address: data.user.client_address || '',
            car_number: data.user.car_number || ''
          };

          console.log('💾 Сохраняем профиль в localStorage:', JSON.stringify(profileData, null, 2));
          localStorage.setItem('userProfile', JSON.stringify(profileData));
          
          // Проверяем, что данные действительно сохранились
          const savedProfile = localStorage.getItem('userProfile');
          console.log('✔️ Проверка сохранения:', savedProfile ? 'успешно' : 'ошибка');
          
          clearInterval(pollInterval);
          setIsLoading(false);
          
          toast({
            title: "Успешно!",
            description: `Добро пожаловать, ${profileData.name}!`
          });
          
          console.log('🚀 Переход в личный кабинет...');
          // Автоматический вход в систему
          onSuccess();
        } else if (pollCount >= maxPolls) {
          // Время истекло
          console.log('⏰ Время ожидания авторизации истекло');
          clearInterval(pollInterval);
          setIsLoading(false);
          
          toast({
            title: "Время истекло",
            description: "Попробуйте авторизацию снова",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('💥 Критическая ошибка проверки авторизации:', {
          error: error.message,
          stack: error.stack,
          pollCount,
          maxPolls,
          sessionId
        });
        
        if (pollCount >= maxPolls) {
          console.log('⏰ Превышено максимальное количество попыток проверки');
          clearInterval(pollInterval);
          setIsLoading(false);
          
          toast({
            title: "Ошибка авторизации",
            description: "Время ожидания истекло. Попробуйте снова.",
            variant: "destructive"
          });
        }
      }
    }, 1000); // Проверяем каждую секунду
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleTelegramAuth}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-[#0088cc] to-[#229ED9] hover:from-[#007bb8] hover:to-[#1a8cc4] text-white text-lg py-6 shadow-lg"
      >
        {isLoading ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Ожидание авторизации...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.568 8.16c-.180 1.896-.96 6.504-1.356 8.628-.168.9-.504 1.2-.816 1.236-.696.06-1.224-.456-1.896-.9-1.056-.696-1.656-1.128-2.676-1.8-1.188-.78-.42-1.212.264-1.908.18-.18 3.252-2.976 3.312-3.228a.24.24 0 0 0-.06-.216c-.072-.06-.168-.036-.252-.024-.108.024-1.788 1.14-5.064 3.348-.48.336-.912.504-1.296.492-.432-.012-1.248-.24-1.86-.444-.756-.252-1.344-.384-1.296-.804.024-.216.324-.432.888-.66 3.504-1.524 5.832-2.532 6.996-3.012 3.336-1.392 4.02-1.632 4.476-1.632.096 0 .324.024.468.144.12.096.156.228.168.324-.012.048-.012.132-.012.204z"/>
            </svg>
            Войти через Telegram
          </>
        )}
      </Button>
      
      {isLoading && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Подтвердите авторизацию в Telegram боте
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Автоматическая проверка каждые 2 секунды...
          </p>
        </div>
      )}
    </div>
  );
};
