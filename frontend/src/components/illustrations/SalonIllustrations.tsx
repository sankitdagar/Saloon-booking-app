export function SalonHeroIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 360" fill="none" className={className} aria-hidden>
      <circle cx="200" cy="180" r="140" fill="#FFE8EC" opacity="0.5" />
      <circle cx="280" cy="100" r="60" fill="#F3EBDD" />
      <ellipse cx="200" cy="300" rx="120" ry="20" fill="#E8DCC8" opacity="0.6" />
      {/* Mirror */}
      <ellipse cx="200" cy="150" rx="70" ry="85" fill="#FAF6EF" stroke="#C9A962" strokeWidth="3" />
      <ellipse cx="200" cy="150" rx="55" ry="68" fill="url(#mirrorGrad)" opacity="0.3" />
      <rect x="192" y="230" width="16" height="40" rx="4" fill="#C9A962" />
      <rect x="170" y="265" width="60" height="8" rx="4" fill="#9A5569" />
      {/* Scissors */}
      <g transform="translate(280, 200) rotate(-20)">
        <circle cx="0" cy="0" r="12" fill="none" stroke="#2D2A32" strokeWidth="3" />
        <circle cx="20" cy="20" r="12" fill="none" stroke="#2D2A32" strokeWidth="3" />
        <line x1="8" y1="8" x2="28" y2="28" stroke="#2D2A32" strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* Comb */}
      <g transform="translate(90, 180)">
        <rect x="0" y="0" width="50" height="14" rx="4" fill="#B86B82" />
        {[0, 8, 16, 24, 32, 40].map((x) => (
          <rect key={x} x={x + 2} y="14" width="4" height="20" rx="1" fill="#9A5569" />
        ))}
      </g>
      {/* Sparkles */}
      {[[120, 80], [300, 140], [160, 260], [320, 240]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x}, ${y})`}>
          <path d="M0-8L2-2L8 0L2 2L0 8L-2 2L-8 0L-2-2Z" fill="#C9A962" opacity="0.7" />
        </g>
      ))}
      <defs>
        <linearGradient id="mirrorGrad" x1="145" y1="82" x2="255" y2="218">
          <stop stopColor="#E8A4B4" />
          <stop offset="1" stopColor="#C9A962" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AuthIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 280" fill="none" className={className} aria-hidden>
      <rect width="320" height="280" rx="24" fill="url(#authBg)" />
      <circle cx="160" cy="100" r="45" fill="#FFE8EC" stroke="#E8A4B4" strokeWidth="2" />
      <circle cx="160" cy="90" r="18" fill="#F9C5D1" />
      <path d="M115 145 Q160 175 205 145" stroke="#B86B82" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="100" y="170" width="120" height="70" rx="12" fill="white" opacity="0.9" />
      <rect x="115" y="190" width="90" height="8" rx="4" fill="#F3EBDD" />
      <rect x="115" y="210" width="70" height="8" rx="4" fill="#FFE8EC" />
      <circle cx="250" cy="60" r="25" fill="#C9A962" opacity="0.3" />
      <circle cx="60" cy="200" r="35" fill="#E8A4B4" opacity="0.2" />
      <defs>
        <linearGradient id="authBg" x1="0" y1="0" x2="320" y2="280">
          <stop stopColor="#FAF6EF" />
          <stop offset="1" stopColor="#FFF5F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BookingIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} aria-hidden>
      <rect x="30" y="40" width="140" height="120" rx="12" fill="white" stroke="#E8DCC8" strokeWidth="2" />
      <rect x="30" y="40" width="140" height="30" rx="12" fill="#B86B82" />
      <rect x="30" y="58" width="140" height="12" fill="#9A5569" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={50 + (i % 3) * 35} cy={95 + Math.floor(i / 3) * 30} r="8" fill={i === 2 ? '#C9A962' : '#F3EBDD'} />
      ))}
      <path d="M100 160 L110 175 L130 155" stroke="#C9A962" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EmptyIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={className} aria-hidden>
      <circle cx="80" cy="80" r="60" fill="#FAF6EF" stroke="#E8DCC8" strokeWidth="2" strokeDasharray="8 4" />
      <path d="M60 75 Q80 55 100 75" stroke="#E8A4B4" strokeWidth="2" fill="none" />
      <circle cx="65" cy="68" r="4" fill="#B86B82" />
      <circle cx="95" cy="68" r="4" fill="#B86B82" />
      <path d="M70 95 Q80 105 90 95" stroke="#9A5569" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
