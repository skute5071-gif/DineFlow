import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { RESTAURANT_CONFIG } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';
import { Clock, MapPin, Phone, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-b from-[#4E0D11] to-[#38080B] text-white pt-16 pb-24 md:pb-12 border-t border-[#7D151B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Logo */}
          <div className="md:col-span-1 space-y-4">
            <Logo size="md" variant="light" showText={true} />
            <p className="text-xs text-[#EDE5D5]/80 leading-relaxed">
              Serving the authentic heritage of royal Indian pure vegetarian cuisine. Every preparation is crafted with organic spices, fresh daily dairy, and sacred purity.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#E2BF6F] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              <span className="font-semibold">100% Shuddh Shakahari</span>
            </div>
          </div>

          {/* Col 2: Timings & Hospitality */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base text-[#F3D99A] tracking-wider uppercase">
              Dining Hours
            </h4>
            <div className="space-y-2.5 text-xs text-white/80">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#E2BF6F] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Open Everyday</p>
                  <p className="text-white/70">{RESTAURANT_CONFIG.timings}</p>
                  <p className="text-[11px] text-[#E2BF6F] mt-0.5">Lunch & Royal Dinner Service</p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Address & Contact */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base text-[#F3D99A] tracking-wider uppercase">
              Royal Location
            </h4>
            <div className="space-y-2.5 text-xs text-white/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E2BF6F] shrink-0 mt-0.5" />
                <p className="leading-relaxed">{RESTAURANT_CONFIG.address}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E2BF6F] shrink-0" />
                <p>{RESTAURANT_CONFIG.phone}</p>
              </div>
            </div>
          </div>

          {/* Col 4: Quick Navigation & DineFlow */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base text-[#F3D99A] tracking-wider uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <Link to="/" className="hover:text-[#F3D99A] transition-colors">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-[#F3D99A] transition-colors">
                  {t('view_menu')}
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#F3D99A] transition-colors">
                  {t('cart')}
                </Link>
              </li>
              <li>
                <a href="#why-us" className="hover:text-[#F3D99A] transition-colors">
                  Pure Veg Commitment
                </a>
              </li>
              <li className="pt-2 border-t border-white/10">
                <Link to="/staff/login" className="text-[#F3D99A] font-bold hover:underline flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Staff & Owner Portal</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-3">
          <p>© {new Date().getFullYear()} {RESTAURANT_CONFIG.name}. {t('all_rights')}</p>
          <div className="flex items-center gap-2 text-stone-300">
            <span>Powered by</span>
            <span className="font-bold text-[#E2BF6F] tracking-wide">DineFlow</span>
            <span>· QR Table Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
