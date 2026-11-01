import React from 'react';

interface WasteIconProps {
  spriteIndex: number; // 0: Apple core, 1: Crumpled paper, 2: Plastic bottle, 3: Crushed metal can, 4: Plastic cup
  className?: string;
  size?: number;
}

export const WasteIcon: React.FC<WasteIconProps> = ({
  spriteIndex,
  className = '',
  size = 56,
}) => {
  // Pure vector sprite without any surrounding square card, box, or borders.
  // Directly renders as realistic scattered debris with ground contact shadow.
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Ground Contact Shadow */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.55" />
            <stop offset="65%" stopColor="#000000" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Linear Gradients for realistic shading */}
          <linearGradient id="appleSkin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          <linearGradient id="appleCore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>

          <linearGradient id="bottleBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#60a5fa" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="canBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="45%" stopColor="#f43f5e" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>
        </defs>

        {/* 0: Organik - Elma Çöpü (Apple Core) */}
        {spriteIndex === 0 && (
          <g transform="translate(0, 4)">
            {/* Ground shadow ellipse */}
            <ellipse cx="50" cy="84" rx="34" ry="10" fill="url(#groundShadow)" />

            {/* Apple Stem & Leaf */}
            <path
              d="M50 20 C48 10, 56 6, 60 4"
              stroke="#78350f"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M54 12 C62 8, 70 12, 68 18 C62 20, 56 16, 54 12 Z"
              fill="#22c55e"
              stroke="#15803d"
              strokeWidth="1"
            />

            {/* Top Apple Cap */}
            <path
              d="M26 32 C26 22, 40 18, 50 22 C60 18, 74 22, 74 32 C68 34, 32 34, 26 32 Z"
              fill="url(#appleSkin)"
              stroke="#7f1d1d"
              strokeWidth="2"
            />

            {/* Eaten Core (narrow center) */}
            <path
              d="M32 32 C38 42, 44 48, 44 54 C44 60, 36 66, 30 72 C42 75, 58 75, 70 72 C64 66, 56 60, 56 54 C56 48, 62 42, 68 32 Z"
              fill="url(#appleCore)"
              stroke="#d97706"
              strokeWidth="1.5"
            />

            {/* Brown Seeds */}
            <ellipse cx="47" cy="51" rx="2.5" ry="4" transform="rotate(-15 47 51)" fill="#451a03" />
            <ellipse cx="53" cy="56" rx="2.5" ry="4" transform="rotate(18 53 56)" fill="#451a03" />

            {/* Bottom Apple Base */}
            <path
              d="M30 72 C32 82, 44 86, 50 84 C56 86, 68 82, 70 72 C64 71, 36 71, 30 72 Z"
              fill="url(#appleSkin)"
              stroke="#7f1d1d"
              strokeWidth="2"
            />
          </g>
        )}

        {/* 1: Kağıt - Buruşuk Gazete / Kağıt Parçası (Crumpled Paper) */}
        {spriteIndex === 1 && (
          <g transform="translate(0, 4)">
            {/* Ground shadow ellipse */}
            <ellipse cx="50" cy="80" rx="36" ry="11" fill="url(#groundShadow)" />

            {/* Crumpled Faceted Paper Polygon Layers */}
            <polygon
              points="28,32 50,18 72,28 84,48 76,74 48,82 22,68 18,46"
              fill="#f1f5f9"
              stroke="#94a3b8"
              strokeWidth="2"
            />
            {/* Darker Facet Creases */}
            <polygon points="50,18 42,42 72,28" fill="#e2e8f0" />
            <polygon points="42,42 18,46 28,32" fill="#cbd5e1" />
            <polygon points="42,42 22,68 48,82" fill="#e2e8f0" />
            <polygon points="42,42 48,82 58,54" fill="#f8fafc" />
            <polygon points="58,54 48,82 76,74" fill="#cbd5e1" />
            <polygon points="58,54 76,74 84,48" fill="#e2e8f0" />
            <polygon points="58,54 84,48 72,28" fill="#f8fafc" />

            {/* Subtle text lines on crumpled newsprint */}
            <line x1="32" y1="38" x2="40" y2="35" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="30" y1="44" x2="38" y2="42" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="60" y1="36" x2="70" y2="38" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="62" y1="44" x2="74" y2="46" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="50" y1="66" x2="65" y2="62" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {/* 2: Plastik - Yatay Plastik Su Şişesi (Plastic Water Bottle) */}
        {spriteIndex === 2 && (
          <g transform="translate(0, 4) rotate(-18 50 50)">
            {/* Ground shadow ellipse */}
            <ellipse cx="50" cy="74" rx="42" ry="10" fill="url(#groundShadow)" />

            {/* Blue Plastic Bottle Cap */}
            <rect x="12" y="44" width="8" height="12" rx="2" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="1.5" />
            {/* Neck Ring */}
            <rect x="19" y="46" width="4" height="8" rx="1" fill="#3b82f6" />

            {/* Bottle Shoulder */}
            <path
              d="M23 46 C28 42, 34 38, 42 38 L76 38 C84 38, 88 44, 88 50 C88 56, 84 62, 76 62 L42 62 C34 62, 28 58, 23 54 Z"
              fill="url(#bottleBody)"
              stroke="#2563eb"
              strokeWidth="2"
            />

            {/* Molded Grooves/Ribs on plastic body */}
            <line x1="44" y1="40" x2="44" y2="60" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="54" y1="40" x2="54" y2="60" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="64" y1="40" x2="64" y2="60" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round" />

            {/* Plastic Label Band */}
            <rect x="46" y="41" width="16" height="18" rx="1" fill="#60a5fa" fillOpacity="0.4" stroke="#93c5fd" strokeWidth="1" />

            {/* Glossy Reflection Highlight */}
            <path
              d="M32 42 L74 42"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeOpacity="0.8"
            />
          </g>
        )}

        {/* 3: Metal - Ezilmiş Meşrubat Kutusu (Crushed Soda Can) */}
        {spriteIndex === 3 && (
          <g transform="translate(0, 4) rotate(14 50 50)">
            {/* Ground shadow ellipse */}
            <ellipse cx="50" cy="80" rx="38" ry="10" fill="url(#groundShadow)" />

            {/* Top Can Rim Oval */}
            <ellipse cx="50" cy="26" rx="22" ry="7" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
            <ellipse cx="50" cy="26" rx="16" ry="5" fill="#94a3b8" />
            {/* Pull Tab */}
            <path d="M46 25 C46 22, 54 22, 54 25 C54 28, 46 28, 46 25 Z" fill="#f8fafc" stroke="#475569" strokeWidth="1" />

            {/* Crumpled Can Body with indentation dent */}
            <path
              d="M28 26 L29 44 C34 47, 32 55, 27 58 L28 72 C28 77, 40 80, 50 80 C60 80, 72 77, 72 72 L73 57 C68 54, 66 46, 71 43 L72 26 Z"
              fill="url(#canBody)"
              stroke="#881337"
              strokeWidth="2"
            />

            {/* Metallic Crease Highlight */}
            <path d="M33 46 Q50 50 67 44" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" strokeLinecap="round" />
            <path d="M30 60 Q50 64 70 58" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />

            {/* Bottom Can Rim */}
            <ellipse cx="50" cy="72" rx="22" ry="6" fill="none" stroke="#64748b" strokeWidth="1.5" />
          </g>
        )}

        {/* 4: Plastik - Plastik Bardak & Pipet (Plastic Cup) */}
        {spriteIndex === 4 && (
          <g transform="translate(0, 4) rotate(-10 50 50)">
            {/* Ground shadow ellipse */}
            <ellipse cx="50" cy="82" rx="36" ry="10" fill="url(#groundShadow)" />

            {/* Red & White Striped Bent Straw */}
            <path
              d="M50 20 L58 4 L68 2"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M50 20 L58 4 L68 2"
              stroke="#ffffff"
              strokeWidth="4"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Plastic Dome Lid */}
            <ellipse cx="50" cy="28" rx="26" ry="8" fill="#e2e8f0" fillOpacity="0.75" stroke="#94a3b8" strokeWidth="2" />

            {/* Tapered Cup Body */}
            <path
              d="M26 28 L34 76 C35 79, 42 81, 50 81 C58 81, 65 79, 66 76 L74 28 Z"
              fill="#bfdbfe"
              fillOpacity="0.55"
              stroke="#60a5fa"
              strokeWidth="2"
            />

            {/* Dent crease in cup */}
            <path d="M38 45 Q50 50 58 42" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
