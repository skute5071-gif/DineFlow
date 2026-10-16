import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTable } from '../context/TableContext';
import { useLanguage } from '../context/LanguageContext';
import { MENU_ITEMS, RESTAURANT_CONFIG } from '../data/mockData';
import { DishCard } from '../components/dish/DishCard';
import { VegBadge } from '../components/common/VegBadge';
import { Logo, ExactMaharajaLogo } from '../components/common/Logo';
import { QrCode, ArrowRight, Sparkles, ShieldCheck, Users, Zap, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import heroThaliImg from '../assets/images/hero_maharaja_thali_1791012977761.jpg';

export const HomePage: React.FC = () => {
  const { tableNumber, hasDetectedTable, openQRModal, areaName } = useTable();
  const { language, t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<'bestsellers' | 'starters' | 'mains' | 'maharashtrian'>('bestsellers');

  // Filtered dishes for featured section
  const featuredDishes = MENU_ITEMS.filter(dish => {
    if (activeFilter === 'bestsellers') return dish.isBestseller;
    if (activeFilter === 'starters') return dish.category === 'starter_course' || dish.category === 'special_starter';
    if (activeFilter === 'mains') return dish.category === 'paneer_special' || dish.category === 'veg_special_bhaji' || dish.category === 'aapki_pasandi_dal';
    if (activeFilter === 'maharashtrian') return dish.category === 'maharashtrian_special';
    return true;
  }).slice(0, 6);

  const tagline =
    language === 'mr'
      ? RESTAURANT_CONFIG.marathiTagline
      : RESTAURANT_CONFIG.tagline;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 bg-radial-[at_top_left] from-[#FFFDF9] via-[#FAF1F1]/50 to-[#F6F0E6]/60 border-b border-[#EDE5D5]">
        {/* Subtle royal background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#CBA24B]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#7D151B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Pure Veg & Seated Table Pill */}
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs">
                <div className="bg-[#15803D]/10 border border-[#15803D]/25 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[#15803D] font-semibold">
                  <VegBadge size="sm" />
                  <span>100% Pure Vegetarian</span>
                </div>
                <button
                  onClick={openQRModal}
                  className="bg-[#7D151B]/10 hover:bg-[#7D151B]/15 border border-[#7D151B]/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[#7D151B] font-semibold transition-colors cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#7D151B]" />
                  <span>
                    {hasDetectedTable && tableNumber
                      ? `${t('seated_at')} ${tableNumber}`
                      : t('demo_mode')}
                  </span>
                  <span className="text-[10px] text-stone-500 underline ml-0.5">{t('change')}</span>
                </button>
              </div>

              {/* Restaurant Logo and Name - Compulsory on First Page */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                  <ExactMaharajaLogo size="lg" className="shrink-0 drop-shadow-lg" />
                  <div className="flex flex-col">
                    <span className="font-cinzel font-black text-xs sm:text-sm tracking-[0.25em] text-[#CBA24B]">
                      HOTEL
                    </span>
                    <h1 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-[#5E0F14] tracking-tight leading-tight mt-0.5">
                      VEG MAHARAJA
                    </h1>
                    <div className="inline-flex items-center gap-2 bg-[#D9531E] text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-md shadow-xs mt-2 w-fit mx-auto sm:mx-0">
                      <span>शुध्द शाकाहारी</span>
                      <span className="text-amber-200">✽</span>
                      <span>फॅमिली रेस्टॉरंट</span>
                    </div>
                  </div>
                </div>

                <p className="font-serif italic text-base sm:text-xl text-[#AA8232] font-semibold">
                  "{tagline}"
                </p>
                <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
                  Welcome to Hotel Veg Maharaja! Experience authentic pure vegetarian gastronomy prepared in traditional style with pure desi ghee. Browse our digital menu, customize to your taste, and order straight to your table.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/menu"
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#7D151B] hover:bg-[#671116] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{t('view_menu')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  onClick={openQRModal}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#F6F0E6] text-[#7D151B] border border-[#7D151B]/30 text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-[#7D151B]" />
                  <span>{t('order_from_table')} #{tableNumber}</span>
                </button>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-4 grid grid-cols-3 gap-2 sm:gap-4 border-t border-[#EDE5D5]/80 text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                  <span className="text-xs text-stone-700 font-medium">Zero Meat Policy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                  <span className="text-xs text-stone-700 font-medium">Jain Food Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                  <span className="text-xs text-stone-700 font-medium">Fast Kitchen KOT</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative golden border ring */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-[#CBA24B] via-[#7D151B] to-[#AA8232] rounded-3xl opacity-20 blur-sm transform rotate-1" />

                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-stone-900">
                  <img
                    src={heroThaliImg}
                    alt="Grand Maharaja Pure Vegetarian Feast"
                    className="w-full aspect-4/3 object-cover hover:scale-103 transition-transform duration-700 ease-out"
                  />

                  {/* Scrim overlay with royal thali info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-5 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold tracking-widest text-[#E2BF6F]">
                        Royal Specialty
                      </span>
                      <div className="flex items-center gap-1 bg-[#15803D] text-white text-[11px] font-bold px-2 py-0.5 rounded">
                        <VegBadge size="sm" />
                        <span>Pure Veg</span>
                      </div>
                    </div>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl mt-1 text-white">
                      Grand Maharaja Royal Thali
                    </h3>
                    <p className="text-xs text-white/80 mt-1 line-clamp-2">
                      An imperial banquet of paneer makhani, dal tadka, saffron biryani, fresh breads, and warm gulab jamun.
                    </p>
                  </div>
                </div>

                {/* Floating badge for QR instant ordering */}
                <div className="absolute -bottom-5 -left-4 sm:-bottom-6 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-[#EDE5D5] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7D151B] text-white flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5 text-[#E2BF6F]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                      DineFlow Tech
                    </span>
                    <p className="text-xs font-bold text-stone-900">Instant Table KOT</p>
                    <p className="text-[10px] text-[#15803D] font-medium">Ready in ~15 mins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authentic Restaurant Logo Showcase - First Page Compulsory Branding */}
      <section className="bg-[#FAF1F1]/80 py-12 border-b border-[#EDE5D5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#7D151B] uppercase block mb-1">
            Official Restaurant Identity
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-stone-900 mb-6">
            HOTEL VEG MAHARAJA
          </h2>
          
          <div className="bg-[#38080B] p-6 sm:p-8 rounded-3xl border-2 border-[#7D151B] shadow-2xl flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 max-w-2xl mx-auto">
            <ExactMaharajaLogo size="badge" className="drop-shadow-2xl" />
            <div className="text-center md:text-left text-white space-y-2">
              <span className="font-cinzel font-black text-base tracking-[0.25em] text-[#F5C443] block">
                HOTEL
              </span>
              <h3 className="font-serif font-black text-2xl sm:text-3xl text-white tracking-wide">
                VEG MAHARAJA
              </h3>
              <div className="inline-block bg-[#D9531E] text-white text-xs font-bold px-3 py-1.5 rounded-md mt-1 shadow-xs">
                शुध्द शाकाहारी ✽ फॅमिली रेस्टॉरंट
              </div>
              <p className="text-xs text-stone-300 max-w-xs pt-1 leading-relaxed">
                Authentic pure vegetarian restaurant logo preserved exactly as provided, featuring the traditional golden royal scroll with Marathi "हॉटेल", royal Maharaja medallion, and "व्हेज महाराजा".
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Choose Us Section (3 attractive cards) */}
      <section id="why-us" className="py-16 sm:py-20 bg-[#FFFDF9] border-b border-[#EDE5D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#7D151B]">
              The Veg Maharaja Heritage
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#4E0D11] mt-2">
              {t('why_choose_us')}
            </h2>
            <div className="w-16 h-1 bg-[#CBA24B] mx-auto mt-3 rounded-full" />
            <p className="text-sm text-stone-600 mt-3">
              Founded on the values of purity, royal family hospitality, and seamless dining convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Pure Vegetarian */}
            <div className="group relative bg-[#FDFBF7] hover:bg-white rounded-2xl p-8 border border-[#EDE5D5] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#15803D]/10 border border-[#15803D]/20 flex items-center justify-center text-[#15803D] group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-xl text-stone-900 group-hover:text-[#7D151B] transition-colors">
                    {t('pure_veg_title')}
                  </h3>
                  <VegBadge size="sm" />
                </div>
                <p className="text-sm text-stone-600 leading-relaxed font-sans">
                  {t('pure_veg_desc')} We adhere to complete culinary purity with separate cooking sections for Jain specialties without onion or garlic.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#EDE5D5]/80 flex items-center text-xs font-semibold text-[#15803D]">
                <span>100% Shuddh Shakahari Certified</span>
              </div>
            </div>

            {/* Card 2: Family Restaurant */}
            <div className="group relative bg-[#FDFBF7] hover:bg-white rounded-2xl p-8 border border-[#EDE5D5] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#7D151B]/10 border border-[#7D151B]/20 flex items-center justify-center text-[#7D151B] group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="font-serif font-bold text-xl text-stone-900 group-hover:text-[#7D151B] transition-colors">
                  {t('family_title')}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed font-sans">
                  {t('family_desc')} Spacious air-conditioned halls, comfortable booths, and attentive staff make every family celebration and weekend gathering memorable.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#EDE5D5]/80 flex items-center text-xs font-semibold text-[#AA8232]">
                <span>Welcoming Generations Since 1998</span>
              </div>
            </div>

            {/* Card 3: Quick QR Ordering */}
            <div className="group relative bg-[#FDFBF7] hover:bg-white rounded-2xl p-8 border border-[#EDE5D5] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#CBA24B]/15 border border-[#CBA24B]/30 flex items-center justify-center text-[#AA8232] group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-[#7D151B]" />
                </div>
                <h3 className="font-serif font-bold text-xl text-stone-900 group-hover:text-[#7D151B] transition-colors">
                  {t('qr_title')}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed font-sans">
                  {t('qr_desc')} No need to wave for menus or waiters. Customize spice levels, add orders continuously, and inspect live billing on your personal phone screen.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#EDE5D5]/80 flex items-center justify-between text-xs font-semibold text-[#7D151B]">
                <span>Contactless Table Dining</span>
                <span className="font-bold">Table #{tableNumber} Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Food Section */}
      <section className="py-16 sm:py-20 bg-[#FDFBF7] border-b border-[#EDE5D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#7D151B]">
                Culinary Masterpieces
              </span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#4E0D11] mt-1">
                {t('featured_delicacies')}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-2">
                {t('featured_subtitle')}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F6F0E6] rounded-xl overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveFilter('bestsellers')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilter === 'bestsellers'
                    ? 'bg-[#7D151B] text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                Royal Bestsellers
              </button>
              <button
                onClick={() => setActiveFilter('starters')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilter === 'starters'
                    ? 'bg-[#7D151B] text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                Starters & Tikkas
              </button>
              <button
                onClick={() => setActiveFilter('mains')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilter === 'mains'
                    ? 'bg-[#7D151B] text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                Curries & Mains
              </button>
              <button
                onClick={() => setActiveFilter('maharashtrian')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilter === 'maharashtrian'
                    ? 'bg-[#7D151B] text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                Maharashtrian Special
              </button>
            </div>
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredDishes.map(dish => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>

          {/* View Full Menu CTA */}
          <div className="mt-12 text-center">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white border border-[#7D151B]/30 hover:border-[#7D151B] text-[#7D151B] font-bold text-sm shadow-xs hover:shadow-md transition-all group"
            >
              <span>Explore All {MENU_ITEMS.length}+ Dishes on Menu</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Call-To-Action Section for Ordering */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#671116] via-[#7D151B] to-[#4E0D11] text-white relative overflow-hidden">
        {/* Background decorative arches */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-[#CBA24B]/20 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full border border-[#CBA24B]/20 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#CBA24B]/20 border border-[#CBA24B]/40 text-[#F3D99A] text-xs font-semibold px-4 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital QR Table Ordering · Hotel Veg Maharaja</span>
          </div>

          <h2 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            {t('order_now_cta_title')}
          </h2>

          <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed font-sans">
            {t('order_now_cta_sub')} Whether you want sizzling starters, rich royal curries, or cooling kesar mango lassi, your dishes are delivered piping hot to your table.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/menu"
              className="w-full sm:w-auto px-8 py-4 bg-[#CBA24B] hover:bg-[#AA8232] text-[#38080B] text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{t('view_menu')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={openQRModal}
              className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#F3D99A]" />
              <span>Verify / Change Table ({tableNumber})</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
