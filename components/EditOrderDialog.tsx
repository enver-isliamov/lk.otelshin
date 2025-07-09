
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Save, User, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { TireOrder } from '@/types/auth';

interface EditOrderFormData {
  client_name: string;
  phone: string;
  tire_size: string;
  tire_brand: string;
  quantity: number;
  price: number;
  status: string;
  notes?: string;
}

interface EditOrderDialogProps {
  order: TireOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated: () => void;
}

export const EditOrderDialog = ({ order, open, onOpenChange, onOrderUpdated }: EditOrderDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<EditOrderFormData>({
    defaultValues: {
      client_name: '',
      phone: '',
      tire_size: '',
      tire_brand: '',
      quantity: 4,
      price: 0,
      status: 'new',
      notes: ''
    }
  });

  // Заполняем форму данными заказа при открытии
  useEffect(() => {
    if (order && open) {
      form.reset({
        client_name: order.client_name || '',
        phone: order.phone || '',
        tire_size: order.tire_size || '',
        tire_brand: order.tire_brand || '',
        quantity: order.quantity || 4,
        price: order.price || 0,
        status: order.status || 'new',
        notes: order.notes || ''
      });
    }
  }, [order, open, form]);

  const onSubmit = async (data: EditOrderFormData) => {
    try {
      setIsLoading(true);
      console.log('📝 Обновляем заказ в Google Sheets:', order?.id, data);

      // В данной версии редактирование заказов происходит только через Google Sheets
      // Для этого нужно реализовать Edge Function для обновления строк в Google Sheets
      
      toast({
        title: "Функция в разработке",
        description: "Редактирование заказов будет реализовано через Google Sheets в следующей версии",
        variant: "default"
      });

      console.log('✅ Заказ будет обновлен в Google Sheets');

      onOpenChange(false);
      onOrderUpdated();

    } catch (error) {
      console.error('💥 Ошибка:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить заказ",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit className="w-5 h-5 mr-2" />
            Редактировать заказ
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Информация о клиенте */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <User className="w-4 h-4 mr-2" />
                Информация о клиенте
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="client_name"
                  rules={{ required: "Имя клиента обязательно" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя клиента</FormLabel>
                      <FormControl>
                        <Input placeholder="Иван Иванов" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  rules={{ required: "Телефон обязателен" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Телефон</FormLabel>
                      <FormControl>
                        <Input placeholder="+7-999-123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Информация о шинах */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Информация о шинах
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tire_size"
                  rules={{ required: "Размер шин обязателен" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Размер шин</FormLabel>
                      <FormControl>
                        <Input placeholder="195/65 R15" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tire_brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Бренд шин</FormLabel>
                      <FormControl>
                        <Input placeholder="Nokian" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Количество</FormLabel>
                      <FormControl>
                        <Select value={field.value.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 шины</SelectItem>
                            <SelectItem value="4">4 шины</SelectItem>
                            <SelectItem value="6">6 шин</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Цена (₽)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Статус</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Новый</SelectItem>
                            <SelectItem value="processing">В обработке</SelectItem>
                            <SelectItem value="completed">Завершен</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Примечания */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Примечания</FormLabel>
                  <FormControl>
                    <Input placeholder="Дополнительная информация..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
