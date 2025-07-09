import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Thermometer, Camera, Bell, Truck, Users, Package, ClipboardCheck } from 'lucide-react';
export const ServicesSection = () => {
  const services = [{
    icon: ClipboardCheck,
    title: "Приём и осмотр",
    description: "Тщательный осмотр каждой шины с фотофиксацией состояния протектора, боковин и общего состояния",
    gradient: "from-blue-500 to-cyan-500"
  }, {
    icon: Package,
    title: "Профессиональная укладка",
    description: "Правильное размещение шин на специальных стеллажах с соблюдением технологии хранения",
    gradient: "from-green-500 to-teal-500"
  }, {
    icon: Thermometer,
    title: "Климат-контроль",
    description: "Поддержание температуры +15°C...+25°C и влажности 50-60% для сохранности резиновых смесей",
    gradient: "from-orange-500 to-red-500"
  }, {
    icon: Shield,
    title: "Охрана и безопасность",
    description: "Круглосуточная охрана, система видеонаблюдения, контроль доступа и пожарная сигнализация",
    gradient: "from-purple-500 to-pink-500"
  }, {
    icon: Camera,
    title: "Документооборот",
    description: "Ведение карточки хранения, фото при приёме/выдаче, QR-коды для быстрой идентификации",
    gradient: "from-indigo-500 to-blue-500"
  }, {
    icon: Bell,
    title: "Уведомления",
    description: "SMS и Telegram напоминания о сроках хранения, смене сезона и готовности к выдаче",
    gradient: "from-pink-500 to-rose-500"
  }, {
    icon: Truck,
    title: "Доставка по Крыму",
    description: "Забираем шины от вас и доставляем обратно по всему полуострову на специальном транспорте",
    gradient: "from-emerald-500 to-green-500"
  }, {
    icon: Users,
    title: "Персональное обслуживание",
    description: "Индивидуальный подход, консультации по выбору сезонной резины и рекомендации по эксплуатации",
    gradient: "from-violet-500 to-purple-500"
  }];
  return <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Полный цикл услуг
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            От приёма до выдачи — профессиональный подход к хранению ваших шин 
            с гарантией сохранности и качества обслуживания
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => <Card key={index} className="group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6 text-center">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${service.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>)}
        </div>

        {/* Процесс хранения */}
        <div className="mt-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Как происходит процесс хранения?
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Приём</h4>
              <p className="text-gray-600 text-sm">Осмотр, фотофиксация, оформление документов</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Подготовка</h4>
              <p className="text-gray-600 text-sm">Маркировка, размещение на стеллажах</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Хранение</h4>
              <p className="text-gray-600 text-sm">Контроль условий, периодические проверки.
Доступ в личный кабине</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Выдача</h4>
              <p className="text-gray-600 text-sm">Уведомление, подготовка, передача клиенту</p>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="mt-16 grid md:grid-cols-4 gap-8 text-center">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">10+</div>
            <p className="text-gray-600">лет на рынке</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">150+</div>
            <p className="text-gray-600">довольных клиентов</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">200м²</div>
            <p className="text-gray-600">площадь склада</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              99%
            </div>
            <p className="text-gray-600">возвращаемость клиентов</p>
          </div>
        </div>
      </div>
    </section>;
};