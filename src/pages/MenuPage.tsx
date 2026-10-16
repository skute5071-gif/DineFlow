import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MENU_ITEMS, MENU_CATEGORIES, RESTAURANT_CONFIG } from '../data/mockData';
import { DishCard } from '../components/dish/DishCard';
import { ExactMaharajaLogo } from '../components/common/Logo';
import { VegBadge } from '../components/common/VegBadge';
import { TableIndicator } from '../components/common/TableIndicator';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { useCart } from '../context/CartContext';
import { useTable } from '../context/TableContext';
import { useLanguage } from '../context/LanguageContext';
import { Search, ShoppingBag, Globe, QrCode, ArrowRight, X, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { CategoryId, Language } from '../types';

export const MenuPage: React.FC = () => {
  const { totalCount, grandTotal } = useCart();
  const { tableNumber, openQRModal, restaurant } = useTable();
  const { language, setLanguage, t } = useLanguage();

  const menuItems = restaurant?.menu || MENU_ITEMS;
  const menuCategories = restaurant?.categories || MENU_CATEGORIES;

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [jainOnly, setJainOnly] = useState(false);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return menuItems.filter(dish => {
      // Category filter
      if (selectedCategory !== 'all' && dish.category !== selectedCategory) {
        return false;
      }
      // Jain filter
      if (jainOnly && !dish.isJainAvailable) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = dish.name.toLowerCase().includes(query);
        const matchesHindi = dish.hindiName?.toLowerCase().includes(query);
        const matchesMarathi = dish.marathiName?.toLowerCase().includes(query);
        const matchesCategory = dish.categoryLabel?.toLowerCase().includes(query);
        const matchesDesc = dish.description?.toLowerCase().includes(query);
        return matchesName || matchesHindi || matchesMarathi || matchesCategory || matchesDesc;
      }
      return true;
    });
  }, [menuItems, selectedCategory, searchQuery, jainOnly]);

  // Group dishes by category if 'all' is selected and no search
  const categoriesWithDishes = useMemo(() => {
    if (selectedCategory !== 'all' || searchQuery.trim() !== '') {
      return [];
    }
    return menuCategories.filter(c => c.id !== 'all').map(cat => ({
      ...cat,
      dishes: menuItems.filter(d => d.category === cat.id && (!jainOnly || d.isJainAvailable)),
    })).filter(cat => cat.dishes.length > 0);
  }, [menuCategories, menuItems, selectedCategory, searchQuery, jainOnly]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLangDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-32 md:pb-20">
      {/* 1. TOP BAR SPECIFICATION:
          - Restaurant logo
          - HOTEL VEG MAHARAJA
          - Search food field
          - Language selector
          - Cart button
      */}
      <div className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#EDE5D5] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            {/* Left: Restaurant Logo & Name */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
              <ExactMaharajaLogo size="sm" className="w-9 h-9 sm:w-11 sm:h-11" />
              <div className="flex flex-col leading-none">
                <span className="font-cinzel font-black text-[10px] sm:text-xs tracking-[0.2em] text-[#CBA24B]">
                  HOTEL
                </span>
                <span className="font-serif font-black text-base sm:text-xl text-[#5E0F14] tracking-tight">
                  VEG MAHARAJA
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#7D151B] font-bold tracking-wide mt-0.5">
                  Pure Veg & Family Restaurant
                </span>
              </div>
            </Link>

            {/* Center: Search Food Field (Desktop/Tablet) */}
            <div className="hidden md:flex flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full pl-10 pr-9 py-2 text-xs bg-[#F6F0E6]/60 border border-[#EDE5D5] rounded-xl focus:outline-none focus:border-[#7D151B] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right: Table Info + Language Selector + Cart Button */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Table Indicator (Table 5 or Demo Mode) */}
              <TableIndicator size="md" />

              {/* Bilingual Language Selector: English | मराठी */}
              <LanguageSelector />

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#7D151B] hover:bg-[#671116] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#F3D99A]" />
                <span className="hidden sm:inline">{t('cart')}</span>
                {totalCount > 0 && (
                  <span className="bg-[#CBA24B] text-[#38080B] text-[10px] font-black px-1.5 py-0.2 rounded-full tabular-nums">
                    {totalCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Search Food Field (Mobile View - Below logo) */}
          <div className="md:hidden mt-2.5 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search food by name (Paneer, Dal, Soup)..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#F6F0E6]/70 border border-[#EDE5D5] rounded-xl focus:outline-none focus:border-[#7D151B] focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. CATEGORY NAVIGATION:
            Organized according to the exact categories visible in the menu card:
            - Starter Course
            - Veg Soup/Chilli
            - Special Starter
            - Paneer Special
            - Veg Special Bhaji
            - Veg Bhaji
            - Aapki Pasandi Dal
            - Maharashtrian Special
            - Tandoor Special
            - Tandoor Special Paratha
            - Rice Special
            - Biryani Rice Special
            - Salad Special
            - Ice Cream Special
            - Cold Drinks / Soft Drinks
            - Hot Drinks
        */}
        <div className="bg-[#FAF1F1]/80 border-t border-[#EDE5D5] px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2">
            {menuCategories.map(cat => {
              const isActive = selectedCategory === cat.id;
              const count =
                cat.id === 'all'
                  ? menuItems.length
                  : menuItems.filter(d => d.category === cat.id).length;

              const label =
                language === 'mr' && cat.marathiLabel
                  ? cat.marathiLabel
                  : cat.label;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#7D151B] text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-[#EDE5D5] hover:bg-[#F6F0E6]'
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                      isActive ? 'bg-[#CBA24B] text-[#38080B] font-extrabold' : 'bg-[#F6F0E6] text-stone-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 sm:mt-6">
        {/* Active Filter & Count Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#EDE5D5] shadow-xs mb-6">
          <div className="flex items-center gap-2">
            <VegBadge size="md" />
            <span className="text-xs sm:text-sm font-bold text-stone-900">
              {selectedCategory === 'all'
                ? 'Complete Pure Vegetarian Menu'
                : MENU_CATEGORIES.find(c => c.id === selectedCategory)?.label}
            </span>
            <span className="text-xs text-stone-500 font-medium">
              ({filteredDishes.length} items)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Jain Filter Toggle */}
            <button
              onClick={() => setJainOnly(!jainOnly)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                jainOnly
                  ? 'bg-[#15803D] text-white border-[#15803D]'
                  : 'bg-[#FDFBF7] text-stone-700 border-[#EDE5D5] hover:border-[#15803D]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${jainOnly ? 'bg-white' : 'bg-[#15803D]'}`} />
              <span>Jain Friendly</span>
            </button>

            {(searchQuery || selectedCategory !== 'all' || jainOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setJainOnly(false);
                }}
                className="text-xs font-bold text-[#7D151B] hover:underline cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Search Results / Single Category View */}
        {selectedCategory !== 'all' || searchQuery.trim() !== '' ? (
          <div>
            {filteredDishes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredDishes.map(dish => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#EDE5D5] p-12 text-center max-w-md mx-auto my-8">
                <div className="w-12 h-12 rounded-full bg-[#FAF1F1] text-[#7D151B] flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-stone-800">No food items found</h3>
                <p className="text-xs text-stone-500 mt-1">
                  No dishes matched "{searchQuery}" in this category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 px-4 py-2 bg-[#7D151B] text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  View All Dishes
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Grouped Categories View (When 'All' is selected, categorized naturally) */
          <div className="space-y-12">
            {categoriesWithDishes.map(cat => (
              <section key={cat.id} id={cat.id} className="scroll-mt-36">
                {/* Category Header */}
                <div className="flex items-center justify-between pb-3 mb-5 border-b-2 border-[#CBA24B]/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-6 bg-[#7D151B] rounded-r-md" />
                    <h2 className="font-serif font-black text-xl sm:text-2xl text-[#4E0D11]">
                      {language === 'mr' && cat.marathiLabel
                        ? cat.marathiLabel
                        : cat.label}
                    </h2>
                    <span className="text-xs font-bold text-[#AA8232] bg-[#F6F0E6] px-2 py-0.5 rounded-full tabular-nums">
                      {cat.dishes.length}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    className="text-xs font-bold text-[#7D151B] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View Category</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Dishes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {cat.dishes.map(dish => (
                    <DishCard key={dish.id} dish={dish} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar for Mobile QR Users */}
      {totalCount > 0 && (
        <div className="fixed bottom-14 md:bottom-6 left-0 right-0 z-30 px-4 pointer-events-none">
          <div className="max-w-lg mx-auto bg-stone-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-[#CBA24B]/50 flex items-center justify-between pointer-events-auto animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7D151B] flex items-center justify-center text-[#E2BF6F] font-black text-sm">
                {totalCount}
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-200">
                  {totalCount} {totalCount === 1 ? t('item') : t('items')} · {t('table')} #{tableNumber || '5'}
                </p>
                <p className="text-sm font-bold text-white tabular-nums">
                  ₹{grandTotal}{' '}
                  <span className="text-[10px] text-stone-400 font-normal">({t('all_taxes_included')})</span>
                </p>
              </div>
            </div>

            <Link
              to="/cart"
              className="px-5 py-2.5 bg-[#CBA24B] hover:bg-[#AA8232] text-[#38080B] text-xs font-black rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>{t('cart')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
