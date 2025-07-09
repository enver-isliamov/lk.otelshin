import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Car, Clock, Award, Phone, Send, CheckCircle } from 'lucide-react';
export const HeroSection = () => {
  return <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Фоновые элементы */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Основной контент */}
          <div className="space-y-6 md:space-y-8 mb-12 md:mb-16">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Сезонное хранение
                </span>
                <br />
                <span className="text-gray-800">автомобильных шин</span>
                <br />
                <span className="text-xl md:text-2xl lg:text-3xl text-gray-600 font-medium">в Симферополе</span>
              </h1>
              
              <div className="space-y-4 max-w-4xl mx-auto px-4">
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Решаем проблему хранения автомобильных Шин, Дисков и Колес в сборе
                  <br />
                  Вам больше не придется искать место на балконе, перетаскивать тяжелые колеса в поисках свободного места
                </p>
                
                <div className="bg-green-50 border-l-4 border-green-500 p-4 md:p-6 rounded-r-lg max-w-3xl mx-auto">
                  <h3 className="font-semibold text-green-800 mb-3">⚡ Воспользовавшись услугой хранения, Вам не нужно:</h3>
                  <div className="space-y-2 text-green-700 text-sm md:text-base">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>самому носить шины</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>возить шины от шиномонтажа в гараж и обратно</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>захламлять гараж или балкон</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>тратить время на перевозку</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Контактная информация - более компактная */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 md:p-6 rounded-2xl max-w-xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <Phone className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="text-lg md:text-xl font-bold text-gray-800">+7 978 070 36 65</span>
                  </div>
                  <p className="text-xs text-gray-600">Звонки и Telegram</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <Clock className="w-5 h-5 mr-2 text-orange-600" />
                    <span className="font-semibold text-gray-800">Ежедневно: 9:00-21:00</span>
                  </div>
                  <p className="text-xs text-gray-600">Без выходных</p>
                </div>
              </div>
            </div>

            {/* Кнопки действий - адаптивные */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4">
              <Button size="lg" className="bg-[#0088cc] hover:bg-[#229ED9] text-white px-6 md:px-8 py-3 text-base md:text-lg transition-all duration-200 shadow-lg" onClick={() => window.open('https://t.me/EnrikeTomas', '_blank')}>
                <Send className="w-4 h-4 mr-2" />
                Связаться через Telegram
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 md:px-8 py-3 text-base md:text-lg" onClick={() => window.location.href = 'tel:+79780703665'}>
                <Phone className="w-4 h-4 mr-2" />
                Позвонить сейчас
              </Button>
            </div>

            {/* Преимущества - адаптивная сетка */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-6 md:pt-8 max-w-4xl mx-auto px-4">
              <div className="text-center space-y-2 md:space-y-3">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm md:text-base">Безопасность</h3>
                  <p className="text-xs text-gray-600">Охрана и видеонаблюдение</p>
                </div>
              </div>
              
              <div className="text-center space-y-2 md:space-y-3">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto">
                  <Car className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm md:text-base">Удобство</h3>
                  <p className="text-xs text-gray-600">Быстрая выдача</p>
                </div>
              </div>
              
              <div className="text-center space-y-2 md:space-y-3">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm md:text-base">Режим работы</h3>
                  <p className="text-xs text-gray-600">Ежедневно 9:00-21:00</p>
                </div>
              </div>
              
              <div className="text-center space-y-2 md:space-y-3">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm md:text-base">Опыт</h3>
                  <p className="text-xs text-gray-600">Более 10 лет</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Дополнительная информация - адаптивная сетка */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4">
          <div className="bg-white/70 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-lg">
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2 md:mb-3">🏢 Современный склад</h3>
            <p className="text-gray-600 text-sm">Специально оборудованное помещение в Симферополе площадью 100 м² с системой вентиляции и поддержанием оптимальной температуры +18°C...+35°C</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-lg">
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2 md:mb-3">📋 Полный сервис</h3>
            <p className="text-gray-600 text-sm">
              Приём, маркировка, фотофиксация состояния, хранение и выдача. 
              Дополнительно: мойка, упаковка, доставка по городу
            </p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-lg">
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2 md:mb-3">💰 Выгодные цены</h3>
            <p className="text-gray-600 text-sm">От 500₽ за комплект в месяц. Бонусы при долгосрочном хранении. Бонусы за новых клиентов.</p>
          </div>
        </div>
      </div>
    </section>;
};