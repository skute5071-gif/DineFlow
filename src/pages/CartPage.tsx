import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTable } from '../context/TableContext';
import { useLanguage } from '../context/LanguageContext';
import { VegBadge } from '../components/common/VegBadge';
import { ExactMaharajaLogo } from '../components/common/Logo';
import { TableIndicator } from '../components/common/TableIndicator';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, QrCode, Utensils, MessageSquare, ShieldCheck } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart, subtotal, tax, grandTotal, totalCount } = useCart();
  const { tableNumber, hasDetectedTable, areaName, openQRModal } = useTable();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [instructions, setInstructions] = useState(() => {
    return localStorage.getItem('hvm_instructions') || '';
  });

  const handleInstructionsChange = (val: string) => {
    setInstructions(val);
    localStorage.setItem('hvm_instructions', val);
  };

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-[#FDFBF7]">
        <div className="w-20 h-20 rounded-full bg-[#FAF1F1] border border-[#7D151B]/20 flex items-center justify-center text-[#7D151B] mb-5 shadow-xs">
          <Utensils className="w-10 h-10" />
        </div>
        <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#4E0D11]">
          {t('empty_cart')}
        </h2>
        <p className="text-sm text-stone-600 mt-2 max-w-sm">
          {t('empty_cart_msg')}
        </p>

        <div className="mt-4 p-3 bg-[#F6F0E6] rounded-xl text-xs text-stone-700 flex items-center gap-2">
          <QrCode className="w-4 h-4 text-[#7D151B]" />
          <span>
            {hasDetectedTable && tableNumber
              ? `${t('seated_at')} ${tableNumber}`
              : t('demo_mode')}
          </span>
        </div>

        <Link
          to="/menu"
          className="mt-6 px-7 py-3.5 bg-[#7D151B] hover:bg-[#671116] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>{t('explore_menu')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 pb-32 md:pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#7D151B] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back_to_menu')}</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Table Indicator */}
            <TableIndicator size="sm" />

            {/* Bilingual Selector */}
            <LanguageSelector />

            {/* Clear Cart Button */}
            <button
              onClick={clearCart}
              className="text-xs text-stone-500 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
              title={t('clear_cart')}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('clear_cart')}</span>
            </button>
          </div>
        </div>

        {/* Page Title & Table Banner */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDE5D5] shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <ExactMaharajaLogo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#7D151B]">
                  HOTEL VEG MAHARAJA
                </span>
                <VegBadge size="sm" />
              </div>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-stone-900 mt-0.5">
                {t('cart')} ({totalCount} {t('items')})
              </h1>
            </div>
          </div>

          {/* Table Details */}
          <div className="flex items-center gap-3 bg-[#FAF1F1] p-3 rounded-xl border border-[#7D151B]/20">
            <div className="w-9 h-9 rounded-lg bg-[#7D151B] text-white flex items-center justify-center font-bold text-sm">
              {tableNumber || '—'}
            </div>
            <div className="text-xs">
              <p className="font-bold text-stone-900">
                {hasDetectedTable && tableNumber ? `${t('table')} ${tableNumber}` : t('demo_mode')}
              </p>
              <p className="text-stone-500 text-[11px]">{areaName}</p>
            </div>
            <button
              onClick={openQRModal}
              className="ml-auto text-xs text-[#7D151B] font-bold hover:underline cursor-pointer"
            >
              {t('change')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            {items.map(item => (
              <div
                key={item.dish.id}
                className="bg-white rounded-2xl border border-[#EDE5D5] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center gap-4 transition-all"
              >
                {/* 1. Food Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[#F6F0E6] overflow-hidden shrink-0 relative border border-[#EDE5D5]">
                  <img
                    src={item.dish.image}
                    alt={item.dish.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 bg-white/95 rounded p-0.5 shadow-xs">
                    <VegBadge size="sm" />
                  </div>
                </div>

                {/* Info Container */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    {/* 2. Food Name & Remove Button */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {/* Food name remains recognizable from the menu */}
                        <h3 className="font-serif font-bold text-stone-900 text-base leading-snug">
                          {item.dish.name}
                        </h3>
                        {item.dish.categoryLabel && (
                          <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                            {item.dish.categoryLabel}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => removeItem(item.dish.id)}
                        className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                        title={t('remove')}
                        aria-label={t('remove')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 3. Price */}
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-stone-500">{t('price')}:</span>
                      <span className="font-bold text-[#7D151B] tabular-nums">
                        ₹{item.dish.price}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Item Subtotal Row */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#EDE5D5]/70">
                    {/* Quantity + Increase Button + Decrease Button */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500 font-medium">{t('quantity')}:</span>
                      <div className="flex items-center bg-[#F6F0E6] border border-[#EDE5D5] rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-stone-700 hover:bg-white rounded transition-colors cursor-pointer"
                          aria-label={t('decrease')}
                          title={t('decrease')}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-xs text-stone-900 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-stone-700 hover:bg-white rounded transition-colors cursor-pointer"
                          aria-label={t('increase')}
                          title={t('increase')}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Item Subtotal */}
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block uppercase font-semibold">
                        {t('item_subtotal')}
                      </span>
                      <span className="font-serif font-black text-base text-stone-900 tabular-nums">
                        ₹{item.dish.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Special Instructions Box */}
            <div className="bg-white rounded-2xl border border-[#EDE5D5] p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-700 mb-2">
                <MessageSquare className="w-4 h-4 text-[#7D151B]" />
                <span>{t('cooking_instructions')}</span>
              </div>
              <textarea
                value={instructions}
                onChange={e => handleInstructionsChange(e.target.value)}
                placeholder={t('instructions_placeholder')}
                rows={2}
                className="w-full p-3 text-xs bg-[#FDFBF7] border border-[#EDE5D5] rounded-xl focus:outline-none focus:border-[#7D151B]"
              />
            </div>
          </div>

          {/* Right Column: Order & Bill Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-[#EDE5D5] p-5 sm:p-6 shadow-xs space-y-5">
              <div className="pb-3 border-b border-[#EDE5D5] flex items-center justify-between">
                <h2 className="font-serif font-bold text-lg text-stone-900">
                  {t('bill_summary')}
                </h2>
                <span className="text-xs text-stone-500 font-semibold">
                  {totalCount} {t('items')}
                </span>
              </div>

              {/* Subtotal & Taxes Breakdown */}
              <div className="space-y-3 text-xs text-stone-600">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="font-medium text-stone-700">{t('subtotal')}</span>
                  <span className="font-bold text-stone-900 text-sm tabular-nums">
                    ₹{subtotal}
                  </span>
                </div>

                <div className="flex justify-between items-center text-stone-500">
                  <span>{t('gst')}</span>
                  <span className="tabular-nums">₹{tax}</span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-stone-500">
                  <span>{t('table_service')}</span>
                  <span className="text-[#15803D] font-bold">{t('free')}</span>
                </div>
              </div>

              {/* Total Amount */}
              <div className="pt-4 border-t border-[#EDE5D5] flex justify-between items-baseline">
                <div>
                  <span className="font-serif font-black text-lg text-stone-900">
                    {t('total_amount')}
                  </span>
                  <span className="block text-[11px] text-stone-500">
                    {t('all_taxes_included')}
                  </span>
                </div>
                <span className="font-serif font-black text-2xl text-[#7D151B] tabular-nums">
                  ₹{grandTotal}
                </span>
              </div>

              {/* "Proceed to Checkout" Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-[#7D151B] hover:bg-[#671116] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>{t('proceed_to_checkout')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-stone-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                <span>{t('pure_veg')} · HOTEL VEG MAHARAJA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
