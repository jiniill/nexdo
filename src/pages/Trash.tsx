import { useMemo } from 'react';
import { Trash2, RotateCcw, X } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { cn } from '../lib/cn';
import { useTaskStore, useUIStore } from '../store';
import { format, parseISO } from 'date-fns';

export default function Trash() {
  const deletedRootTasks = useTaskStore((s) => s.getDeletedRootTasks());
  const restoreTask = useTaskStore((s) => s.restoreTask);
  const hardDeleteTask = useTaskStore((s) => s.hardDeleteTask);
  const openInspector = useUIStore((s) => s.openInspector);

  const tasks = useMemo(() => {
    const sorted = [...deletedRootTasks];
    sorted.sort((a, b) => (b.deletedAt ?? '').localeCompare(a.deletedAt ?? ''));
    return sorted;
  }, [deletedRootTasks]);

  return (
    <>
      <Header
        breadcrumbs={[{ label: 'Trash' }]}
        showViewSwitcher={false}
      />

      <div className="flex-1 overflow-y-auto bg-white pb-24 scrollbar-thin">
        {tasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 pt-20">
            <div className="text-center">
              <p className="text-lg font-medium">Trash is empty</p>
              <p className="text-sm">Deleted tasks will show up here</p>
            </div>
          </div>
        ) : (
          <div className="px-6 py-4 space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'rounded-lg border border-slate-200 bg-white',
                  'hover:border-slate-300 hover:bg-slate-50/40 transition-colors'
                )}
              >
                <button
                  type="button"
                  onClick={() => openInspector(task.id)}
                  className="w-full px-4 py-3 flex items-start gap-3 text-left"
                >
                  <div className="mt-0.5 text-slate-400">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{task.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>
                        Deleted{' '}
                        {task.deletedAt ? format(parseISO(task.deletedAt), 'yyyy-MM-dd HH:mm') : ''}
                      </span>
                      {task.childIds.length > 0 && (
                        <span className="text-slate-400">• {task.childIds.length} subtask(s)</span>
                      )}
                    </div>
                  </div>
                </button>

                <div className="px-4 pb-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => restoreTask(task.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirm('Permanently delete this task and all its subtasks?')) return;
                      hardDeleteTask(task.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
                  >
                    <X className="w-3.5 h-3.5" />
                    Delete forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

