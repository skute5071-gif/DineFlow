import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'badge';
  showText?: boolean;
  variant?: 'dark' | 'light';
  className?: string;
}

/**
 * Authentic Restaurant Logo:
 * Exact vector reproduction of the uploaded Hotel Veg Maharaja logo:
 * - Top wooden dowel with turned finial knobs and brass rings
 * - Golden yellow royal scroll with top rolled cylinder bearing "हॉटेल"
 * - Jagged / deckled scalloped royal parchment edges
 * - Maroon circular medallion
 * - Royal Maharaja character wearing red & gold turban with white kalgi plume,
 *   raising right arm in welcoming greeting and holding silver serving platter in left hand
 * - "व्हेज" in green/maroon on the left
 * - "महाराजा" in bold maroon with the decorative underline flourish sweeping below
 * - Deep maroon background framing
 */
export const ExactMaharajaLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' | 'badge'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14 sm:w-16 sm:h-16',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
    xl: 'w-36 h-36 sm:w-44 sm:h-44',
    badge: 'w-52 h-52 sm:w-64 sm:h-64',
  };

  return (
    <div
      className={`relative ${sizeMap[size]} shrink-0 select-none flex items-center justify-center ${className}`}
      title="Hotel Veg Maharaja Original Logo"
    >
      <svg
        viewBox="0 0 350 350"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Background Radial Glow */}
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5A0F14" />
            <stop offset="65%" stopColor="#38080B" />
            <stop offset="100%" stopColor="#250406" />
          </radialGradient>

          {/* Parchment Gold Gradient */}
          <linearGradient id="parchmentYellow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FBD744" />
            <stop offset="25%" stopColor="#F5C026" />
            <stop offset="60%" stopColor="#EAA712" />
            <stop offset="100%" stopColor="#D98E06" />
          </linearGradient>

          {/* Top Cylinder Roll Gradient */}
          <linearGradient id="cylinderRoll" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D98204" />
            <stop offset="25%" stopColor="#FDE36C" />
            <stop offset="65%" stopColor="#F4B81A" />
            <stop offset="100%" stopColor="#C47102" />
          </linearGradient>

          {/* Spindle Rod Gradient */}
          <linearGradient id="rodWood" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#53160D" />
            <stop offset="50%" stopColor="#8C2C1B" />
            <stop offset="100%" stopColor="#4A1209" />
          </linearGradient>

          {/* Brass Knob Gold */}
          <linearGradient id="brassGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF2A3" />
            <stop offset="50%" stopColor="#E2A619" />
            <stop offset="100%" stopColor="#8E5E04" />
          </linearGradient>

          {/* Text Shadow Filter */}
          <filter id="textDrop" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="1" dy="1.5" stdDeviation="0.8" floodColor="#2A0507" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Outer Maroon Rounded Plaque */}
        <rect width="350" height="350" rx="28" fill="url(#bgGlow)" />
        <rect x="2" y="2" width="346" height="346" rx="26" stroke="#6F151B" strokeWidth="2.5" fill="none" opacity="0.6" />

        {/* ================= TOP WOODEN ROD & FINIALS ================= */}
        <g id="top-spindle">
          {/* Left Spindle Rod & Finial */}
          <path d="M22 92 L68 92 L68 97 L22 97 Z" fill="url(#rodWood)" stroke="#2C0C07" strokeWidth="1" />
          {/* Left Brass Rings & Knob */}
          <ellipse cx="64" cy="94.5" rx="3.5" ry="7" fill="url(#brassGold)" stroke="#3D1208" strokeWidth="1" />
          <ellipse cx="50" cy="94.5" rx="5" ry="12" fill="url(#brassGold)" stroke="#3D1208" strokeWidth="1.2" />
          <ellipse cx="38" cy="94.5" rx="6" ry="15" fill="url(#rodWood)" stroke="#2C0C07" strokeWidth="1.2" />
          <circle cx="20" cy="94.5" r="4.5" fill="url(#brassGold)" stroke="#2C0C07" strokeWidth="1" />
          <path d="M16 94.5 L6 94.5" stroke="url(#brassGold)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Right Spindle Rod & Finial */}
          <path d="M282 92 L328 92 L328 97 L282 97 Z" fill="url(#rodWood)" stroke="#2C0C07" strokeWidth="1" />
          {/* Right Brass Rings & Knob */}
          <ellipse cx="286" cy="94.5" rx="3.5" ry="7" fill="url(#brassGold)" stroke="#3D1208" strokeWidth="1" />
          <ellipse cx="300" cy="94.5" rx="5" ry="12" fill="url(#brassGold)" stroke="#3D1208" strokeWidth="1.2" />
          <ellipse cx="312" cy="94.5" rx="6" ry="15" fill="url(#rodWood)" stroke="#2C0C07" strokeWidth="1.2" />
          <circle cx="330" cy="94.5" r="4.5" fill="url(#brassGold)" stroke="#2C0C07" strokeWidth="1" />
          <path d="M334 94.5 L344 94.5" stroke="url(#brassGold)" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* ================= GOLDEN SCROLL BODY ================= */}
        <g id="parchment-scroll">
          {/* Scalloped / Deckled Parchment Main Sheet */}
          <path
            d="M72 108 
               C70 125, 76 135, 72 150 
               C76 162, 70 174, 75 186 
               C71 200, 77 212, 73 226 
               C79 238, 75 250, 84 262 
               C92 274, 104 280, 114 290 
               C124 298, 134 300, 146 308 
               C158 314, 168 316, 175 324 
               C182 316, 192 314, 204 308 
               C216 300, 226 298, 236 290 
               C246 280, 258 274, 266 262 
               C275 250, 271 238, 277 226 
               C273 212, 279 200, 275 186 
               C280 174, 274 162, 278 150 
               C274 135, 280 125, 278 108 Z"
            fill="url(#parchmentYellow)"
            stroke="#9E5F05"
            strokeWidth="2.5"
          />

          {/* Ruffled edge shading */}
          <path
            d="M73 112 
               C72 126, 77 135, 74 150 
               C77 162, 72 174, 76 186 
               C73 200, 78 212, 75 226 
               C80 238, 77 250, 85 262 
               C93 273, 105 279, 115 288 
               C125 296, 135 298, 146 306 
               C158 312, 168 314, 175 320 
               C182 314, 192 312, 204 306 
               C215 298, 225 296, 235 288 
               C245 279, 257 273, 265 262 
               C273 250, 270 238, 275 226 
               C272 212, 277 200, 274 186 
               C278 174, 273 162, 276 150 
               C273 135, 278 126, 277 112"
            stroke="#B47204"
            strokeWidth="1.2"
            strokeDasharray="4 2"
            fill="none"
          />

          {/* Top Cylinder Roll */}
          <path
            d="M66 76 L284 76 
               C287 76, 290 80, 290 85 
               L290 106 
               C290 111, 287 114, 284 114 
               L66 114 
               C63 114, 60 111, 60 106 
               L60 85 
               C60 80, 63 76, 66 76 Z"
            fill="url(#cylinderRoll)"
            stroke="#9E5F05"
            strokeWidth="2.5"
          />

          {/* Top roll edge curls */}
          <ellipse cx="63" cy="95" rx="3.5" ry="17" fill="#8B4A02" stroke="#5C2D00" strokeWidth="1" />
          <ellipse cx="287" cy="95" rx="3.5" ry="17" fill="#8B4A02" stroke="#5C2D00" strokeWidth="1" />
        </g>

        {/* ================= MARATHI TEXT ON TOP ROLL: हॉटेल ================= */}
        <text
          x="175"
          y="103"
          textAnchor="middle"
          fill="#530B10"
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          fontWeight="900"
          fontSize="31"
          letterSpacing="2"
          filter="url(#textDrop)"
        >
          हॉटेल
        </text>

        {/* ================= CENTRAL MEDALLION & MAHARAJA ================= */}
        <g id="maharaja-medallion">
          {/* Outer Maroon Circular Ring */}
          <circle cx="175" cy="192" r="58" fill="#FDF3B5" stroke="#6E1116" strokeWidth="6" />
          <circle cx="175" cy="192" r="54" fill="#FDEE92" stroke="#C98811" strokeWidth="1.5" />

          {/* Maharaja Illustration */}
          <g id="maharaja-figure" transform="translate(132, 142)">
            {/* Saffron/Gold Royal Angarkha (Tunic) */}
            <path
              d="M26 62 C34 50, 52 50, 60 62 C64 74, 58 84, 52 90 C34 90, 22 84, 26 62 Z"
              fill="#D99113"
              stroke="#681015"
              strokeWidth="1.5"
            />
            {/* White Pearls / Buttons on Angarkha */}
            <path d="M42 56 L42 88" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="3 3" />
            <circle cx="42" cy="62" r="2" fill="#FFFFFF" />
            <circle cx="42" cy="70" r="2" fill="#FFFFFF" />
            <circle cx="42" cy="78" r="2" fill="#FFFFFF" />

            {/* Left Arm Holding Cloche/Platter (Viewer's Right) */}
            <path
              d="M56 64 C64 68, 72 74, 68 84 C62 88, 54 84, 52 78 Z"
              fill="#D99113"
              stroke="#681015"
              strokeWidth="1.5"
            />
            {/* Silver Serving Cloche/Dome Platter */}
            <ellipse cx="66" cy="80" rx="14" ry="7" fill="#E8EDF2" stroke="#7A8B99" strokeWidth="1.5" />
            <path d="M52 80 C52 70, 80 70, 80 80 Z" fill="#FFFFFF" stroke="#7A8B99" strokeWidth="1.5" />
            <circle cx="66" cy="70" r="2" fill="#D99113" />
            {/* Steaming Food Vapors */}
            <path d="M60 66 Q62 60 60 56" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" fill="none" />
            <path d="M66 65 Q68 58 66 54" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" fill="none" />
            <path d="M72 67 Q74 61 72 57" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" fill="none" />

            {/* Right Arm Raised in Royal Welcome (Viewer's Left) */}
            <path
              d="M26 66 C18 56, 12 44, 18 36 C24 36, 26 46, 32 58 Z"
              fill="#D99113"
              stroke="#681015"
              strokeWidth="1.5"
            />
            {/* Raised Hand */}
            <circle cx="17" cy="36" r="4.5" fill="#F8CBA1" />

            {/* Face Profile & Neck */}
            <ellipse cx="43" cy="46" rx="13" ry="14" fill="#F8CBA1" />
            {/* Ear & Golden Earring (Kundal) */}
            <circle cx="34" cy="46" r="3" fill="#F8CBA1" />
            <circle cx="34" cy="50" r="2" fill="#E2A619" stroke="#9E5F05" strokeWidth="0.8" />

            {/* Royal Black Handlebar Moustache */}
            <path
              d="M37 50 Q46 50 52 46 Q54 50 48 53 Q42 55 36 51 Z"
              fill="#220608"
            />

            {/* Royal Turban (Pheta) - Maroon & Gold */}
            <path
              d="M30 38 C32 26, 48 22, 57 28 C64 34, 60 42, 56 45 C48 43, 34 44, 30 38 Z"
              fill="#7A1318"
              stroke="#4A0A0E"
              strokeWidth="1.5"
            />
            <path
              d="M32 41 C38 34, 50 33, 58 39 C54 44, 42 45, 32 41 Z"
              fill="#E5A823"
            />
            {/* White Feather Kalgi (Plume) on Turban */}
            <path
              d="M48 26 C44 14, 48 4, 52 2 C54 8, 56 16, 54 26 Z"
              fill="#FFFFFF"
              stroke="#D1D5DB"
              strokeWidth="1"
            />
            <circle cx="49" cy="24" r="3" fill="#15803D" stroke="#E5A823" strokeWidth="1" />
          </g>
        </g>

        {/* ================= MARATHI TEXT: व्हेज (Left) ================= */}
        <text
          x="108"
          y="238"
          textAnchor="middle"
          fill="#165A20"
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          fontWeight="900"
          fontSize="23"
          letterSpacing="1"
          filter="url(#textDrop)"
        >
          व्हेज
        </text>

        {/* ================= MARATHI TEXT: महाराजा (Center) WITH TAIL FLOURISH ================= */}
        <g id="maharaja-text">
          <text
            x="175"
            y="266"
            textAnchor="middle"
            fill="#560C11"
            fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
            fontWeight="900"
            fontSize="34"
            letterSpacing="1"
            filter="url(#textDrop)"
          >
            महाराजा
          </text>

          {/* Distinctive Sweeping Underline Flourish extending from 'जा' across to the left */}
          <path
            d="M236 268 C220 280, 160 286, 120 262 C150 274, 205 273, 236 268 Z"
            fill="#560C11"
            filter="url(#textDrop)"
          />
        </g>
      </svg>
    </div>
  );
};

