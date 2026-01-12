import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  status?: string;
}

export function Breadcrumbs({ items, status }: BreadcrumbsProps) {
  return (
    <div className="flex items-center text-sm text-slate-500 gap-1">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="w-3 h-3" />}
          {item.to ? (
            <Link to={item.to} className="hover:text-slate-800 cursor-pointer">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-slate-900 flex items-center gap-2">
              {item.label}
              {status && (
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
                  {status}
                </span>
              )}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
