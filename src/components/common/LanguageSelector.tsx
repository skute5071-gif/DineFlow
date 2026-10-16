import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'pill' | 'inline' | 'compact';
}

/**
 * Dedicated Bilingual Language Selector: English | मराठी
 * Clearly toggles between English and Marathi across mobile and desktop.
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  variant = 'pill',
}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-xl bg-white border border-[#EDE5D5] p-0.5 shadow-2xs text-xs font-bold transition-all ${className}`}
      role="group"
      aria-label="Language Selector"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-[#7D151B] text-white shadow-2xs font-extrabold'
            : 'text-stone-600 hover:text-stone-900 hover:bg-[#F6F0E6]'
        }`}
        title="Switch to English"
      >
        English
      </button>

      <span className="text-stone-300 select-none px-0.5 font-light">|</span>

      <button
        type="button"
        onClick={() => setLanguage('mr')}
        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
          language === 'mr'
            ? 'bg-[#7D151B] text-white shadow-2xs font-extrabold'
            : 'text-stone-600 hover:text-stone-900 hover:bg-[#F6F0E6]'
        }`}
        title="मराठी भाषेमध्ये बदला"
      >
        मराठी
      </button>
    </div>
  );
};
