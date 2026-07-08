/**
 * LandMap monogram — a stylized "M" over a grid, drawn in the dual-tone
 * emerald → cyan signature gradient. Pure SVG, no network, scales crisply.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden role="img">
      <defs>
        <linearGradient id="lm-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="26" height="26" rx="7" stroke="url(#lm-grad)" strokeWidth="1.5" />
      <path
        d="M9 22V10l7 6 7-6v12"
        stroke="url(#lm-grad)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="1.6" fill="#34d399" />
    </svg>
  );
}
