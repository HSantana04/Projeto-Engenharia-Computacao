import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'dark' | 'soft' | 'outline-light' | 'outline-dark' | 'pill-sm' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isPressed?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isPressed = false,
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: isPressed 
      ? 'bg-faint text-canvas-dark px-7 py-3 rounded-full font-button-md' 
      : 'bg-canvas-light text-canvas-dark px-7 py-3 rounded-full font-button-md hover:bg-faint',
    dark: 'bg-canvas-dark text-on-dark px-7 py-3 rounded-full font-button-md hover:bg-surface-elevated',
    soft: 'bg-surface-soft text-ink px-7 py-3 rounded-full font-button-md hover:bg-hairline-light',
    'outline-light': 'bg-canvas-light text-ink border border-hairline-strong px-7 py-3 rounded-full font-button-md hover:bg-surface-soft',
    'outline-dark': 'bg-canvas-dark text-on-dark border border-on-dark px-7 py-3 rounded-full font-button-md hover:bg-surface-elevated',
    'pill-sm': 'bg-surface-soft text-ink px-4 py-2 rounded-full font-button-sm hover:bg-hairline-light',
    danger: 'bg-accent-danger text-on-primary px-7 py-3 rounded-full font-button-md hover:bg-accent-deep-red',
  };

  const sizes = {
    sm: 'text-button-sm h-9',
    md: 'text-button-md h-12',
    lg: 'text-button-lg h-12',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
