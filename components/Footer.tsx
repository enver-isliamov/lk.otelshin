import React from 'react';
import { Phone, MapPin, Mail, MessageCircle } from 'lucide-react';
export const Footer = () => {
  return <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Логотип и описание */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">Ш</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">ОтельШин.ру</h3>
                <p className="text-gray-400 text-sm">Сезонное хранение шин в Симферополе</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Надежное и безопасное хранение автомобильных шин в Крыму. 
              Более 10 лет опыта, современные складские помещения, 
              индивидуальный подход к каждому клиенту.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors cursor-pointer">
                <Phone className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer">
                <Mail className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Услуги */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Услуги</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Хранение легковых шин</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Хранение внедорожных шин</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Хранение с дисками</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Доставка шин</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Мойка колёс</a></li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Контакты</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+7 (978) 070-36-65</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>info@otelshin.ru</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>@ShiniSimfBot</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1" />
                <div>
                  <p>Симферополь, Крым</p>
                  <p className="text-sm">3 склада по всему городу</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2021 ОтельШин.ру Все права защищены.</p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a>
              <a href="#" className="hover:text-white transition-colors">Договор оферты</a>
              <a href="#" className="hover:text-white transition-colors">Контакты</a>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};