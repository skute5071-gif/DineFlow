import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { TableIndicator } from '../common/TableIndicator';
import { LanguageSelector } from '../common/LanguageSelector';
import { useCart } from '../../context/CartContext';
import { useTable } from '../../context/TableContext';
import { useLanguage } from '../../context/LanguageContext';
import { ShoppingBag, QrCode, Globe, Menu as MenuIcon, X, Utensils } from 'lucide-react';
import { Language } from '../../types';

export const Header: React.FC = () => {
  const location = useLocation();
  const { totalCount, grandTotal } = useCart();
  const { tableNumber, hasDetectedTable, openQRModal } = useTable();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('menu'), path: '/menu' },
    { name: 'Pure Veg Story', path: '/#why-us' },
  ];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLangDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#EDE5D5] transition-all">
      {/* Top micro announcement bar: Pure Vegetarian & DineFlow Banner */}
      <div className="bg-[#7D151B] text-[#FFFDF9] py-1 px-4 text-xs font-medium text-center flex items-center justify-between border-b border-[#961D24]">
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#F3D99A]">
          <span className="inline-block w-2 h-2 rounded-full bg-[#15803D]" />
          <span>100% Shuddh Shakahari · Pure Desi Ghee & Fresh Dairy</span>
        </div>
        <div className="mx-auto sm:mx-0 flex items-center gap-1.5 text-[11px]">
          <span className="text-white/80">Table QR Ordering:</span>
          {hasDetectedTable && tableNumber ? (
            <button
              onClick={openQRModal}
              className="text-[#E2BF6F] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Table {tableNumber}</span>
              <span className="text-[10px] bg-[#4E0D11] px-1.5 py-0.2 rounded border border-[#CBA24B]/40">
                Change
              </span>
            </button>
          ) : (
            <button
              onClick={openQRModal}
              className="text-[#E2BF6F] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Demo Mode</span>
              <span className="text-[10px] bg-[#4E0D11] px-1.5 py-0.2 rounded border border-[#CBA24B]/40">
                Set Table
              </span>
            </button>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-white/80">
          <span>No Login Required for Guests</span>
          <span className="text-white/40">|</span>
          <Link
            to="/admin"
            className="text-[#F3D99A] hover:underline font-bold flex items-center gap-1"
          >
            <span>Staff Portal</span>
          </Link>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        {/* Zone 1: Restaurant Logo & Name */}
        <Link to="/" className="flex items-center shrink-0 group">
          <Logo size="md" showText={true} />
        </Link>

        {/* Zone 2: Navigation Links & Table Affordance */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-700">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors py-1 relative ${
                  isActive
                    ? 'text-[#7D151B] font-semibold'
                    : 'text-stone-700 hover:text-[#7D151B]'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7D151B] rounded-full" />
                )}
              </Link>
            );
          })}

          {/* Quick Table Switcher Button in Nav */}
          <TableIndicator size="sm" />
        </nav>

        {/* Zone 3: Language Selector & Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Bilingual Language Selector: English | मराठी */}
          <LanguageSelector />

          {/* Cart Button */}
          <Link
            to="/cart"
            className="relative px-3.5 py-2 bg-[#7D151B] hover:bg-[#671116] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-[#F3D99A]" />
            <span className="hidden sm:inline">{t('cart')}</span>
            {totalCount > 0 && (
              <span className="bg-[#CBA24B] text-[#38080B] text-[11px] font-bold px-1.5 py-0.5 rounded-full tabular-nums">
                {totalCount}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-700 hover:text-[#7D151B] hover:bg-[#F6F0E6] rounded-lg transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EDE5D5] bg-[#FFFDF9] px-4 py-4 space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#FAF1F1] rounded-xl border border-[#7D151B]/15">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#7D151B]" />
              <span className="text-xs font-medium text-stone-700">Seated at:</span>
              <span className="text-xs font-bold text-[#7D151B]">Table #{tableNumber}</span>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openQRModal();
              }}
              className="text-[11px] font-semibold text-[#7D151B] underline"
            >
              Switch Table
            </button>
          </div>

          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-[#F6F0E6]"
            >
              {t('home')}
            </Link>
            <Link
              to="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-[#F6F0E6]"
            >
              {t('view_menu')}
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-[#F6F0E6]"
            >
              <span>{t('cart')}</span>
              {totalCount > 0 && (
                <span className="bg-[#7D151B] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalCount} items (₹{grandTotal})
                </span>
              )}
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-bold text-[#7D151B] bg-[#FAF1F1] hover:bg-[#FAF1F1]/80 border border-[#7D151B]/20"
            >
              Staff Portal & Live Orders
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
