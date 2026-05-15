import { ReactNode } from 'react';
import { Card, CardContent } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'light' | 'dark';
}

export const StatCard = ({ title, value, icon, trend, variant = 'light' }: StatCardProps) => {
  const isLight = variant === 'light';
  const bgColor = isLight ? 'bg-surface-soft' : 'bg-surface-elevated';
  const textColor = isLight ? 'text-ink' : 'text-on-dark';
  const trendColor = trend?.isPositive ? 'text-accent-light-green' : 'text-accent-danger';
  const iconBgColor = isLight ? 'bg-primary/10' : 'bg-primary/20';
  const iconColor = 'text-primary';
  
  return (
    <Card variant={variant}>
      <CardContent className="flex items-center justify-between py-xxl" variant={variant}>
        <div className="flex-1">
          <p className={`text-body-sm font-medium ${textColor}`}>{title}</p>
          <p className={`mt-3 text-heading-lg font-semibold ${textColor}`}>{value}</p>
          {trend && (
            <p className={`mt-3 text-body-sm ${trendColor}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </p>
          )}
        </div>
        <div className={`ml-4 p-3 ${iconBgColor} rounded-lg`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
