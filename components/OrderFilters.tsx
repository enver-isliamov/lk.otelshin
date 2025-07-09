
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  storageFilter: string;
  onStorageFilterChange: (value: string) => void;
  hasDisksFilter: string;
  onHasDisksFilterChange: (value: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export const OrderFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  storageFilter,
  onStorageFilterChange,
  hasDisksFilter,
  onHasDisksFilterChange,
  onClearFilters,
  activeFiltersCount
}: OrderFiltersProps) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Поиск по имени, телефону или номеру авто..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Фильтры:</span>
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="completed">Завершенные</SelectItem>
            <SelectItem value="overdue">Просроченные</SelectItem>
          </SelectContent>
        </Select>

        <Select value={storageFilter} onValueChange={onStorageFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Склад" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все склады</SelectItem>
            <SelectItem value="Склад А">Склад А</SelectItem>
            <SelectItem value="Склад Б">Склад Б</SelectItem>
            <SelectItem value="Склад В">Склад В</SelectItem>
          </SelectContent>
        </Select>

        <Select value={hasDisksFilter} onValueChange={onHasDisksFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Диски" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="true">С дисками</SelectItem>
            <SelectItem value="false">Без дисков</SelectItem>
          </SelectContent>
        </Select>

        {activeFiltersCount > 0 && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {activeFiltersCount} фильтр(ов)
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2"
            >
              <X className="w-3 h-3 mr-1" />
              Очистить
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
