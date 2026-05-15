// theme.ts - Revolut Design System Colors & Components

export const REVOLUT_COLORS = {
  // Brand & Accent
  primary: '#494fdf',           // Cobalt Violet
  primaryBright: '#4f55f1',     // One step up
  primaryDeep: '#3a40c4',       // Active/pressed state
  onPrimary: '#ffffff',
  
  // Canvas (Main switching point)
  canvasDark: '#000000',        // True black - storytelling mode
  canvasLight: '#ffffff',       // Pure white - catalogue mode
  
  // Text on Canvas
  onDark: '#ffffff',
  onDarkMute: 'rgba(255,255,255,0.72)',
  
  // Surface/Elevation on Dark Canvas
  surfaceElevated: '#16181a',   // Cards on #000000
  surfaceDeep: '#0a0a0a',       // One step darker (avoid)
  
  // Surface/Elevation on Light Canvas
  surfaceCard: '#ffffff',
  surfaceSoft: '#f4f4f4',       // Subtle off-white
  
  // Text on Light Canvas
  ink: '#191c1f',               // Primary text (slightly warm)
  body: '#1f2226',              // Long-form body
  charcoal: '#3a3d40',          // Secondary
  mute: '#505a63',              // Supporting
  ash: '#5c5e60',               // Tertiary
  stone: '#8d969e',             // Metadata
  faint: '#c9c9cd',             // Disabled
  
  // Dividers
  hairlineLight: '#e2e2e7',     // 1px dividers on white
  hairlineDark: 'rgba(255,255,255,0.12)',  // 1px dividers on dark
  hairlineStrong: '#191c1f',    // Structural dividers
  dividerSoft: 'rgba(255,255,255,0.06)',
  
  // Semantic & Data Viz (NEVER use as button backgrounds)
  accentTeal: '#00a87e',        // Positive/success
  accentBlue: '#007bc2',        // Link on dark
  accentBlueLinkLight: '#376cd5', // Link on light
  accentLightGreen: '#428619',  // Success product
  accentGreenText: '#006400',   // Inline success
  accentYellow: '#b09000',      // Caution/pending
  accentWarning: '#ec7e00',     // Warning illustration
  accentPink: '#e61e49',        // Deep pink - product/category
  accentDanger: '#e23b4a',      // Error/destructive
  accentDeepRed: '#8b0000',     // Inline error
  accentBrown: '#936d62',       // Warm neutral (metals)
  
  link: '#376cd5',              // Default inline link
};

/**
 * Chart color palette - use these for data visualization
 * Never use as button/surface backgrounds
 */
export const CHART_COLORS = [
  REVOLUT_COLORS.accentBlue,
  REVOLUT_COLORS.accentTeal,
  REVOLUT_COLORS.accentPink,
  REVOLUT_COLORS.accentLightGreen,
  REVOLUT_COLORS.accentWarning,
  REVOLUT_COLORS.primary,
  '#a78bfa',
  '#fb7185',
];

/**
 * Typography tokens - use these for consistency
 */
export const REVOLUT_TYPOGRAPHY = {
  displayXXL: {
    fontFamily: 'Aeonik Pro, sans-serif',
    fontSize: '136px',
    fontWeight: 500,
    lineHeight: 1.0,
    letterSpacing: '-2.72px',
  },
  displayXL: {
    fontFamily: 'Aeonik Pro, sans-serif',
    fontSize: '80px',
    fontWeight: 500,
    lineHeight: 1.0,
    letterSpacing: '-0.8px',
  },
  displayLg: {
    fontFamily: 'Aeonik Pro, sans-serif',
    fontSize: '48px',
    fontWeight: 500,
    lineHeight: 1.21,
    letterSpacing: '-0.48px',
  },
  displayMd: {
    fontFamily: 'Aeonik Pro, sans-serif',
    fontSize: '40px',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '-0.4px',
  },
  headingLg: {
    fontFamily: 'Aeonik Pro, sans-serif',
    fontSize: '32px',
    fontWeight: 500,
    lineHeight: 1.19,
    letterSpacing: '-0.32px',
  },
  headingMd: {
    fontFamily: 'Aeonik Pro, sans-serif',
    fontSize: '24px',
    fontWeight: 500,
    lineHeight: 1.33,
    letterSpacing: '0',
  },
  headingSm: {
    fontFamily: 'Aeonik Pro, sans-serif',
    fontSize: '20px',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0',
  },
  bodyLg: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: 1.56,
    letterSpacing: '-0.09px',
  },
  bodyMd: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.24px',
  },
  bodyMdBold: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0.16px',
  },
  bodySm: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.43,
  },
  buttonLg: {
    fontFamily: 'Aeonik Pro, sans-serif',
    fontSize: '20px',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  buttonMd: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0.24px',
  },
  buttonSm: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: 1.43,
  },
  caption: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: 1.4,
  },
};

/**
 * Spacing system - base unit 4px, work with multiples
 */
export const REVOLUT_SPACING = {
  xxs: '4px',
  xs: '6px',
  sm: '8px',
  md: '14px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
  block: '80px',
  section: '88px',    // Between bands
  band: '120px',      // Hero & closing section
};

