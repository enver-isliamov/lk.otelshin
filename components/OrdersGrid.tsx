
import React from 'react';
import { OrderCard } from '@/components/OrderCard';
import { TireOrder } from '@/types/auth';

interface OrdersGridProps {
  orders: TireOrder[];
  isAdmin: boolean;
  onEditOrder?: (order: TireOrder) => void;
}

export const OrdersGrid = ({ orders, isAdmin, onEditOrder }: OrdersGridProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          isAdmin={isAdmin}
          onEditOrder={onEditOrder}
        />
      ))}
    </div>
  );
};
