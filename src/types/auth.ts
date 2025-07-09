
import { User, Session } from '@supabase/supabase-js';

// Типы для таблицы WebBase
export interface WebBaseRecord {
  id: string;
  phone?: string;
  chat_id?: string;
  client_name?: string;
  car_number?: string;
  client_address?: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Типы для заказов шин (обновленные с правильными полями согласно Google Sheets)
export interface TireOrder {
  id: string;
  chat_id: string;
  client_name: string;
  phone: string;
  car_number?: string;
  order_qr?: string;
  qr_order?: string; // Альтернативное название для QR
  monthly_price?: number;
  tire_quantity?: number;
  tire_count?: number; // Альтернативное название для количества шин
  tire_size?: string; // Размер шин
  tire_brand?: string; // Бренд шин
  has_disks?: boolean;
  start_date?: string;
  storage_period?: string | number; // Может быть строкой или числом
  reminder_date?: string;
  end_date?: string;
  storage_location?: string;
  storage_cell?: string;
  total_amount?: number;
  debt_amount?: number;
  debt?: number; // Альтернативное название для долга
  contract_number?: string;
  contract?: string; // Альтернативное название для договора
  client_address?: string;
  deal_status?: string; // Статус сделки из Google Sheets
  status?: string; // Альтернативное название для статуса
  traffic_source?: string;
  notes?: string; // Заметки
  price?: number; // Цена
  quantity?: number; // Количество
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  signIn: (phone: string, chatId: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  chat_id: string;
  is_admin: boolean;
  address?: string;
  car_number?: string;
}
