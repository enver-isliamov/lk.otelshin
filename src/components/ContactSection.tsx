
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Clock, Send } from 'lucide-react';

export const ContactSection = () => {
  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Контакты
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Свяжитесь с нами любым удобным способом
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                {/* Телефон */}
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Телефон</h3>
                    <p className="text-xl font-semibold text-blue-600">+7 978 070 36 65</p>
                    <p className="text-xs text-gray-500">Звонки и WhatsApp / Telegram</p>
                  </div>
                </div>

                {/* Telegram - используем официальные цвета Telegram */}
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-[#0088cc] rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Telegram</h3>
                    <Button 
                      className="bg-[#0088cc] hover:bg-[#229ED9] text-white border-0 shadow-md px-4 py-2 text-sm transition-all duration-200"
                      onClick={() => window.open('https://t.me/EnrikeTomas', '_blank')}
                    >
                      Написать в Telegram
                    </Button>
                  </div>
                </div>

                {/* Режим работы */}
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Режим работы</h3>
                    <div className="text-gray-700 space-y-1">
                      <p className="font-semibold">Ежедневно</p>
                      <p className="font-semibold text-lg text-blue-600">9:00 - 21:00</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
