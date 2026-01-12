import { MoreHorizontal, X } from 'lucide-react';
import { Button } from '../../ui';
import { useUIStore, useTaskStore } from '../../../store';

export function InspectorHeader() {
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);
  const closeInspector = useUIStore((s) => s.closeInspector);
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const task = useTaskStore((s) => (selectedTaskId ? s.tasks[selectedTaskId] : null));

  const isCompleted = task?.statusId === 'done';

  return (
    <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Button
          variant={isCompleted ? 'secondary' : 'success'}
          size="sm"
          onClick={() => selectedTaskId && toggleComplete(selectedTaskId)}
        >
          {isCompleted ? 'Reopen' : 'Mark Complete'}
        </Button>
        <button className="text-slate-400 hover:text-slate-600 p-1">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <button
        onClick={closeInspector}
        className="text-slate-400 hover:text-slate-600 p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
