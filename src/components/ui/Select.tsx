import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  variant?: 'light' | 'dark';
}

export const Select = ({ label, error, options, className = '', variant = 'light', ...props }: SelectProps) => {
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
      <select
        className={`w-full ${bgColor} ${textColor} border ${borderColor} rounded-md px-4 py-3.5 font-body-md transition-colors outline-none ${
          error ? 'border-accent-danger focus:ring-accent-danger/10' : focusRing
        } appearance-none cursor-pointer ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-body-sm text-accent-danger">{error}</p>
      )}
    </div>
  );
};