/**
 * Main Logo component that displays the restaurant branding.
 * Keeps the original logo shape, colors, and Marathi text exactly as provided,
 * while pairing with clearly visible HOTEL VEG MAHARAJA text.
 */
export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  variant = 'dark',
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 sm:gap-4 select-none ${className}`}>
      {/* The Exact Logo from reference */}
      <ExactMaharajaLogo size={size} />

      {/* Clearly visible restaurant name: HOTEL VEG MAHARAJA */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <span className="font-cinzel font-black text-xs sm:text-sm tracking-[0.25em] text-[#CBA24B]">
            HOTEL
          </span>
          <span
            className={`font-serif font-black text-xl sm:text-2xl lg:text-3xl tracking-tight mt-0.5 ${
              variant === 'light' ? 'text-white' : 'text-[#5E0F14]'
            }`}
          >
            VEG MAHARAJA
          </span>
          <span
            className={`text-[10px] sm:text-[11px] font-bold tracking-wider mt-1 flex items-center gap-1.5 ${
              variant === 'light' ? 'text-[#F3D99A]' : 'text-[#7D151B]'
            }`}
          >
            <span>Pure Veg & Family Restaurant</span>
          </span>
          <span
            className={`text-[9px] font-medium tracking-wide mt-0.5 ${
              variant === 'light' ? 'text-[#EDE5D5]/80' : 'text-stone-500'
            }`}
          >
            शुध्द शाकाहारी ✽ फॅमिली रेस्टॉरंट
          </span>
        </div>
      )}
    </div>
  );
};
