
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, RefreshCw, CheckCircle, AlertCircle, ExternalLink, Users, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SyncResult {
  success: boolean;
  message: string;
  imported_records?: number;
  total_rows?: number;
  error?: string;
}

export const WebBaseSyncCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const { toast } = useToast();

  const GOOGLE_SHEETS_ID = '1IBBn38ZD-TOgzO9VjYAyKz8mchg_RwWyD6kZ0Lu729A';
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}/edit#gid=0`;

  const handleWebBaseSync = async () => {
    try {
      setIsLoading(true);
      setSyncResult(null);
      
      console.log('🚀 Запуск синхронизации WebBase с Google Sheets...');
      
      const { data, error } = await supabase.functions.invoke('google-sheets-webbase-sync', {
        body: { trigger: 'manual' }
      });
      
      if (error) {
        console.error('❌ Ошибка вызова функции:', error);
        throw error;
      }

      console.log('✅ Результат синхронизации WebBase:', data);
      
      setSyncResult(data);
      setLastSync(new Date());
      
      if (data.success) {
        toast({
          title: "Синхронизация WebBase успешна",
          description: data.message,
        });
      } else {
        toast({
          title: "Ошибка синхронизации WebBase",
          description: data.error || 'Неизвестная ошибка',
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('💥 Ошибка синхронизации WebBase:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      setSyncResult({
        success: false,
        message: errorMessage,
        error: errorMessage
      });
      
      toast({
        title: "Ошибка синхронизации WebBase",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Синхронизация WebBase (Клиенты)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Импорт данных клиентов из Google Sheets (лист "WebBase") для авторизации в системе
              </p>
              <div className="mt-2 text-xs text-gray-500">
                <div>• Логин: Номер телефона</div>
                <div>• Пароль: Chat ID</div>
              </div>
              {lastSync && (
                <p className="text-xs text-gray-500 mt-1">
                  Последняя синхронизация: {lastSync.toLocaleString('ru-RU')}
                </p>
              )}
            </div>
            
            <Button 
              onClick={handleWebBaseSync}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Синхронизация...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Синхронизировать WebBase
                </>
              )}
            </Button>
          </div>
          
          {syncResult && (
            <div className={`p-3 rounded-lg border ${
              syncResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center">
                {syncResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                )}
                <span className={`text-sm font-medium ${
                  syncResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {syncResult.success ? 'Успешно!' : 'Ошибка!'}
                </span>
              </div>
              <p className={`text-sm mt-1 ${
                syncResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {syncResult.message || syncResult.error}
              </p>
              {syncResult.success && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {syncResult.imported_records !== undefined && (
                    <Badge variant="outline" className="text-green-600">
                      Импортировано: {syncResult.imported_records}
                    </Badge>
                  )}
                  {syncResult.total_rows !== undefined && (
                    <Badge variant="outline" className="text-blue-600">
                      Всего строк: {syncResult.total_rows}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">ID: {GOOGLE_SHEETS_ID.substring(0, 8)}...</Badge>
              <span>Лист: WebBase</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(SHEET_URL, '_blank')}
              className="h-6 px-2 text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Открыть таблицу
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
