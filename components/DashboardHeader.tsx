import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, Phone, MessageCircle } from 'lucide-react';
interface DashboardHeaderProps {
  profileName: string;
  profilePhone: string;
  profileChatId: string | null;
  isAdmin: boolean;
  onSignOut: () => void;
}
export const DashboardHeader = ({
  profileName,
  profilePhone,
  profileChatId,
  isAdmin,
  onSignOut
}: DashboardHeaderProps) => {
  // Функция для сокращения длинных имен
  const truncateName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + '...';
  };
  return <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">OS</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">OtelShin.ru</h1>
              <p className="text-sm text-gray-600">
                {isAdmin ? 'Панель администратора' : 'Личный кабинет'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center justify-end space-x-2 mb-1">
                <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="font-medium text-gray-800 truncate max-w-[200px] sm:max-w-[300px]" title={profileName}>
                  {truncateName(profileName, window.innerWidth < 640 ? 15 : 25)}
                </span>
              </div>
              <div className="flex items-center justify-end space-x-2 mb-1">
                <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-600 truncate">{profilePhone}</span>
              </div>
              {profileChatId && <div className="flex items-center justify-end space-x-2">
                  <MessageCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded truncate">
                    {profileChatId}
                  </span>
                </div>}
            </div>
            <Button onClick={onSignOut} variant="outline" size="sm" className="p-2" title="Выход">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>;
};