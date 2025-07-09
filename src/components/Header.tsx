
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, Clock, User } from 'lucide-react';
import { AuthDialog } from './AuthDialog';

export const Header = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg md:text-xl">Ш</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">ОтельШин</h1>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Сезонное хранение шин в Симферополе</p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-6">
            <div className="flex items-center text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              <span>+7 978 070 36 65</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>Симферополь</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>9:00 - 21:00</span>
            </div>
          </div>

          <Button 
            onClick={() => setShowAuthDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm md:text-base px-3 md:px-4 py-2"
          >
            <User className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Личный кабинет</span>
            <span className="sm:hidden">Кабинет</span>
          </Button>
        </div>
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </header>
  );
};
