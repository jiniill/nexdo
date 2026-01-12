import { CalendarClock } from 'lucide-react';
import { Avatar, StatusBadge } from '../../ui';
import { cn } from '../../../lib/cn';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

interface TaskMetaProps {
  assignee?: { name: string; avatarUrl?: string };
  dueDate?: string;
  statusId: string;
  statusName: string;
  statusColor?: string;
}

function formatDueDate(dateStr: string): { text: string; isOverdue: boolean } {
  const date = parseISO(dateStr);

  if (isToday(date)) {
    return { text: 'Today', isOverdue: isPast(date) };
  }
  if (isTomorrow(date)) {
    return { text: 'Tomorrow', isOverdue: false };
  }
  if (isPast(date)) {
    return { text: format(date, 'MMM d'), isOverdue: true };
  }
  return { text: format(date, 'MMM d'), isOverdue: false };
}

export function TaskMeta({
  assignee,
  dueDate,
  statusId,
  statusName,
  statusColor,
}: TaskMetaProps) {
  const dueDateInfo = dueDate ? formatDueDate(dueDate) : null;

  return (
    <div className="flex items-center gap-4 text-sm text-slate-500">
      {assignee && (
        <div className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200/50 transition-colors">
          <Avatar src={assignee.avatarUrl} name={assignee.name} size="sm" />
          <span className="text-xs">{assignee.name}</span>
        </div>
      )}

      {dueDateInfo && (
        <div
          className={cn(
            'flex items-center gap-1 font-medium',
            dueDateInfo.isOverdue ? 'text-red-500' : 'text-slate-500'
          )}
        >
          <CalendarClock className="w-3.5 h-3.5" />
          <span className="text-xs">{dueDateInfo.text}</span>
        </div>
      )}

      {statusId !== 'done' && (
        <StatusBadge
          statusId={statusId}
          statusName={statusName}
          color={statusColor}
        />
      )}
    </div>
  );
}
