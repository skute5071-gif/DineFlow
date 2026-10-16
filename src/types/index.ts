export type CategoryId =
  | 'all'
  | 'starter_course'
  | 'veg_soup_chilli'
  | 'special_starter'
  | 'paneer_special'
  | 'veg_special_bhaji'
  | 'veg_bhaji'
  | 'aapki_pasandi_dal'
  | 'maharashtrian_special'
  | 'tandoor_special'
  | 'tandoor_special_paratha'
  | 'rice_special'
  | 'biryani_rice_special'
  | 'papad_special'
  | 'salad_special'
  | 'ice_cream_special'
  | 'cold_drinks'
  | 'hot_drinks'
  | 'starters'
  | 'mains'
  | 'tandoor_breads'
  | 'south_indian'
  | 'desserts'
  | 'beverages';

export type Category = CategoryId;

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  hindiLabel?: string;
  marathiLabel?: string;
}

export interface Dish {
  _id?: string;
  id: string;
  name: string;
  hindiName?: string;
  marathiName?: string;
  category: CategoryId;
  categoryLabel?: string;
  price: number;
  description?: string;
  image?: string;
  isVeg?: boolean;
  isChefSpecial?: boolean;
  isBestseller?: boolean;
  spiceLevel?: 1 | 2 | 3; // 1: Mild, 2: Medium, 3: Spicy
  prepTime?: string;
  isJainAvailable?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
  spicePreference?: 'Mild' | 'Medium' | 'Spicy';
  isJain?: boolean;
  specialInstructions?: string;
}

export interface TableInfo {
  restaurantId: string;
  restaurantName: string;
  tableNumber: string;
  areaName?: string;
}

export interface Order {
  id: string;
  tokenNumber: string;
  tableNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number; // 5% GST
  total: number;
  customerName: string;
  customerPhone: string;
  specialInstructions?: string;
  paymentMethod: 'counter_cash' | 'upi_online' | 'card';
  paymentStatus: 'pending' | 'completed';
  orderStatus: 'received' | 'preparing' | 'served';
  createdAt: string;
}

export type Language = 'en' | 'mr';
