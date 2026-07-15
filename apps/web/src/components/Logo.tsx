/**
 * LandMap monogram — a stylized "M" over a grid, drawn in the LandMap
 * indigo (var(--primary) → var(--primary-glow)) signature gradient. Pure SVG, no network,
 * scales crisply. Used standalone (no adjacent wordmark per brand spec).
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      aria-hidden
      style={{ filter: 'drop-shadow(0 0 6px color-mix(in srgb, var(--primary) 35%, transparent))' }}
    >
      <defs>
        <linearGradient id="lm-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--primary-glow)" />
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
      <circle cx="16" cy="16" r="1.6" fill="var(--primary-glow)" />
    </svg>
  );
}
