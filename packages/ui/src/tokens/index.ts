export const tokens = {
  colors: {
    bg: 'var(--lm-bg)',
    surface: 'var(--lm-surface)',
    border: 'var(--lm-border)',
    muted: 'var(--lm-muted)',
    accent: 'var(--lm-accent)',
    text: 'var(--lm-text)',
    danger: 'var(--lm-danger)',
    success: 'var(--lm-success)',
    warning: 'var(--lm-warning)',
  },
  type: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
  },
  radius: {
    sm: '0.25rem',
    base: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
};

export type Tokens = typeof tokens;
