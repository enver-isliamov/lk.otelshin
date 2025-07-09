
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { CreateOrderDialog } from '@/components/CreateOrderDialog';
import { OrderFilters } from '@/components/OrderFilters';
import { OrdersGrid } from '@/components/OrdersGrid';

interface OrdersSectionProps {
  isAdmin: boolean;
  filteredOrders: any[];
  totalOrders: number;
  loadingOrders: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  storageFilter: string;
  onStorageFilterChange: (value: string) => void;
  hasDisksFilter: string;
  onHasDisksFilterChange: (value: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
  onOrderCreated: () => void;
  onEditOrder: (order: any) => void;
}

export const OrdersSection = ({
  isAdmin,
  filteredOrders,
  totalOrders,
  loadingOrders,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  storageFilter,
  onStorageFilterChange,
  hasDisksFilter,
  onHasDisksFilterChange,
  onClearFilters,
  activeFiltersCount,
  onOrderCreated,
  onEditOrder
}: OrdersSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            {isAdmin ? 'Все заказы' : 'Мои заказы'}
            <Badge variant="secondary" className="ml-2">
              {filteredOrders.length}
            </Badge>
            {activeFiltersCount > 0 && (
              <Badge variant="outline" className="ml-2">
                из {totalOrders}
              </Badge>
            )}
          </CardTitle>
          
          {/* Показываем кнопку создания заказа только администраторам */}
          {isAdmin && (
            <CreateOrderDialog onOrderCreated={onOrderCreated} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Фильтры только для администраторов */}
        {isAdmin && (
          <OrderFilters
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            statusFilter={statusFilter}
            onStatusFilterChange={onStatusFilterChange}
            storageFilter={storageFilter}
            onStorageFilterChange={onStorageFilterChange}
            hasDisksFilter={hasDisksFilter}
            onHasDisksFilterChange={onHasDisksFilterChange}
            onClearFilters={onClearFilters}
            activeFiltersCount={activeFiltersCount}
          />
        )}

        {loadingOrders ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Загрузка заказов...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              {totalOrders === 0 ? 'Заказы не найдены' : 'Нет заказов по заданным фильтрам'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {totalOrders === 0 
                ? (isAdmin 
                    ? 'В системе пока нет заказов для отображения' 
                    : 'У вас пока нет активных заказов'
                  )
                : 'Попробуйте изменить критерии поиска'
              }
            </p>
          </div>
        ) : (
          <OrdersGrid
            orders={filteredOrders}
            isAdmin={isAdmin}
            onEditOrder={onEditOrder}
          />
        )}
      </CardContent>
    </Card>
  );
};
