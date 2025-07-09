import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, Edit3, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Contract = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Проверяем, является ли пользователь Master
  const isMaster = profile?.chat_id === 'Master';

  useEffect(() => {
    loadContractContent();
  }, []);

  const loadContractContent = async () => {
    try {
      setLoading(true);
      
      // Загружаем контент договора из Google Sheets
      const { data, error } = await supabase.functions.invoke('get-contract-content');
      
      if (error) {
        console.error('Ошибка загрузки контента:', error);
        // Устанавливаем содержимое по умолчанию
        setContent(`
# ДОГОВОР НА УСЛУГИ ХРАНЕНИЯ ШИН

## 1. ОБЩИЕ ПОЛОЖЕНИЯ

Настоящий договор заключается между Исполнителем и Заказчиком на предоставление услуг хранения автомобильных шин.

## 2. ПРЕДМЕТ ДОГОВОРА

2.1. Исполнитель обязуется предоставить Заказчику услуги по хранению автомобильных шин в специально оборудованном помещении.

2.2. Заказчик обязуется оплатить услуги согласно установленным тарифам.

## 3. ПРАВА И ОБЯЗАННОСТИ СТОРОН

### 3.1. Исполнитель обязуется:
- Обеспечить надлежащие условия хранения шин
- Вести учет принятых на хранение шин
- Обеспечить сохранность имущества Заказчика

### 3.2. Заказчик обязуется:
- Своевременно оплачивать услуги хранения
- Предоставить достоверную информацию о хранимых шинах
- Соблюдать правила склада

## 4. СТОИМОСТЬ УСЛУГ

Стоимость услуг определяется в соответствии с действующими тарифами.

## 5. ОТВЕТСТВЕННОСТЬ СТОРОН

Стороны несут ответственность в соответствии с действующим законодательством.

## 6. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ

Договор вступает в силу с момента подписания и действует до полного исполнения обязательств сторонами.
        `);
      } else {
        setContent(data?.content || '');
      }
    } catch (error) {
      console.error('Ошибка загрузки контента договора:', error);
      setContent('Ошибка загрузки содержимого договора');
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    if (!isMaster) return;

    try {
      setSaving(true);
      
      const { error } = await supabase.functions.invoke('save-contract-content', {
        body: { content }
      });
      
      if (error) {
        throw error;
      }
      
      setIsEditing(false);
      toast({
        title: "Успешно сохранено",
        description: "Содержимое договора обновлено"
      });
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить изменения",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    // Простой рендеринг markdown-подобного контента
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mb-4 text-gray-900">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold mb-3 mt-6 text-gray-800">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-medium mb-2 mt-4 text-gray-700">{line.substring(4)}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 mb-1 text-gray-600">{line.substring(2)}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-2 text-gray-600">{line}</p>;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка договора...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Договор на услуги хранения</CardTitle>
            {isMaster && (
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Редактировать
                  </Button>
                ) : (
                  <>
                    <Button onClick={() => setIsEditing(false)} variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Просмотр
                    </Button>
                    <Button onClick={saveContent} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[600px] font-mono text-sm"
                placeholder="Введите содержимое договора (поддерживается Markdown)"
              />
            ) : (
              <div className="prose prose-gray max-w-none">
                {renderContent()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contract;