import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
export const PricingSection = () => {
  const pricingPlans = [{
    title: "Малый размер",
    subtitle: "R13 - R15",
    price: "500₽",
    period: "за месяц за комплект",
    features: ["4 шины без дисков", "Охраняемый склад", "Маркировка шин", "Уведомления о сроках"],
    popular: false,
    gradient: "from-blue-500 to-cyan-500"
  }, {
    title: "Средний размер",
    subtitle: "R16 - R19",
    price: "600₽",
    period: "за месяц за комплект",
    features: ["4 шины без дисков", "Охраняемый склад", "Маркировка шин", "Уведомления о сроках", "Приоритетное обслуживание"],
    popular: true,
    gradient: "from-purple-500 to-pink-500"
  }, {
    title: "Большой размер",
    subtitle: "R20 и больше",
    price: "700₽",
    period: "за месяц за комплект",
    features: ["4 шины без дисков", "Охраняемый склад", "Индивидуальные стеллажи", "Особые условия хранения", "Уведомления о сроках", "VIP обслуживание"],
    popular: false,
    gradient: "from-green-500 to-teal-500"
  }];
  return <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Стоимость хранения шин
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Выберите подходящий тариф для хранения ваших шин в Симферополе. 
            Все цены указаны за календарный месяц.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => <Card key={index} className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl border-0 bg-white ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}>
              {plan.popular && <div className="absolute top-0 left-0 right-0">
                  <div className={`bg-gradient-to-r ${plan.gradient} text-white text-center py-2 px-4`}>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Популярный
                    </Badge>
                  </div>
                </div>}

              <CardHeader className={`text-center pb-4 ${plan.popular ? 'pt-12' : ''}`}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center`}>
                  <span className="text-2xl font-bold text-white">{plan.title.charAt(0)}</span>
                </div>
                
                <CardTitle className="text-2xl font-bold text-gray-800">
                  {plan.title}
                </CardTitle>
                <p className="text-gray-600">{plan.subtitle}</p>
                
                <div className="mt-6">
                  <div className="text-4xl font-bold text-gray-800">{plan.price}</div>
                  <div className="text-gray-600">{plan.period}</div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-center">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center mr-3 flex-shrink-0`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>)}
                </ul>

                <Button className={`w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white py-3 text-lg font-semibold`} onClick={() => window.open('https://t.me/ShiniSimfBot', '_blank')}>
                  Выбрать тариф
                </Button>
              </CardContent>
            </Card>)}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl p-8 max-w-4xl mx-auto shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Дополнительные услуги</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-left">
                <h4 className="font-semibold text-gray-800 mb-2">Приём/выдача шин:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• В рабочее время со склада - БЕСПЛАТНО</li>
                  <li>• Доставка по городу - 500₽</li>
                  <li>• Вывоз шин прямо от дома или офиса - БЕСПЛАТНО
                </li>
                </ul>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-800 mb-2">Дополнительно:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Мойка колёс - 200₽/комплект</li>
                  <li>• Упаковка в пакеты - 350₽/комплект</li>
                  <li>• Запись на шиномонтаж к партнерам - БЕСПЛАТНО</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};