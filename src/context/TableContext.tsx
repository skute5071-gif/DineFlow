import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SAMPLE_TABLES } from '../data/sampleTables';
import { getRestaurantById, Restaurant } from '../services/restaurantService';
import { apiService, ApiTable } from '../services/apiService';

interface TableContextType {
  restaurantId: string;
  restaurantName: string;
  restaurant: Restaurant;
  tableNumber: string | null;
  tableId: string | null;
  hasDetectedTable: boolean;
  isQRLocked: boolean;
  areaName: string;
  tables: ApiTable[];
  refreshTables: () => Promise<void>;
  setTable: (tableNum: string, area?: string, id?: string) => void;
  clearTable: () => void;
  unlockTable: () => void;
  isQRModalOpen: boolean;
  openQRModal: () => void;
  closeQRModal: () => void;
  getQRUrl: (tableNum?: string, customTableId?: string) => string;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurantId, setRestaurantId] = useState<string>('veg-maharaja-main');
  const [restaurant, setRestaurant] = useState<Restaurant>(() => getRestaurantById('veg-maharaja-main'));
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [tableId, setTableId] = useState<string | null>(null);
  const [hasDetectedTable, setHasDetectedTable] = useState<boolean>(false);
  const [isQRLocked, setIsQRLocked] = useState<boolean>(false);
  const [areaName, setAreaName] = useState<string>('');
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [tables, setTables] = useState<ApiTable[]>([]);

  // Fetch tables from backend for the active restaurant
  const refreshTables = useCallback(async () => {
    try {
      const serverTables = await apiService.getTables(restaurantId);
      if (serverTables && serverTables.length > 0) {
        setTables(serverTables);
      } else {
        // Fallback to sample tables
        const fallbackList: ApiTable[] = SAMPLE_TABLES.map(t => ({
          id: `${restaurantId}-t${t.number}`,
          restaurantId,
          number: t.number,
          area: t.area,
          capacity: t.capacity,
          isActive: true,
          createdAt: new Date().toISOString(),
        }));
        setTables(fallbackList);
      }
    } catch {
      // fallback
    }
  }, [restaurantId]);

  useEffect(() => {
    refreshTables();
  }, [refreshTables]);

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlRestaurant = searchParams.get('restaurantId') || searchParams.get('restaurant');
      const urlTableId = searchParams.get('tableId');
      const urlTableNum = searchParams.get('tableNumber') || searchParams.get('table');

      const targetRestId = urlRestaurant || localStorage.getItem('hvm_restaurant_id') || 'veg-maharaja-main';
      setRestaurantId(targetRestId);
      setRestaurant(getRestaurantById(targetRestId));
      if (urlRestaurant) {
        localStorage.setItem('hvm_restaurant_id', urlRestaurant);
      }

      // If URL contains tableId or tableNumber, customer arrived via table QR scan!
      if (urlTableId || urlTableNum) {
        const resolvedNum = urlTableNum || (urlTableId ? urlTableId.replace(/^.*-t/, '') : '5');
        const resolvedId = urlTableId || `${targetRestId}-t${resolvedNum}`;

        setTableNumber(resolvedNum);
        setTableId(resolvedId);
        setHasDetectedTable(true);
        // Table is locked to prevent customer accidentally changing it through ordinary menu controls
        setIsQRLocked(true);

        const match = SAMPLE_TABLES.find(t => t.number === resolvedNum);
        setAreaName(match ? match.area : `Table ${resolvedNum} · Dining Area`);

        localStorage.setItem('hvm_table', resolvedNum);
        localStorage.setItem('hvm_table_id', resolvedId);
        localStorage.setItem('hvm_qr_locked', 'true');
        return;
      }

      // Check localStorage for previously scanned/selected table
      const savedTable = localStorage.getItem('hvm_table');
      const savedTableId = localStorage.getItem('hvm_table_id');
      const savedLocked = localStorage.getItem('hvm_qr_locked') === 'true';

      if (savedTable) {
        setTableNumber(savedTable);
        setTableId(savedTableId || `${targetRestId}-t${savedTable}`);
        setHasDetectedTable(true);
        setIsQRLocked(savedLocked);
        const match = SAMPLE_TABLES.find(t => t.number === savedTable);
        setAreaName(match ? match.area : `Table ${savedTable} · Dining Area`);
      } else {
        // No table number exists: allow demo opening
        setHasDetectedTable(false);
        setTableNumber(null);
        setTableId(null);
        setIsQRLocked(false);
        setAreaName('Demo View · Walk-in');
      }
    } catch {
      // In case of parsing exception
    }
  }, []);

  const setTable = (newTableNum: string, newArea?: string, newId?: string) => {
    setTableNumber(newTableNum);
    const resolvedId = newId || `${restaurantId}-t${newTableNum}`;
    setTableId(resolvedId);
    setHasDetectedTable(true);
    const resolvedArea = newArea || SAMPLE_TABLES.find(t => t.number === newTableNum)?.area || `Table ${newTableNum} · Dining Area`;
    setAreaName(resolvedArea);
    localStorage.setItem('hvm_table', newTableNum);
    localStorage.setItem('hvm_table_id', resolvedId);

    // Update query params in URL without full refresh
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('restaurantId', restaurantId);
      url.searchParams.set('tableId', resolvedId);
      url.searchParams.set('tableNumber', newTableNum);
      window.history.replaceState({}, '', url);
    } catch {
      // fallback
    }
  };

  const clearTable = () => {
    setTableNumber(null);
    setTableId(null);
    setHasDetectedTable(false);
    setIsQRLocked(false);
    setAreaName('Demo View');
    localStorage.removeItem('hvm_table');
    localStorage.removeItem('hvm_table_id');
    localStorage.removeItem('hvm_qr_locked');
  };

  const unlockTable = () => {
    setIsQRLocked(false);
    localStorage.removeItem('hvm_qr_locked');
  };

  const openQRModal = () => setIsQRModalOpen(true);
  const closeQRModal = () => setIsQRModalOpen(false);

  // Generates valid, scannable QR URL with restaurantId and tableId/tableNumber
  const getQRUrl = (customTableNum?: string, customTableId?: string): string => {
    const tableNumToUse = customTableNum || tableNumber || '1';
    const tableIdToUse = customTableId || (tableId ? tableId : `${restaurantId}-t${tableNumToUse}`);
    const origin = window.location.origin;
    return `${origin}/menu?restaurantId=${encodeURIComponent(restaurantId)}&tableId=${encodeURIComponent(tableIdToUse)}&tableNumber=${encodeURIComponent(tableNumToUse)}`;
  };

  return (
    <TableContext.Provider
      value={{
        restaurantId,
        restaurantName: restaurant.name,
        restaurant,
        tableNumber,
        tableId,
        hasDetectedTable,
        isQRLocked,
        areaName,
        tables,
        refreshTables,
        setTable,
        clearTable,
        unlockTable,
        isQRModalOpen,
        openQRModal,
        closeQRModal,
        getQRUrl,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
};
