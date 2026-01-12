import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../lib/cn';
import type { LucideIcon } from 'lucide-react';

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  iconColor?: string;
}

export function NavLink({ to, icon: Icon, label, badge, iconColor }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 px-2 py-1.5 rounded-md text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary-50 text-primary-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      <Icon
        className={cn(
          'w-4 h-4',
          isActive ? 'text-primary-600' : iconColor || 'text-slate-400'
        )}
      />
      {label}
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            'ml-auto text-xs font-bold px-1.5 py-0.5 rounded',
            isActive
              ? 'bg-primary-200/50 text-primary-800'
              : 'text-slate-400'
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
