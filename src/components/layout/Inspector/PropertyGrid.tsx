import { Calendar, Timer, Flag } from 'lucide-react';
import { useTaskStore, useUIStore } from '../../../store';
import { Avatar, StatusBadge } from '../../ui';
import { DEFAULT_STATUSES, PRIORITY_CONFIG } from '../../../types';
import { format, parseISO } from 'date-fns';

export function PropertyGrid() {
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);
  const task = useTaskStore((s) => (selectedTaskId ? s.tasks[selectedTaskId] : null));

  if (!task) return null;

  const status = DEFAULT_STATUSES.find((s) => s.id === task.statusId) || DEFAULT_STATUSES[0];
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-sm">
      {/* Status */}
      <div className="text-slate-500 font-medium col-span-1 py-1">Status</div>
      <div className="col-span-2">
        <StatusBadge
          statusId={status.id}
          statusName={status.name}
          color={status.color}
          className="cursor-pointer hover:opacity-80"
        />
      </div>

      {/* Priority */}
      <div className="text-slate-500 font-medium col-span-1 py-1">Priority</div>
      <div className="col-span-2">
        {task.priority !== 'none' ? (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border ${priorityConfig.bg} ${priorityConfig.text}`}
          >
            <Flag className="w-3 h-3" />
            {priorityConfig.label}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">No priority</span>
        )}
      </div>

      {/* Assignees */}
      <div className="text-slate-500 font-medium col-span-1 py-1">Assignees</div>
      <div className="col-span-2 flex items-center gap-2">
        {task.assigneeIds.length > 0 ? (
          task.assigneeIds.map((id) => (
            <Avatar key={id} name={id} size="sm" />
          ))
        ) : (
          <button className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-primary-500 hover:border-primary-500">
            <span className="text-lg leading-none">+</span>
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="text-slate-500 font-medium col-span-1 py-1">Timeline</div>
      <div className="col-span-2 flex flex-col gap-1">
        {task.dueDate ? (
          <div className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{format(parseISO(task.dueDate), 'MMM d, yyyy')}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">No due date</span>
        )}
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <Timer className="w-3.5 h-3.5 text-slate-400" />
          <span>Est. -- / Tracked --</span>
        </div>
      </div>
    </div>
  );
}
