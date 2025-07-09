
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Package, User, Phone, CreditCard, QrCode } from 'lucide-react';
import { TireOrder } from '@/types/auth';

interface OrdersTableProps {
  orders: TireOrder[];
  isAdmin: boolean;
  onEditOrder: (order: TireOrder) => void;
}

export const OrdersTable = ({ orders, isAdmin, onEditOrder }: OrdersTableProps) => {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      'new': { label: 'Новый', variant: 'default' as const },
      'processing': { label: 'В обработке', variant: 'secondary' as const },
      'completed': { label: 'Завершен', variant: 'outline' as const },
      'active': { label: 'Активе', variant: 'default' as const }
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return '0 ₽';
    return `${amount.toLocaleString('ru-RU')} ₽`;
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">Нет заказов по заданным фильтрам</p>
        <p className="text-sm text-gray-500 mt-2">
          Попробуйте изменить критерии поиска
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заказ - QR отображается отдельно */}
      {orders.length > 0 && orders[0].order_qr && (
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <QrCode className="w-5 h-5 mr-2" />
            Заказ - QR
          </h3>
          <div className="text-sm text-gray-600">
            {orders[0].order_qr}
          </div>
        </div>
      )}

      {/* Основная таблица с заголовками как на скриншоте */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">Имя клиента</TableHead>
              <TableHead className="min-w-[120px]">Телефон</TableHead>
              <TableHead className="min-w-[120px]">Номер Авто</TableHead>
              <TableHead className="min-w-[120px]">Цена за месяц</TableHead>
              <TableHead className="min-w-[100px]">Кол-во шин</TableHead>
              <TableHead className="min-w-[120px]">Наличие дисков</TableHead>
              <TableHead className="min-w-[100px]">Начало</TableHead>
              <TableHead className="min-w-[80px]">Срок</TableHead>
              <TableHead className="min-w-[120px]">Напоминить</TableHead>
              <TableHead className="min-w-[120px]">Окончание</TableHead>
              <TableHead className="min-w-[140px]">Склад хранения</TableHead>
              <TableHead className="min-w-[100px]">Ячейка</TableHead>
              <TableHead className="min-w-[120px]">Общая сумма</TableHead>
              <TableHead className="min-w-[80px]">Долг</TableHead>
              <TableHead className="min-w-[100px]">Договор</TableHead>
              <TableHead className="min-w-[140px]">Адрес клиента</TableHead>
              <TableHead className="min-w-[120px]">Статус сделка</TableHead>
              {/* Источник трафика показываем только администраторам */}
              {isAdmin && <TableHead className="min-w-[140px]">Источник трафика</TableHead>}
              {isAdmin && <TableHead className="w-[100px]">Действия</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: TireOrder) => (
              <TableRow key={order.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{order.client_name || '-'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{order.phone || '-'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{order.car_number || '-'}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-green-600">
                      {formatCurrency(order.monthly_price || 0)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">{order.tire_count || order.tire_quantity || 0}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{order.has_disks ? 'Да' : 'Нет'}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(order.start_date || '')}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{order.storage_period || 0}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(order.reminder_date || '')}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(order.end_date || '')}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{order.storage_location || '-'}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{order.storage_cell || '-'}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-blue-600">
                      {formatCurrency(order.total_amount || 0)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-red-600">
                    {formatCurrency(order.debt || order.debt_amount || 0)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{order.contract || order.contract_number || '-'}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{order.client_address || '-'}</span>
                </TableCell>
                <TableCell>
                  {getStatusBadge(order.deal_status || 'new')}
                </TableCell>
                {/* Источник трафика только для администраторов */}
                {isAdmin && (
                  <TableCell>
                    <span className="text-sm">{order.traffic_source || '-'}</span>
                  </TableCell>
                )}
                {isAdmin && (
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditOrder(order)}
                      className="w-full"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Изменить
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
