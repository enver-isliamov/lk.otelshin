
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const FAQSection = () => {
  const faqItems = [
    {
      question: "Как происходит процесс сдачи шин на хранение?",
      answer: "Вы привозите или мы забираем ваши шины. Проводим осмотр, фотофиксацию состояния, маркировку и размещение на специальных стеллажах с соблюдением всех требований хранения."
    },
    {
      question: "Можно ли забрать шины раньше срока?",
      answer: "Да, вы можете забрать свои шины в любой момент, не дожидаясь окончания оплаченного периода хранения. Мы работаем ежедневно с 9:00 до 21:00."
    },
    {
      question: "Гарантируете ли вы сохранность шин?",
      answer: "Мы гарантируем полную сохранность ваших шин. Склад оборудован системой видеонаблюдения, пожарной сигнализацией и круглосуточной охраной. Ведется документооборот с фотофиксацией."
    },
    {
      question: "Какие документы выдаются при сдаче шин?",
      answer: "При приеме шин мы выдаем расписку с подробным описанием состояния каждой шины, фотографиями и уникальным номером для идентификации."
    },
    {
      question: "Можете ли вы забрать шины и доставить их обратно?",
      answer: "Да, мы предоставляем услуги вывоза шин от клиента на склад на наш счет, а также доставку на шиномонтаж при смене сезона."
    },
    {
      question: "Есть ли скидки при долгосрочном хранении?",
      answer: "Да, мы предоставляем скидки при долгосрочном хранении. Также новые клиенты получают скидку 20% на первый месяц хранения."
    },
    {
      question: "В каких условиях хранятся шины?",
      answer: "Шины хранятся в соответствии с ГОСТ Р 54266-2010: температура 18-35°C, влажность 50-80%, защита от солнечных лучей, промышленная вентиляция."
    },
    {
      question: "Предоставляете ли вы дополнительные услуги?",
      answer: "Да, мы предоставляем мойку колес (100₽/шт), упаковку в пакеты (50₽/комплект), страхование (2% от стоимости), запись на шиномонтаж к партнерам."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Часто задаваемые вопросы
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Ответы на популярные вопросы о хранении шин
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white rounded-lg shadow-md border-0 px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-800 hover:text-blue-600">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
