import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Dish } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (dish: Dish, quantity?: number, spicePreference?: 'Mild' | 'Medium' | 'Spicy', isJain?: boolean, instructions?: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  removeItem: (dishId: string) => void;
  clearCart: () => void;
  getItemQuantity: (dishId: string) => number;
  totalCount: number;
  subtotal: number;
  tax: number;
  grandTotal: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  lastAddedItem: Dish | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('hvm_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<Dish | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('hvm_cart', JSON.stringify(items));
    } catch {
      // storage unavailable
    }
  }, [items]);

  const addItem = (
    dish: Dish,
    quantity: number = 1,
    spicePreference: 'Mild' | 'Medium' | 'Spicy' = 'Medium',
    isJain: boolean = false,
    instructions?: string
  ) => {
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(
        item => item.dish.id === dish.id && item.spicePreference === spicePreference && item.isJain === isJain
      );

      if (existingIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingIndex].quantity += quantity;
        return newItems;
      } else {
        return [
          ...prevItems,
          {
            dish,
            quantity,
            spicePreference,
            isJain,
            specialInstructions: instructions,
          },
        ];
      }
    });

    setLastAddedItem(dish);
    // Clear toast notification after 3 seconds
    setTimeout(() => {
      setLastAddedItem(null);
    }, 3000);
  };

  const updateQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(dishId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.dish.id === dishId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (dishId: string) => {
    setItems(prevItems => prevItems.filter(item => item.dish.id !== dishId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (dishId: string): number => {
    const item = items.find(i => i.dish.id === dishId);
    return item ? item.quantity : 0;
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  // Standard 5% Restaurant GST
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + tax;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getItemQuantity,
        totalCount,
        subtotal,
        tax,
        grandTotal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        lastAddedItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
