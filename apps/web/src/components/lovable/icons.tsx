import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function MapPinned({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0" />
      <circle cx="12" cy="8" r="2" />
      <path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function Sparkles({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
      <path d="M20 2v4" />
      <path d="M22 4h-4" />
      <circle cx="4" cy="20" r="2" />
    </svg>
  );
}

export function ArrowLeft({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

export function Check({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function Mail({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function Lock({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function User({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function Eye({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOff({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export function ArrowRight({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function TrendingUp({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M16 7h6v6" />
      <path d="m22 7-8.5 8.5-5-5L2 17" />
    </svg>
  );
}

export function BellRing({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <path d="M22 8c0-2.3-.8-4.3-2-6" />
      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
      <path d="M4 2C2.8 3.7 2 5.7 2 8" />
    </svg>
  );
}

export function ShieldCheck({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}


export function Star({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z" />
    </svg>
  );
}

export function Building2({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v8h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}

export function MapPin({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function X({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export function Search({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function GitCompare({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M13 6h3a2 2 0 0 1 2 2v7" />
      <path d="M11 18H8a2 2 0 0 1-2-2V9" />
    </svg>
  );
}

export function Plus({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function Filter({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" />
    </svg>
  );
}

export function ChevronDown({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ChevronRight({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function SlidersHorizontal({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M21 4H3" />
      <path d="M21 12H3" />
      <path d="M21 20H3" />
      <path d="M14 4v16" />
      <path d="M10 12v8" />
      <path d="M6 20V4" />
    </svg>
  );
}

export function LineChart({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

export function BarChart({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}

export function Flame({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
    </svg>
  );
}

export function Gem({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M10.5 3 8 9l4 13 4-13-2.5-6" />
      <path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z" />
      <path d="M2 9h20" />
    </svg>
  );
}

export function Award({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
      <circle cx="12" cy="8" r="6" />
    </svg>
  );
}

export function Satellite({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="m13.5 6.5-3.148-3.148a1.205 1.205 0 0 0-1.704 0L6.352 5.648a1.205 1.205 0 0 0 0 1.704L9.5 10.5" />
      <path d="M16.5 7.5 19 5" />
      <path d="m17.5 10.5 3.148 3.148a1.205 1.205 0 0 1 0 1.704l-2.296 2.296a1.205 1.205 0 0 1-1.704 0L13.5 14.5" />
      <path d="M9 21a6 6 0 0 0-6-6" />
      <path d="M9.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l4.296-4.296a1.205 1.205 0 0 0 0-1.704l-2.296-2.296a1.205 1.205 0 0 0-1.704 0z" />
    </svg>
  );
}

export function TrendingDown({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M16 17h6v-6" />
      <path d="m22 17-8.5-8.5-5 5L2 7" />
    </svg>
  );
}

export function Minus({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M5 12h14" />
    </svg>
  );
}

export function ArrowUpDown({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="m21 16-4 4-4-4" />
      <path d="M17 20V4" />
      <path d="m3 8 4-4 4 4" />
      <path d="M7 4v16" />
    </svg>
  );
}

export function Layers({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </svg>
  );
}

export function Activity({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export function Trash2({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} aria-hidden>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export function LandMapWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display text-xl font-bold tracking-tight text-[var(--foreground)] ${className}`}>
      Land<span className="text-[var(--primary)]">Map</span>
    </span>
  );
}
