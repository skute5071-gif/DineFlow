import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations.en | string) => string;
}

/**
 * Centralized Translation Structure for Bilingual Support (English & Marathi)
 * All UI terms are translated using natural, authentic Marathi suitable for restaurant diners.
 * Food item names remain readable and recognizable without unnecessary awkward translations.
 */
export const translations = {
  en: {
    home: 'Home',
    menu: 'Menu',
    search: 'Search food...',
    search_placeholder: 'Search food by name (e.g. Paneer, Dal, Dosa, Roti)...',
    cart: 'Cart',
    add_to_cart: 'Add to Cart',
    view_menu: 'View Menu',
    checkout: 'Checkout',
    proceed_to_checkout: 'Proceed to Checkout',
    payment: 'Payment',
    pay_now: 'Pay Now',
    order_confirmation: 'Order Confirmation',
    table: 'Table',
    quantity: 'Quantity',
    qty: 'Qty',
    total: 'Total',
    subtotal: 'Subtotal',
    item_subtotal: 'Item Subtotal',
    total_amount: 'Total Amount',
    remove: 'Remove',
    increase: 'Increase',
    decrease: 'Decrease',
    customer_name: 'Customer Name',
    mobile_number: 'Mobile Number',
    order_id: 'Order ID',
    order_successfully_placed: 'Order Successfully Placed',
    payment_successful: 'Payment Successful',
    restaurant_name: 'HOTEL VEG MAHARAJA',
    pure_veg_tag: '100% Shuddh Shakahari · Pure Desi Ghee & Fresh Dairy',
    seated_at: 'Seated at Table',
    change_table: 'Change Table / Scan QR',
    scan_qr: 'Scan QR Code',
    empty_cart: 'Your cart is empty',
    empty_cart_msg: 'Browse our pure vegetarian digital menu and add delicious royal dishes to your order!',
    explore_menu: 'Explore Digital Menu',
    clear_cart: 'Clear Cart',
    back_to_menu: 'Back to Menu',
    return_to_cart: 'Return to Cart',
    cooking_instructions: 'Special Cooking Instructions (Optional)',
    instructions_placeholder: 'e.g. Please make gravy medium spicy, less butter, or extra lemon & onions.',
    optional: 'Optional',
    guest_info_title: 'Guest Information (Optional)',
    guest_info_sub: 'Instant guest checkout. No password, login, or registration required.',
    bill_summary: 'Bill Summary',
    gst: 'GST (5%)',
    table_service: 'Table Dining Service',
    free: 'FREE',
    items: 'items',
    item: 'item',
    price: 'Price',
    all_items: 'All Items',
    jain_friendly: 'Jain Friendly',
    reset_all: 'Reset All',
    no_dishes_found: 'No food items found',
    view_all_dishes: 'View All Dishes',
    view_category: 'View Category',
    view_thali: 'View Thali',
    date_time: 'Date & Time',
    ordered_items: 'Ordered Items',
    return_to_menu_cta: 'Return to Menu / Add More Items',
    sent_to_kitchen: 'Sent to Kitchen',
    paid_via: 'Paid via',
    demo_mode: 'Demo Mode',
    pure_veg: 'Pure Vegetarian',
    step_review: 'Step 2 of 2 · Final Review',
    all_taxes_included: 'Inclusive of 5% GST',
    secured_by_razorpay: 'Secured by Razorpay Payment Gateway',
    change: 'Change',
    order_confirmed_msg: 'Your order is placed directly with the kitchen for your table.',
  },
  mr: {
    home: 'मुख्यपृष्ठ',
    menu: 'मेनू',
    search: 'पदार्थ शोधा...',
    search_placeholder: 'पदार्थ नावाने शोधा (उदा. पनीर, डाळ, रोटी)...',
    cart: 'कार्ट',
    add_to_cart: 'कार्टमध्ये जोडा',
    view_menu: 'मेनू पहा',
    checkout: 'चेकआउट',
    proceed_to_checkout: 'चेकआउट करा',
    payment: 'पेमेंट',
    pay_now: 'आता भरा',
    order_confirmation: 'ऑर्डर पुष्टीकरण',
    table: 'टेबल',
    quantity: 'प्रमाण',
    qty: 'नग',
    total: 'एकूण',
    subtotal: 'उपएकूण',
    item_subtotal: 'पदार्थाचे उपएकूण',
    total_amount: 'एकूण देय रक्कम',
    remove: 'काढून टाका',
    increase: 'वाढवा',
    decrease: 'कमी करा',
    customer_name: 'ग्राहकाचे नाव',
    mobile_number: 'मोबाईल नंबर',
    order_id: 'ऑर्डर आयडी',
    order_successfully_placed: 'ऑर्डर यशस्वीरित्या नोंदवली गेली!',
    payment_successful: 'पेमेंट यशस्वी!',
    restaurant_name: 'हॉटेल व्हेज महाराजा',
    pure_veg_tag: '१००% शुद्ध शाकाहारी · अस्सल साजूक तूप आणि ताजे दुग्धजन्य पदार्थ',
    seated_at: 'टेबल क्र.',
    change_table: 'टेबल बदला / QR स्कॅन',
    scan_qr: 'QR कोड स्कॅन',
    empty_cart: 'आपली थाळी रिकामी आहे',
    empty_cart_msg: 'आपल्या शुद्ध शाकाहारी डिजिटल मेनूमधून स्वादिष्ट पदार्थ निवडा आणि ऑर्डर करा!',
    explore_menu: 'डिजिटल मेनू पहा',
    clear_cart: 'कार्ट रिकामे करा',
    back_to_menu: 'मेनूकडे परत जा',
    return_to_cart: 'कार्टकडे परत जा',
    cooking_instructions: 'विशेष स्वयंपाक सूचना (ऐच्छिक)',
    instructions_placeholder: 'उदा. कमी तिखट करा, साजूक तूप कमी वापरा किंवा लिंबू कांदा द्या.',
    optional: 'ऐच्छिक',
    guest_info_title: 'ग्राहक माहिती (ऐच्छिक)',
    guest_info_sub: 'झटपट पाहुणे चेकआउट. लॉगिन किंवा पासवर्डची मुळीच गरज नाही.',
    bill_summary: 'बिलाचा तपशील',
    gst: 'जीएसटी (५%)',
    table_service: 'टेबल सेवा शुल्क',
    free: 'मोफत',
    items: 'पदार्थ',
    item: 'पदार्थ',
    price: 'किंमत',
    all_items: 'सर्व पदार्थ',
    jain_friendly: 'जैन पर्याय',
    reset_all: 'सर्व रीसेट करा',
    no_dishes_found: 'कोणताही पदार्थ आढळला नाही',
    view_all_dishes: 'सर्व पदार्थ पहा',
    view_category: 'कॅटेगरी पहा',
    view_thali: 'थाळी पहा',
    date_time: 'तारीख आणि वेळ',
    ordered_items: 'ऑर्डर केलेले पदार्थ',
    return_to_menu_cta: 'मेनूकडे परत जा / आणखी पदार्थ जोडा',
    sent_to_kitchen: 'किचनला पाठवले',
    paid_via: 'द्वारे भरले',
    demo_mode: 'डेमो मोड',
    pure_veg: 'शुद्ध शाकाहारी',
    step_review: 'शेवटचे पुनरावलोकन',
    all_taxes_included: '५% जीएसटीसह सर्व कर समाविष्ट',
    secured_by_razorpay: 'रेझरपे (Razorpay) पेमेंट गेटवेद्वारे सुरक्षित',
    change: 'बदला',
    order_confirmed_msg: 'आपली ऑर्डर थेट स्वयंपाकघरामध्ये पाठवली आहे.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('hvm_language') || localStorage.getItem('hvm_lang');
    return saved === 'mr' ? 'mr' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('hvm_language', lang);
    localStorage.setItem('hvm_lang', lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'mr' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: keyof typeof translations.en | string): string => {
    const langDict = translations[language] as Record<string, string>;
    const defaultDict = translations.en as Record<string, string>;
    return langDict?.[key] || defaultDict?.[key] || (key as string);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
