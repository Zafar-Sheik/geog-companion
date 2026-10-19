export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0f766e" />
            <stop offset="0.55" stopColor="#0369a1" />
            <stop offset="1" stopColor="#4d7c0f" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#logo-g)" />
        {/* contour lines of a hill */}
        <ellipse cx="16" cy="17" rx="10" ry="7.5" fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="1.6" />
        <ellipse cx="16.5" cy="16.5" rx="6.5" ry="4.8" fill="none" stroke="white" strokeOpacity="0.8" strokeWidth="1.6" />
        <ellipse cx="17" cy="16" rx="3" ry="2.2" fill="white" />
        <path d="M6 25 Q11 22 16 24 T26 23" stroke="#93c5fd" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="24.5" cy="8" r="2.2" fill="#fbbf24" />
      </svg>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight">
          Geo<span className="bg-gradient-to-r from-brand to-climate bg-clip-text text-transparent">Mzansi</span>
        </span>
      )}
    </span>
  );
}
