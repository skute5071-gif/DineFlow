import React, { useState } from 'react';
import { Dish } from '../../types';
import { VegBadge } from '../common/VegBadge';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Minus, Star, Flame, Clock } from 'lucide-react';

interface DishCardProps {
  dish: Dish;
  onOpenDetails?: (dish: Dish) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ dish, onOpenDetails }) => {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const { language, t } = useLanguage();
  const [imgError, setImgError] = useState(false);

  const quantity = getItemQuantity(dish.id);

  const displayName = dish.name;

  return (
    <div className="group bg-white rounded-2xl border border-[#EDE5D5] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image container */}
      <div className="relative aspect-4/3 w-full bg-[#F6F0E6] overflow-hidden">
        {!imgError ? (
          <img
            src={dish.image}
            alt={dish.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#7D151B]/10 to-[#CBA24B]/10 p-4 text-center">
            <span className="font-serif font-bold text-stone-700 text-sm">{dish.name}</span>
            <span className="text-[11px] text-stone-500 mt-1">Pure Vegetarian Specialty</span>
          </div>
        )}

        {/* Veg Badge on Image */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-md shadow-xs flex items-center gap-1.5">
          <VegBadge size="sm" />
          <span className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">Veg</span>
        </div>

        {/* Chef Special or Bestseller subtle tag */}
        {dish.isChefSpecial ? (
          <div className="absolute top-3 right-3 bg-[#7D151B] text-[#FFFDF9] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-xs">
            Chef Special
          </div>
        ) : dish.isBestseller ? (
          <div className="absolute top-3 right-3 bg-[#CBA24B] text-[#38080B] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-xs">
            Bestseller
          </div>
        ) : null}

        {/* Preparation time badge */}
        <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#E2BF6F]" />
          <span>{dish.prepTime}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating and dietary notes */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            {/* Rating Display: ⭐ 4.5/5 */}
            <div
              className="inline-flex items-center gap-1 bg-[#FAF1F1] border border-[#EDE5D5] px-2 py-0.5 rounded-md shadow-2xs"
              title={`Rating: ${(dish.rating ?? 4.5).toFixed(1)}/5`}
              aria-label={`Rating ${(dish.rating ?? 4.5).toFixed(1)} out of 5`}
            >
              <Star className="w-3.5 h-3.5 fill-[#CBA24B] text-[#CBA24B] shrink-0" />
              <span className="font-bold text-xs text-stone-800 tabular-nums">
                {(dish.rating ?? 4.5).toFixed(1)}/5
              </span>
            </div>

            <div className="flex items-center gap-2">
              {dish.spiceLevel && (
                <div className="flex items-center" title={`Spice: ${dish.spiceLevel}/3`}>
                  {Array.from({ length: dish.spiceLevel }).map((_, i) => (
                    <Flame key={i} className="w-3 h-3 fill-[#961D24] text-[#961D24]" />
                  ))}
                </div>
              )}
              {dish.isJainAvailable && (
                <span className="text-[10px] font-semibold text-[#15803D] bg-[#15803D]/10 px-1.5 py-0.5 rounded">
                  Jain
                </span>
              )}
            </div>
          </div>

          {/* Dish Name */}
          <h3 className="font-serif font-bold text-stone-900 text-base group-hover:text-[#7D151B] transition-colors line-clamp-1">
            {displayName}
          </h3>

          {/* Secondary name if different */}
          {language !== 'en' && (
            <p className="text-[11px] text-stone-500 font-sans line-clamp-1">{dish.name}</p>
          )}

          {/* Description */}
          <p className="text-xs text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
            {dish.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-[#EDE5D5]/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Price</span>
            <div className="text-base font-bold text-[#7D151B] tabular-nums">
              ₹{dish.price}
            </div>
          </div>

          {/* Add / Stepper Button */}
          {quantity === 0 ? (
            <button
              onClick={() => addItem(dish, 1)}
              className="px-3.5 py-2 bg-[#7D151B] hover:bg-[#671116] active:scale-95 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('add_to_cart')}</span>
            </button>
          ) : (
            <div className="flex items-center bg-[#FAF1F1] border border-[#7D151B]/30 rounded-lg p-0.5">
              <button
                onClick={() => updateQuantity(dish.id, quantity - 1)}
                className="w-7 h-7 flex items-center justify-center text-[#7D151B] hover:bg-[#7D151B]/10 rounded transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center font-bold text-xs text-[#7D151B] tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(dish.id, quantity + 1)}
                className="w-7 h-7 flex items-center justify-center text-[#7D151B] hover:bg-[#7D151B]/10 rounded transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
