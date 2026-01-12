export interface Status {
  id: string;
  name: string;
  color: string;
  order: number;
  isDefault?: boolean;
  isDone?: boolean;
}

export const DEFAULT_STATUSES: Status[] = [
  { id: 'todo', name: 'Todo', color: 'slate', order: 0, isDefault: true },
  { id: 'in-progress', name: 'In Progress', color: 'amber', order: 1 },
  { id: 'blocked', name: 'Blocked', color: 'red', order: 2 },
  { id: 'review', name: 'Review', color: 'purple', order: 3 },
  { id: 'done', name: 'Done', color: 'green', order: 4, isDone: true },
];

export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  slate: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  red: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  green: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
};

export const PRIORITY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  urgent: { label: 'Urgent', bg: 'bg-red-100', text: 'text-red-700' },
  high: { label: 'P1', bg: 'bg-amber-100', text: 'text-amber-700' },
  medium: { label: 'P2', bg: 'bg-blue-100', text: 'text-blue-700' },
  low: { label: 'P3', bg: 'bg-slate-100', text: 'text-slate-600' },
  none: { label: '', bg: '', text: '' },
};
