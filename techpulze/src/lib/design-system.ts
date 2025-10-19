/**
 * TechPulze Design System
 * Comprehensive design tokens for consistent UI/UX
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Accent Colors
  accent: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Badge Tier Colors
  badge: {
    certified: {
      gradient: 'from-blue-500 to-cyan-500',
      text: '#0891b2',
      bg: '#cffafe',
    },
    trusted: {
      gradient: 'from-purple-500 to-pink-500',
      text: '#9333ea',
      bg: '#f3e8ff',
    },
    exemplary: {
      gradient: 'from-amber-500 to-orange-500',
      text: '#ea580c',
      bg: '#ffedd5',
    },
    pioneer: {
      gradient: 'from-emerald-500 to-teal-500',
      text: '#059669',
      bg: '#d1fae5',
    },
  },

  // Neutral Grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
}

export const typography = {
  fonts: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
  },

  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },

  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  },
}

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
}

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
}

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',

  // Colored shadows for badges
  colored: {
    blue: '0 10px 15px -3px rgb(59 130 246 / 0.3)',
    purple: '0 10px 15px -3px rgb(168 85 247 / 0.3)',
    amber: '0 10px 15px -3px rgb(245 158 11 / 0.3)',
    emerald: '0 10px 15px -3px rgb(16 185 129 / 0.3)',
  },
}

export const animations = {
  durations: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  easings: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Framer Motion variants
  variants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },

    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },

    slideDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },

    scaleIn: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    },

    stagger: {
      animate: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    },
  },

  // Keyframe animations for CSS
  keyframes: {
    pulse: '@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }',
    bounce: '@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-25%); } }',
    shimmer: '@keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }',
  },
}

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
}

// Theme configuration
export const lightTheme = {
  name: 'light',
  colors: {
    background: colors.gray[50],
    foreground: colors.gray[900],
    card: '#ffffff',
    cardHover: colors.gray[100],
    border: colors.gray[200],
    input: colors.gray[100],
    primary: colors.primary[600],
    primaryForeground: '#ffffff',
    secondary: colors.gray[100],
    secondaryForeground: colors.gray[900],
    muted: colors.gray[100],
    mutedForeground: colors.gray[500],
    accent: colors.accent[500],
    accentForeground: '#ffffff',
    destructive: colors.error[500],
    destructiveForeground: '#ffffff',
  },
  shadows: {
    card: shadows.md,
    cardHover: shadows.lg,
  },
}

export const darkTheme = {
  name: 'dark',
  colors: {
    background: colors.gray[950],
    foreground: colors.gray[50],
    card: colors.gray[900],
    cardHover: colors.gray[800],
    border: colors.gray[800],
    input: colors.gray[800],
    primary: colors.primary[500],
    primaryForeground: '#ffffff',
    secondary: colors.gray[800],
    secondaryForeground: colors.gray[50],
    muted: colors.gray[800],
    mutedForeground: colors.gray[400],
    accent: colors.accent[500],
    accentForeground: '#ffffff',
    destructive: colors.error[500],
    destructiveForeground: '#ffffff',
  },
  shadows: {
    card: shadows.xl,
    cardHover: shadows['2xl'],
  },
}

// Export theme type
export type Theme = typeof lightTheme
export type ThemeMode = 'light' | 'dark'
