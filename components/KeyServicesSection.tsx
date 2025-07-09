
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, Calendar, ArrowRightLeft } from 'lucide-react';

export const KeyServicesSection = () => {
  const keyServices = [
    {
      icon: Truck,
      title: "Вывоз от клиента на склад",
      description: "Забираем ваши шины прямо от дома или офиса на наш счёт",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Calendar,
      title: "Запись на шиномонтаж",
      description: "Записываем к партнёрам на удобное для вас время",
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: ArrowRightLeft,
      title: "Доставка на шиномонтаж",
      description: "Доставляем при смене сезона и сдаче на повторное хранение",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Полный сервис для максимального удобства наших клиентов
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {keyServices.map((service, index) => (
            <Card 
              key={index}
              className="group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0 bg-white"
            >
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${service.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
