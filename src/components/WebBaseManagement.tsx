
import React from 'react';
import { WebBaseSyncCard } from './WebBaseSyncCard';
import { WebBaseStatus } from './WebBaseStatus';

export const WebBaseManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Управление WebBase
        </h2>
        <p className="text-gray-600">
          Синхронизация и управление базой данных клиентов из Google Таблицы
        </p>
      </div>
      
      <WebBaseStatus />
      <WebBaseSyncCard />
    </div>
  );
};
