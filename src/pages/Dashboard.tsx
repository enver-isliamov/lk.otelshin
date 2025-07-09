import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { GoogleSheetsSync } from '@/components/GoogleSheetsSync';
import { SyncSettingsCard } from '@/components/SyncSettingsCard';
import { WebBaseManagement } from '@/components/WebBaseManagement';
import { EditOrderDialog } from '@/components/EditOrderDialog';
import { DashboardHeader } from '@/components/DashboardHeader';
import { UserProfileCard } from '@/components/UserProfileCard';
import { OrdersSection } from '@/components/OrdersSection';
import { TireOrder } from '@/types/auth';
import { OrdersService } from '@/services/ordersService';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, profile, signOut, loading, signIn } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<TireOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<TireOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [editingOrder, setEditingOrder] = useState<TireOrder | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const { toast } = useToast();

  // Состояние фильтров
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [storageFilter, setStorageFilter] = useState('all');
  const [hasDisksFilter, setHasDisksFilter] = useState('all');

  // Обработка авторизации через параметр auth из Telegram
  useEffect(() => {
    const authParam = searchParams.get('auth');
    
    if (authParam && !profile && !loading && !authLoading) {
      handleTelegramAuth(authParam);
    }
  }, [searchParams, profile, loading, authLoading]);

  useEffect(() => {
    if (profile) {
      console.log('🔄 Загружаем заказы для профиля:', profile);
      fetchOrders();
    }
  }, [profile]);

  // Применяем фильтры при изменении заказов или фильтров
  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter, storageFilter, hasDisksFilter]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      
      console.log('📊 Текущий профиль:', profile);
      
      let result;
      
      if (profile.is_admin) {
        // Администратор получает все заказы
        console.log('👑 Загружаем все заказы для администратора');
        result = await OrdersService.getAllOrdersForAdmin();
      } else {
        // Обычный пользователь получает только свои заказы по строгому соответствию телефона и ChatID
        console.log('👤 Загружаем заказы пользователя:', { phone: profile.phone, chatId: profile.chat_id });
        result = await OrdersService.getOrdersFromGoogleSheets(profile.phone, profile.chat_id);
      }

      if (result.error) {
        if (result.error.type === 'PHONE_CHATID_MISMATCH') {
          toast({
            title: "Ошибка доступа",
            description: result.error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Ошибка",
            description: result.error.message || "Не удалось загрузить заказы",
            variant: "destructive"
          });
        }
        setOrders([]);
      } else {
        console.log('✅ Загружено заказов:', result.data?.length || 0);
        setOrders(result.data || []);
      }
    } catch (error) {
      console.error('💥 Критическая ошибка загрузки заказов:', error);
      toast({
        title: "Ошибка",
        description: "Произошла критическая ошибка при загрузке заказов",
        variant: "destructive"
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Поиск по тексту
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.client_name?.toLowerCase().includes(term) ||
        order.phone?.toLowerCase().includes(term)
      );
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.deal_status === statusFilter);
    }

    // Фильтр по складу
    if (storageFilter !== 'all') {
      filtered = filtered.filter(order => order.storage_location === storageFilter);
    }

    // Фильтр по дискам
    if (hasDisksFilter !== 'all') {
      const hasDisks = hasDisksFilter === 'yes';
      filtered = filtered.filter(order => order.has_disks === hasDisks);
    }

    setFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStorageFilter('all');
    setHasDisksFilter('all');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter !== 'all') count++;
    if (storageFilter !== 'all') count++;
    if (hasDisksFilter !== 'all') count++;
    return count;
  };

  const handleEditOrder = (order: TireOrder) => {
    console.log('✏️ Редактируем заказ:', order);
    setEditingOrder(order);
    setEditDialogOpen(true);
  };

  const handleTelegramAuth = async (sessionId: string) => {
    console.log('🔐 Обработка авторизации через Telegram с sessionId:', sessionId);
    setAuthLoading(true);
    
    try {
      // Очищаем параметр auth из URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('auth');
      setSearchParams(newSearchParams, { replace: true });
      
      // Проверяем сессию в Google Sheets
      const { data, error } = await supabase.functions.invoke('telegram-auth-check', {
        body: { sessionId }
      });
      
      if (error) {
        console.error('❌ Ошибка проверки сессии:', error);
        toast({
          title: "Ошибка авторизации",
          description: "Не удалось проверить сессию. Попробуйте авторизоваться заново.",
          variant: "destructive"
        });
        return;
      }
      
      if (data && data.success && data.user) {
        console.log('✅ Найдена валидная сессия для пользователя:', data.user);
        
        // Выполняем авторизацию через существующий механизм
        const signInResult = await signIn(data.user.phone || '', data.user.chatId || '');
        
        if (!signInResult.error) {
          toast({
            title: "Добро пожаловать!",
            description: `Вы вошли как ${data.user.name}`,
          });
        } else {
          toast({
            title: "Ошибка авторизации",
            description: "Не удалось войти в систему",
            variant: "destructive"
          });
        }
      } else {
        console.log('❌ Сессия не найдена или недействительна');
        toast({
          title: "Сессия недействительна",
          description: "Попробуйте авторизоваться заново через Telegram бот",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('💥 Критическая ошибка при авторизации через Telegram:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при авторизации",
        variant: "destructive"
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Выход",
      description: "Вы успешно вышли из системы"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        profileName={profile.name}
        profilePhone={profile.phone}
        profileChatId={profile.chat_id}
        isAdmin={profile.is_admin}
        onSignOut={handleSignOut}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Компоненты синхронизации (только для администраторов) */}
        {profile.is_admin && (
          <>
            <WebBaseManagement />
            <GoogleSheetsSync />
            <SyncSettingsCard />
          </>
        )}

        <OrdersSection
          isAdmin={profile.is_admin}
          filteredOrders={filteredOrders}
          totalOrders={orders.length}
          loadingOrders={loadingOrders}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          storageFilter={storageFilter}
          onStorageFilterChange={setStorageFilter}
          hasDisksFilter={hasDisksFilter}
          onHasDisksFilterChange={setHasDisksFilter}
          onClearFilters={clearFilters}
          activeFiltersCount={getActiveFiltersCount()}
          onOrderCreated={fetchOrders}
          onEditOrder={handleEditOrder}
        />
      </div>

      {/* Диалог редактирования заказа */}
      <EditOrderDialog
        order={editingOrder}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onOrderUpdated={fetchOrders}
      />
    </div>
  );
};

export default Dashboard;
