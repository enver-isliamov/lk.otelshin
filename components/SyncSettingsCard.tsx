
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Webhook, Bell, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SyncSettings {
  id: string;
  webhook_enabled: boolean;
  notifications_enabled: boolean;
  last_sync_at: string | null;
}

export const SyncSettingsCard = () => {
  const [settings, setSettings] = useState<SyncSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Используем any для работы с новой таблицей sync_settings
      const { data, error } = await (supabase as any)
        .from('sync_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Ошибка загрузки настроек:', error);
      } else {
        setSettings(data);
      }
    } catch (error) {
      console.error('Критическая ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);

      // Используем any для работы с новой таблицей sync_settings
      const { error } = await (supabase as any)
        .from('sync_settings')
        .update({
          webhook_enabled: settings.webhook_enabled,
          notifications_enabled: settings.notifications_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Настройки сохранены",
        description: "Настройки синхронизации успешно обновлены"
      });
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Загрузка настроек...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Настройки синхронизации не найдены</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Настройки синхронизации
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Webhook синхронизация */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Webhook className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium">Webhook синхронизация</h4>
                <p className="text-sm text-gray-600">Автоматическая синхронизация при изменении заказов</p>
              </div>
            </div>
            <Switch
              checked={settings.webhook_enabled}
              onCheckedChange={(checked) => 
                setSettings({...settings, webhook_enabled: checked})
              }
            />
          </div>

          {/* Уведомления */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-yellow-600" />
              <div>
                <h4 className="font-medium">Уведомления</h4>
                <p className="text-sm text-gray-600">Получать уведомления о статусе синхронизации</p>
              </div>
            </div>
            <Switch
              checked={settings.notifications_enabled}
              onCheckedChange={(checked) => 
                setSettings({...settings, notifications_enabled: checked})
              }
            />
          </div>

          {/* Информация о последней синхронизации */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Статус синхронизации</h4>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-600">Последняя синхронизация:</span>
              {settings.last_sync_at ? (
                <Badge variant="secondary">
                  {new Date(settings.last_sync_at).toLocaleString('ru-RU')}
                </Badge>
              ) : (
                <Badge variant="outline">Еще не выполнялась</Badge>
              )}
            </div>
          </div>

          {/* Кнопка сохранения */}
          <div className="flex justify-end">
            <Button 
              onClick={saveSettings}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить настройки
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
