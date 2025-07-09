
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Phone, Settings } from 'lucide-react';

interface UserProfileCardProps {
  name: string;
  phone: string;
  chatId: string | null;
  isAdmin: boolean;
}

export const UserProfileCard = ({ name, phone, chatId, isAdmin }: UserProfileCardProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2" />
          Информация о профиле
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Имя:</span>
            <span className="font-medium">{name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Телефон:</span>
            <span className="font-medium">{phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Chat ID:</span>
            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{chatId}</span>
          </div>
        </div>
        
        {isAdmin && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Settings className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Права администратора</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Вы можете видеть все заказы и управлять системой
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
