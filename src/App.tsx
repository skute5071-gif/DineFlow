import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { TableProvider } from './context/TableContext';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { BottomNav } from './components/layout/BottomNav';
import { TableSelectorModal } from './components/table/TableSelectorModal';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { StaffLoginPage } from './pages/StaffLoginPage';
import { Check, ShoppingBag } from 'lucide-react';

const CartNotificationToast: React.FC = () => {
  const { lastAddedItem } = useCart();
  const { t } = useLanguage();
  if (!lastAddedItem) return null;

  return (
    <div className="fixed top-20 right-4 z-50 bg-[#38080B] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#CBA24B]/50 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 max-w-sm">
      <div className="w-8 h-8 rounded-full bg-[#15803D] text-white flex items-center justify-center shrink-0">
        <Check className="w-4 h-4" />
      </div>
      <div className="text-xs">
        <p className="font-bold text-[#F3D99A] leading-tight">{t('added')}</p>
        <p className="text-stone-200 truncate font-medium">{lastAddedItem.name}</p>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <TableProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#241A18]">
              {/* Header */}
              <Header />

              {/* Toast for cart feedback */}
              <CartNotificationToast />

              {/* Main content route views */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/staff/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/staff/login" element={<StaffLoginPage />} />
                  <Route path="/login" element={<StaffLoginPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Footer */}
              <Footer />

              {/* Mobile bottom navigation (Home, Menu, Cart) */}
              <BottomNav />

              {/* Global Table & QR Code modal */}
              <TableSelectorModal />
            </div>
          </BrowserRouter>
        </CartProvider>
      </TableProvider>
    </LanguageProvider>
  );
}
