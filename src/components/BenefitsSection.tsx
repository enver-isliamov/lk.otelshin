import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Users, Wrench, Building, Star, Thermometer, Shield, Eye, Wind, Droplets } from 'lucide-react';
export const BenefitsSection = () => {
  const benefits = ["не нужно самому носить шины", "возить шины от шиномонтажа в гараж и обратно", "захламлять гараж или балкон", "тратить время на перевозку"];
  const targetClients = [{
    icon: Users,
    title: "Автовладельцы",
    description: "для удобного хранения шин"
  }, {
    icon: Wrench,
    title: "Автосервисы",
    description: "оптимизация пространства"
  }, {
    icon: Building,
    title: "Компании по прокату",
    description: "управление автопарком"
  }];
  const advantages = ["Гарантируем полную сохранность ваших шин", "Подготовим колеса для хранения", "Соблюдаем сроки и договоренности", "Удобные тарифы и гибкие условия"];
  const storageConditions = [{
    icon: Thermometer,
    title: "Температура от 18 до 35 С°"
  }, {
    icon: Eye,
    title: "Защита от прямых солнечных лучей"
  }, {
    icon: Wind,
    title: "Промышленная вентиляция"
  }, {
    icon: Droplets,
    title: "Влажность воздуха 50-80%"
  }];
  return <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Основная проблема */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Решаем проблему хранения автомобильных
            </span>
            <br />
            <span className="text-gray-800">Шин, Дисков и Колес в сборе</span>
          </h2>
          
        </div>

        {/* Что не нужно делать */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              ⚡ Воспользовавшись услугой хранения, Вам не нужно:
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => <div key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>)}
            </div>
          </div>
        </div>

        {/* Кому полезно */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            🔥 Кому будут полезны наши услуги:
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {targetClients.map((client, index) => <Card key={index} className="bg-white shadow-lg border-0">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <client.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">{client.title}</h4>
                  <p className="text-gray-600 text-sm">{client.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>

        {/* Преимущества */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            🔥 НАШИ ПРЕИМУЩЕСТВА:
          </h3>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4">
              {advantages.map((advantage, index) => <div key={index} className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{advantage}</span>
                </div>)}
            </div>
          </div>
        </div>

        {/* Условия хранения */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            ⭐ ШИНЫ ХРАНЯТСЯ В СООТВЕТСТВИИ С ТРЕБОВАНИЯМИ ГОСТ Р 54266-2010:
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {storageConditions.map((condition, index) => <Card key={index} className="bg-white shadow-lg border-0">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <condition.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-700 font-medium text-sm">{condition.title}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            ❓ ЧТО ЕЩЕ СТОИТ ЗНАТЬ?
          </h3>
          <div className="space-y-4 text-gray-700">
            <p className="text-left">
              <strong>Вы можете забрать свой комплект колес и резины в любой момент</strong>, не дожидаясь окончания срока хранения.
            </p>
            <p className="text-left">
              <strong>Уже храните колеса у нас?</strong> По окончании срока колеса будут вас ждать на шиномонтаж у наших партнеров.
            </p>
          </div>
        </div>
      </div>
    </section>;
};