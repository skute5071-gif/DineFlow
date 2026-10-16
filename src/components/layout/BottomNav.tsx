import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export const BottomNav: React.FC = () => {
  const { totalCount, grandTotal } = useCart();
  const { t } = useLanguage();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#EDE5D5] shadow-lg px-6 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors py-1 px-3 ${
              isActive ? 'text-[#7D151B]' : 'text-stone-500 hover:text-stone-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Home className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[11px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {t('home')}
              </span>
            </>
          )}
        </NavLink>

        {/* Menu */}
        <NavLink
          to="/menu"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors py-1 px-3 ${
              isActive ? 'text-[#7D151B]' : 'text-stone-500 hover:text-stone-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <UtensilsCrossed className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[11px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {t('menu')}
              </span>
            </>
          )}
        </NavLink>

        {/* Cart */}
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors py-1 px-3 relative ${
              isActive ? 'text-[#7D151B]' : 'text-stone-500 hover:text-stone-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <ShoppingBag className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                {totalCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#7D151B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalCount}
                  </span>
                )}
              </div>
              <span className={`text-[11px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {t('cart')}
              </span>
            </>
          )}
        </NavLink>
      </div>
    </div>
  );
};
