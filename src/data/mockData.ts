import { Dish, CategoryInfo } from '../types';
import { HOTEL_VEG_MAHARAJA_MENU, HOTEL_VEG_MAHARAJA_CATEGORIES } from './menuData';

export const RESTAURANT_CONFIG = {
  id: 'veg-maharaja-main',
  name: 'HOTEL VEG MAHARAJA',
  tagline: 'Pure Veg & Family Restaurant',
  marathiTagline: 'शुध्द शाकाहारी ✽ फॅमिली रेस्टॉरंट',
  phone: '+91 9763434059',
  address: 'nashik-chatrapati sambhajinager highway, chandori - 422210',
  timings: '11:00 AM – 11:30 PM (All 7 Days)',
  pureVegAssurance: '100% Shuddh Shakahari · Pure Desi Ghee & Fresh Dairy',
};

// Exact categories matching the Hotel Veg Maharaja uploaded menu card
export const MENU_CATEGORIES: CategoryInfo[] = HOTEL_VEG_MAHARAJA_CATEGORIES;
export const CATEGORIES = MENU_CATEGORIES;

/**
 * Structured Menu items extracted from Hotel Veg Maharaja uploaded menu card.
 * Formatted for direct replacement by MongoDB/API document schema:
 * { _id, id, name, category, categoryLabel, price, isVeg, description, image, isBestseller, isChefSpecial }
 */
export const MENU_ITEMS: Dish[] = HOTEL_VEG_MAHARAJA_MENU;
export { SAMPLE_TABLES } from './sampleTables';
