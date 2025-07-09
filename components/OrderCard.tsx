

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Package, 
  Car,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  MessageCircle,
  QrCode,
  Building,
  FileText,
  MapPinIcon
} from 'lucide-react';
import { TireOrder } from '@/types/auth';

interface OrderCardProps {
  order: TireOrder;
  isAdmin: boolean;
  onEditOrder?: (order: TireOrder) => void;
}

export const OrderCard = ({ order, isAdmin, onEditOrder }: OrderCardProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'new': { variant: 'default', icon: Clock, label: 'Новый' },
      'processing': { variant: 'secondary', icon: Clock, label: 'В обработке' },
      'completed': { variant: 'default', icon: CheckCircle, label: 'Завершен' },
      'cancelled': { variant: 'destructive', icon: AlertCircle, label: 'Отменен' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['new'];
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getStorageBadge = (location: string) => {
    if (!location) return null;
    
    const colorMap: { [key: string]: string } = {
      'склад а': 'bg-blue-100 text-blue-800',
      'склад б': 'bg-green-100 text-green-800',
      'склад в': 'bg-purple-100 text-purple-800',
      'склад г': 'bg-orange-100 text-orange-800'
    };

    const colorClass = colorMap[location.toLowerCase()] || 'bg-gray-100 text-gray-800';

    return (
      <Badge variant="outline" className={colorClass}>
        <MapPin className="w-3 h-3 mr-1" />
        {location}
      </Badge>
    );
  };

  const handleTelegramContact = () => {
    window.open('https://t.me/EnrikeTomas', '_blank');
  };

  const qrOrderValue = order.order_qr || order.qr_order;

  return (
    <Card className="w-full transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Заказ #{order.id?.slice(-6) || 'N/A'}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(order.deal_status || 'new')}
            {getStorageBadge(order.storage_location || '')}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* QR-заказ */}
        {qrOrderValue && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center text-sm font-medium text-purple-700 mb-2">
              <QrCode className="w-4 h-4 mr-2" />
              QR-заказ
            </div>
            <div className="text-sm text-gray-700 bg-white rounded p-2 border font-mono">
              {qrOrderValue}
            </div>
          </div>
        )}

        {/* Автомобиль и ячейка */}
        <div className="flex flex-wrap gap-3">
          {order.car_number && (
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              <Car className="w-4 h-4 mr-2 text-purple-600" />
              <span className="font-medium">{order.car_number}</span>
            </div>
          )}
          {order.storage_cell && (
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              <MapPinIcon className="w-4 h-4 mr-2 text-orange-600" />
              <span className="font-medium">Ячейка: {order.storage_cell}</span>
            </div>
          )}
        </div>

        {/* Информация о шинах */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center text-sm font-medium text-gray-700">
            <Package className="w-4 h-4 mr-2" />
            Информация о шинах
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {(order.tire_count || order.tire_quantity) && (
              <div>
                <span className="text-gray-500">Количество:</span>
                <span className="ml-1 font-medium">{order.tire_count || order.tire_quantity} шт.</span>
              </div>
            )}
            
            {order.has_disks !== undefined && (
              <div>
                <span className="text-gray-500">Диски:</span>
                <span className="ml-1 font-medium">
                  {order.has_disks ? 'Есть' : 'Нет'}
                </span>
              </div>
            )}

            {order.tire_size && (
              <div>
                <span className="text-gray-500">Размер:</span>
                <span className="ml-1 font-medium">{order.tire_size}</span>
              </div>
            )}

            {order.tire_brand && (
              <div>
                <span className="text-gray-500">Бренд:</span>
                <span className="ml-1 font-medium">{order.tire_brand}</span>
              </div>
            )}
          </div>
        </div>

        {/* Финансовая информация */}
        {(order.monthly_price || order.total_amount || order.debt || order.debt_amount) && (
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <div className="text-sm font-medium text-blue-700">Финансы</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {order.monthly_price && (
                <div>
                  <span className="text-gray-500">За месяц:</span>
                  <span className="ml-1 font-medium text-blue-600">
                    {order.monthly_price.toLocaleString()} ₽
                  </span>
                </div>
              )}
              
              {order.total_amount && (
                <div>
                  <span className="text-gray-500">Общая сумма:</span>
                  <span className="ml-1 font-medium text-green-600">
                    {order.total_amount.toLocaleString()} ₽
                  </span>
                </div>
              )}
              
              {(order.debt || order.debt_amount) && (order.debt || order.debt_amount) > 0 && (
                <div>
                  <span className="text-gray-500">Долг:</span>
                  <span className="ml-1 font-medium text-red-600">
                    {(order.debt || order.debt_amount).toLocaleString()} ₽
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Адрес клиента */}
        {order.client_address && (
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center text-sm font-medium text-green-700 mb-2">
              <Building className="w-4 h-4 mr-2" />
              Адрес клиента
            </div>
            <div className="text-sm text-gray-700">
              {order.client_address}
            </div>
          </div>
        )}

        {/* Договор */}
        {(order.contract || order.contract_number) && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center text-sm font-medium text-yellow-700 mb-2">
              <FileText className="w-4 h-4 mr-2" />
              Договор
            </div>
            <div className="text-sm text-gray-700 font-mono bg-white rounded p-2 border">
              {order.contract || order.contract_number}
            </div>
          </div>
        )}

        {/* Период хранения */}
        {order.storage_period && (
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="text-sm font-medium text-indigo-700 mb-2">Срок хранения</div>
            <div className="text-sm text-gray-700">
              {typeof order.storage_period === 'number' 
                ? `${order.storage_period} ${order.storage_period === 1 ? 'месяц' : order.storage_period < 5 ? 'месяца' : 'месяцев'}`
                : order.storage_period
              }
            </div>
          </div>
        )}

        {/* Даты */}
        {(order.start_date || order.end_date || order.reminder_date) && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Важные даты
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {order.start_date && (
                <div className="bg-white rounded-lg p-3 border">
                  <span className="text-gray-500 block">Начало:</span>
                  <span className="font-medium">{order.start_date}</span>
                </div>
              )}
              
              {order.end_date && (
                <div className="bg-white rounded-lg p-3 border">
                  <span className="text-gray-500 block">Окончание:</span>
                  <span className="font-medium">{order.end_date}</span>
                </div>
              )}
              
              {order.reminder_date && (
                <div className="bg-white rounded-lg p-3 border">
                  <span className="text-gray-500 block">Напоминание:</span>
                  <span className="font-medium">{order.reminder_date}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Заметки */}
        {order.notes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Заметки</div>
            <div className="text-sm text-gray-600">
              {order.notes}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t bg-gray-50/50">
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-3">
          {/* Кнопка связи с менеджером */}
          <Button 
            onClick={handleTelegramContact}
            variant="outline" 
            size="sm"
            className="w-full sm:w-auto flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Связаться с менеджером
          </Button>
          
          {/* Кнопка редактирования для администратора */}
          {isAdmin && onEditOrder && (
            <Button 
              onClick={() => onEditOrder(order)}
              variant="ghost" 
              size="sm"
              className="w-full sm:w-auto flex items-center justify-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
