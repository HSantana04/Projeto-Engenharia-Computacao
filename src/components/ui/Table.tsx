import { ReactNode } from 'react';

interface TableProps {
  children?: ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
}

export const Table = ({ children, className = '', variant = 'light' }: TableProps) => {
  const borderColor = variant === 'light' ? 'divide-hairline-light' : 'divide-hairline-dark';
  return (
    <div className="overflow-x-auto rounded-lg border border-hairline-light">
      <table className={`min-w-full divide-y ${borderColor} ${className}`}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, variant = 'light' }: TableProps) => {
  const bgColor = variant === 'light' ? 'bg-surface-soft' : 'bg-surface-elevated';
  const textColor = variant === 'light' ? 'text-ink' : 'text-on-dark';
  return (
    <thead className={`${bgColor} ${textColor}`}>
      {children}
    </thead>
  );
};

export const TableBody = ({ children, variant = 'light' }: TableProps) => {
  const bgColor = variant === 'light' ? 'bg-surface-card' : 'bg-canvas-dark';
  const borderColor = variant === 'light' ? 'divide-hairline-light' : 'divide-hairline-dark';
  return (
    <tbody className={`${bgColor} divide-y ${borderColor}`}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = '', variant = 'light' }: TableProps) => {
  const hoverColor = variant === 'light' ? 'hover:bg-surface-soft' : 'hover:bg-surface-deep';
  return (
    <tr className={`${hoverColor} transition-colors ${className}`}>
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = '', variant = 'light' }: TableProps) => {
  const textColor = variant === 'light' ? 'text-mute' : 'text-on-dark-mute';
  return (
    <th className={`px-lg py-3 text-left text-caption font-medium ${textColor} uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = '', variant = 'light' }: TableProps) => {
  const textColor = variant === 'light' ? 'text-body-md text-ink' : 'text-body-md text-on-dark';
  return (
    <td className={`px-lg py-4 whitespace-nowrap ${textColor} ${className}`}>
      {children}
    </td>
  );
};
