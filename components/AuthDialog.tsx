import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { TelegramOAuth } from './TelegramOAuth';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export const AuthDialog = ({
  open,
  onOpenChange
}: AuthDialogProps) => {
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [chatId, setChatId] = useState('');
  const {
    toast
  } = useToast();
  const {
    signIn
  } = useAuth();
  const navigate = useNavigate();
  const handleAuthSuccess = () => {
    onOpenChange(false);
    navigate('/dashboard', {
      replace: true
    });
  };
  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim() || !chatId.trim()) {
      toast({
        title: "Заполните поля",
        description: "Укажите номер телефона и Chat ID",
        variant: "destructive"
      });
      return;
    }
    setIsPhoneLoading(true);
    try {
      const signInResult = await signIn(phoneNumber.trim(), chatId.trim());
      if (!signInResult.error) {
        toast({
          title: "Успешно!",
          description: "Вход выполнен"
        });
        handleAuthSuccess();
      } else {
        toast({
          title: "Ошибка входа",
          description: "Проверьте номер телефона и Chat ID",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Ошибка авторизации",
        variant: "destructive"
      });
    } finally {
      setIsPhoneLoading(false);
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gray-800">
            Вход в личный кабинет
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Telegram авторизация */}
          <div className="space-y-4">
            <TelegramOAuth onSuccess={handleAuthSuccess} />
          </div>

          {/* Разделитель */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">или</span>
            </div>
          </div>

          {/* Авторизация по телефону */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Номер телефона</Label>
                <Input id="phone" type="tel" placeholder="+79781234567" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="chatId" className="text-sm font-medium text-gray-700">Код доступа</Label>
                <Input id="chatId" type="text" placeholder="507604784" value={chatId} onChange={e => setChatId(e.target.value)} className="mt-1" />
                <p className="text-xs text-gray-500 mt-1">Получите код доступа в @ShiniSimfBot командой /start</p>
              </div>

              <Button onClick={handlePhoneSubmit} disabled={isPhoneLoading} className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                {isPhoneLoading ? <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Проверка...
                  </> : 'Войти'}
              </Button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-400">
            ОтельШин - надежное хранение шин в Крыму
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};