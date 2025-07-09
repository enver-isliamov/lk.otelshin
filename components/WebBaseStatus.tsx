
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { WebBaseRecord } from '@/types/auth';

export const WebBaseStatus = () => {
  const [webbaseCount, setWebbaseCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWebBaseCount();
  }, []);

  const fetchWebBaseCount = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError, count } = await supabase
        .from('webbase')
        .select('*', { count: 'exact', head: true });

      if (fetchError) {
        console.error('❌ Ошибка получения количества записей WebBase:', fetchError);
        setError(fetchError.message);
      } else {
        setWebbaseCount(count || 0);
      }
    } catch (error) {
      console.error('💥 Критическая ошибка:', error);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Статус WebBase
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Загрузка данных...</span>
            </div>
          ) : error ? (
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">Ошибка: {error}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-medium">База клиентов готова</h4>
                  <p className="text-sm text-gray-600">
                    Доступно для авторизации клиентов
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                <Users className="w-4 h-4 mr-1" />
                {webbaseCount} клиентов
              </Badge>
            </div>
          )}
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium mb-2 text-sm">Информация о системе авторизации:</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div>• <strong>Логин:</strong> Номер телефона из столбца "Номер телефона"</div>
              <div>• <strong>Пароль:</strong> Chat ID из столбца "Chat ID"</div>
              <div>• <strong>Источник данных:</strong> Google Таблица (лист WebBase)</div>
              <div>• <strong>Обновление:</strong> Ручная синхронизация</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
