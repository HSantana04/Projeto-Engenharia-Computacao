import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'elevated' | 'featured';
}

export const Card = ({ children, className = '', variant = 'light' }: CardProps) => {
  const variants = {
    light: 'bg-surface-card text-ink border border-hairline-light rounded-lg',
    dark: 'bg-surface-elevated text-on-dark rounded-lg',
    elevated: 'bg-surface-elevated text-on-dark rounded-lg',
    featured: 'bg-primary text-on-primary rounded-lg',
  };
  
  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', variant = 'light' }: CardProps) => {
  const borderColor = variant === 'light' ? 'border-hairline-light' : 'border-hairline-dark';
  return (
    <div className={`px-xxl py-5 border-b ${borderColor} ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', variant = 'light' }: CardProps) => {
  const textColor = variant === 'light' ? 'text-ink' : 'text-on-dark';
  return (
    <h3 className={`text-heading-md font-display font-semibold ${textColor} ${className}`}>
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className = '', variant = 'light' }: CardProps) => {
  return (
    <div className={`px-xxl py-5 ${className}`}>
      {children}
    </div>
  );
};
