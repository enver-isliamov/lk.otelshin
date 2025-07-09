
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, User, Phone, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface CreateOrderFormData {
  client_name: string;
  phone: string;
  tire_size: string;
  tire_brand: string;
  quantity: number;
  price: number;
  status: string;
  notes?: string;
}

interface CreateOrderDialogProps {
  onOrderCreated: () => void;
}

export const CreateOrderDialog = ({ onOrderCreated }: CreateOrderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<CreateOrderFormData>({
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

  const onSubmit = async (data: CreateOrderFormData) => {
    try {
      setIsLoading(true);
      console.log('📝 Создаем новый заказ в Google Sheets:', data);

      // В данной версии создание заказов происходит только через Google Sheets
      // Для этого нужно реализовать Edge Function для добавления строк в Google Sheets
      
      toast({
        title: "Функция в разработке",
        description: "Создание заказов будет реализовано через Google Sheets в следующей версии",
        variant: "default"
      });

      console.log('✅ Заказ будет создан в Google Sheets');

      form.reset();
      setOpen(false);
      onOrderCreated();

    } catch (error) {
      console.error('💥 Ошибка:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать заказ",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Новый заказ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Создать новый заказ
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
                          placeholder="15000" 
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
                  <FormLabel>Примечания (необязательно)</FormLabel>
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
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Создание...' : 'Создать заказ'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