/**
 * Border radius system
 */
export const REVOLUT_RADIUS = {
  none: '0px',
  sm: '8px',
  md: '12px',
  lg: '20px',      // Feature & plan cards
  xl: '28px',      // Product mockup containers
  full: '9999px',  // Buttons, pills, badges
};

/**
 * RevolutButton component - follows pill shape + color variants
 * 
 * Usage:
 * <RevolutButton variant="primary" size="md">
 *   <Plus className="h-4 w-4" />
 *   Add Item
 * </RevolutButton>
 */
interface RevolutButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'dark' | 'soft' | 'ghost' | 'outline-light' | 'outline-dark';
  size?: 'sm' | 'md' | 'lg';
}

export const RevolutButton: React.FC<RevolutButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses =
    'rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<string, string> = {
    primary: `bg-white text-black hover:bg-slate-100 active:bg-slate-200`,
    dark: `bg-black text-white hover:bg-slate-900 border border-white/10`,
    soft: `bg-slate-100 text-black hover:bg-slate-200`,
    ghost: `bg-transparent text-white hover:bg-white/10 border border-white/20`,
    'outline-light': `bg-white text-black border border-slate-300 hover:bg-slate-50`,
    'outline-dark': `bg-black text-white border border-white hover:bg-slate-900`,
  };

  const sizes: Record<string, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-7 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Helper: Create a KPI card with icon
 */
export const RevolutKPICard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg?: string;
  highlight?: 'primary' | 'teal' | 'pink' | 'green' | 'blue' | 'warning';
}> = ({
  label,
  value,
  icon,
  highlight = 'primary',
}) => {
  const highlightColors: Record<string, string> = {
    primary: REVOLUT_COLORS.primary,
    teal: REVOLUT_COLORS.accentTeal,
    pink: REVOLUT_COLORS.accentPink,
    green: REVOLUT_COLORS.accentLightGreen,
    blue: REVOLUT_COLORS.accentBlue,
    warning: REVOLUT_COLORS.accentWarning,
  };

  return (
    <div
      style={{
        backgroundColor: REVOLUT_COLORS.canvasLight,
        borderColor: REVOLUT_COLORS.hairlineLight,
      }}
      className="rounded-lg border p-6 transition-all hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p style={{ color: REVOLUT_COLORS.body }} className="text-sm font-medium">
            {label}
          </p>
          <p
            style={{
              color: REVOLUT_COLORS.ink,
              fontFamily: 'Aeonik Pro, sans-serif',
              fontSize: '32px',
              fontWeight: 500,
              letterSpacing: '-0.32px',
            }}
            className="mt-2"
          >
            {value}
          </p>
        </div>
        <div
          style={{ backgroundColor: highlightColors[highlight] }}
          className="rounded-full p-3"
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

/**
 * Helper: Create a data card (for charts, etc)
 */
export const RevolutDataCard: React.FC<{
  title: string;
  children: React.ReactNode;
  mode?: 'dark' | 'light';
}> = ({ title, children, mode = 'dark' }) => {
  const isDark = mode === 'dark';

  return (
    <div
      style={{
        backgroundColor: isDark ? REVOLUT_COLORS.surfaceElevated : REVOLUT_COLORS.canvasLight,
        borderColor: isDark ? REVOLUT_COLORS.hairlineDark : REVOLUT_COLORS.hairlineLight,
      }}
      className="rounded-lg border p-8"
    >
      <h3
        style={{
          color: isDark ? REVOLUT_COLORS.onDark : REVOLUT_COLORS.ink,
          fontFamily: 'Aeonik Pro, sans-serif',
          fontSize: '24px',
          fontWeight: 500,
          letterSpacing: '-0.32px',
        }}
        className="mb-8"
      >
        {title}
      </h3>
      {children}
    </div>
  );
};

/**
 * Helper: Table cell styling
 */
export const getTableStyles = (mode: 'dark' | 'light' = 'light') => {
  const isDark = mode === 'dark';
  return {
    headerBg: isDark ? REVOLUT_COLORS.canvasDark : REVOLUT_COLORS.surfaceSoft,
    headerText: isDark ? REVOLUT_COLORS.onDarkMute : REVOLUT_COLORS.body,
    headerBorder: isDark ? REVOLUT_COLORS.hairlineDark : REVOLUT_COLORS.hairlineLight,
    rowBorder: isDark ? REVOLUT_COLORS.hairlineDark : REVOLUT_COLORS.hairlineLight,
    rowHover: isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50',
    cellText: isDark ? REVOLUT_COLORS.onDark : REVOLUT_COLORS.ink,
    cellMute: isDark ? REVOLUT_COLORS.onDarkMute : REVOLUT_COLORS.body,
    containerBg: isDark ? REVOLUT_COLORS.surfaceElevated : REVOLUT_COLORS.canvasLight,
    containerBorder: isDark ? REVOLUT_COLORS.hairlineDark : REVOLUT_COLORS.hairlineLight,
  };
};