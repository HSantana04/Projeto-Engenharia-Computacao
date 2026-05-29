import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'light' | 'dark';
}

export const Input = ({ label, error, className = '', variant = 'light', ...props }: InputProps) => {
  const isLight = variant === 'light';
  const bgColor = isLight ? 'bg-canvas-light' : 'bg-surface-elevated';
  const textColor = isLight ? 'text-ink' : 'text-on-dark';
  const borderColor = isLight ? 'border-hairline-light' : 'border-hairline-dark';
  const focusRing = 'focus:border-primary focus:ring-2 focus:ring-primary/10';
  
  return (
    <div className="w-full">
      {label && (
        <label className={`block text-body-sm font-medium ${isLight ? 'text-ink' : 'text-on-dark'} mb-2`}>
          {label}
        </label>
      )}
      <input
        className={`w-full ${bgColor} ${textColor} border ${borderColor} rounded-md px-4 py-3.5 font-body-md transition-colors outline-none ${
          error ? 'border-accent-danger focus:ring-accent-danger/10' : focusRing
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-body-sm text-accent-danger">{error}</p>
      )}
    </div>
  );
};
