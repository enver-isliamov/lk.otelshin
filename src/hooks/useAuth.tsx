
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType } from '@/types/auth';
import { AuthService } from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохраненную сессию в localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        console.log('🔄 Восстанавливаем профиль из localStorage:', parsedProfile);
        setProfile(parsedProfile);
        setUser({ id: parsedProfile.id } as User);
      } catch (error) {
        console.error('❌ Ошибка восстановления профиля:', error);
        localStorage.removeItem('userProfile');
      }
    }

    // Слушаем изменения в localStorage для синхронизации между вкладками
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userProfile') {
        if (e.newValue) {
          try {
            const parsedProfile = JSON.parse(e.newValue);
            console.log('🔄 Синхронизация профиля между вкладками:', parsedProfile);
            setProfile(parsedProfile);
            setUser({ id: parsedProfile.id } as User);
          } catch (error) {
            console.error('❌ Ошибка синхронизации профиля:', error);
          }
        } else {
          console.log('🚪 Выход из системы в другой вкладке');
          setProfile(null);
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    setLoading(false);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const signIn = async (phone: string, chatId: string) => {
    try {
      console.log('🔐 Попытка авторизации:', { phone, chatId });
      
      // Поиск пользователя в Google Sheets через Edge Function со строгой проверкой
      const googleSheetsUser = await AuthService.findUserInGoogleSheets(phone, chatId);

      if (!googleSheetsUser) {
        console.error('❌ Пользователь не найден в Google Sheets или неверные учетные данные:', { phone, chatId });
        return { 
          error: { 
            message: 'Неверный номер телефона или Chat ID. Проверьте правильность введенных данных.' 
          } 
        };
      }

      // Создаем профиль для совместимости с остальной системой
      const profileData = AuthService.createUserProfile(googleSheetsUser);

      // Успешная авторизация
      setProfile(profileData);
      setUser({ id: profileData.id } as User);
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      console.log('✅ Пользователь успешно авторизован из Google Sheets:', profileData);
      
      return { error: null };

    } catch (error) {
      console.error('💥 Критическая ошибка авторизации через Google Sheets:', error);
      return { error: { message: 'Произошла ошибка при авторизации. Попробуйте снова.' } };
    }
  };

  const signOut = async () => {
    console.log('🚪 Выход из системы');
    setProfile(null);
    setUser(null);
    setSession(null);
    localStorage.removeItem('userProfile');
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      signIn,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
