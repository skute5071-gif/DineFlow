/**
 * DineFlow Multi-Restaurant Data Service
 * 
 * Supports dynamic multi-restaurant QR loading.
 * Later, this connects directly to the Node.js + Express + MongoDB backend:
 *   const res = await fetch(`/api/restaurants/${restaurantId}/menu`);
 *   return res.json();
 */

import { Dish, CategoryInfo } from '../types';
import { HOTEL_VEG_MAHARAJA_MENU, HOTEL_VEG_MAHARAJA_CATEGORIES } from '../data/menuData';

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  taglineMarathi: string;
  isPureVeg: boolean;
  phone: string;
  address: string;
  timings: string;
  categories: CategoryInfo[];
  menu: Dish[];
}

export const RESTAURANTS_DATABASE: Record<string, Restaurant> = {
  'veg-maharaja-main': {
    id: 'veg-maharaja-main',
    name: 'HOTEL VEG MAHARAJA',
    tagline: 'Pure Veg & Family Restaurant',
    taglineMarathi: 'शुध्द शाकाहारी ✽ फॅमिली रेस्टॉरंट',
    isPureVeg: true,
    phone: '+91 98220 54321',
    address: 'Station Road, Pune - 411001',
    timings: '11:00 AM – 11:30 PM (All Days)',
    categories: HOTEL_VEG_MAHARAJA_CATEGORIES,
    menu: HOTEL_VEG_MAHARAJA_MENU,
  },
  'maharaja-demo': {
    id: 'maharaja-demo',
    name: 'HOTEL VEG MAHARAJA',
    tagline: 'Pure Veg & Family Restaurant',
    taglineMarathi: 'शुध्द शाकाहारी ✽ फॅमिली रेस्टॉरंट',
    isPureVeg: true,
    phone: '+91 98220 54321',
    address: 'Station Road, Pune - 411001',
    timings: '11:00 AM – 11:30 PM (All Days)',
    categories: HOTEL_VEG_MAHARAJA_CATEGORIES,
    menu: HOTEL_VEG_MAHARAJA_MENU,
  },
  // Multi-restaurant demonstration sample
  'royal-punjab-express': {
    id: 'royal-punjab-express',
    name: 'ROYAL PUNJAB EXPRESS',
    tagline: 'Authentic North Indian Dining',
    taglineMarathi: 'शाही पंजाबी जेवण',
    isPureVeg: false,
    phone: '+91 98220 99887',
    address: 'Highway Circle, Pune - 411014',
    timings: '12:00 PM – 12:00 AM',
    categories: HOTEL_VEG_MAHARAJA_CATEGORIES.slice(0, 8),
    menu: HOTEL_VEG_MAHARAJA_MENU.slice(0, 20),
  },
};

/**
 * Loads restaurant details and menu dynamically by restaurantId
 * Defaults to Hotel Veg Maharaja if no ID is passed
 */
export const getRestaurantById = (restaurantId?: string | null): Restaurant => {
  if (!restaurantId || !RESTAURANTS_DATABASE[restaurantId]) {
    return RESTAURANTS_DATABASE['veg-maharaja-main'];
  }
  return RESTAURANTS_DATABASE[restaurantId];
};
