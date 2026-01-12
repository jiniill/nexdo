import { useState } from 'react';
import { Circle, CheckCircle2, Plus } from 'lucide-react';
import { useTaskStore, useUIStore } from '../../../store';
import { cn } from '../../../lib/cn';

export function SubtaskList() {
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);
  const task = useTaskStore((s) => (selectedTaskId ? s.tasks[selectedTaskId] : null));
  const tasks = useTaskStore((s) => s.tasks);
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const addTask = useTaskStore((s) => s.addTask);

  const [newSubtask, setNewSubtask] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!task) return null;

  const subtasks = task.childIds.map((id) => tasks[id]).filter(Boolean);
  const completedCount = subtasks.filter((t) => t.statusId === 'done').length;

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      addTask(newSubtask.trim(), { parentId: task.id, projectId: task.projectId });
      setNewSubtask('');
      setIsAdding(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Subtasks
        </h3>
        <span className="text-xs text-slate-400">
          {completedCount}/{subtasks.length}
        </span>
      </div>

      <div className="space-y-1">
        {subtasks.map((subtask) => {
          const isCompleted = subtask.statusId === 'done';
          return (
            <div
              key={subtask.id}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded group cursor-pointer"
              onClick={() => toggleComplete(subtask.id)}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-primary-500" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 group-hover:text-primary-500" />
              )}
              <span
                className={cn(
                  'text-sm',
                  isCompleted ? 'text-slate-500 line-through' : 'text-slate-700'
                )}
              >
                {subtask.title}
              </span>
            </div>
          );
        })}

        {isAdding ? (
          <div className="flex items-center gap-2 p-1.5">
            <Circle className="w-4 h-4 text-slate-300" />
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSubtask();
                if (e.key === 'Escape') {
                  setNewSubtask('');
                  setIsAdding(false);
                }
              }}
              onBlur={() => {
                if (!newSubtask.trim()) setIsAdding(false);
              }}
              placeholder="Subtask title"
              className="flex-1 text-sm bg-transparent border-none focus:outline-none"
              autoFocus
            />
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 p-1.5 text-slate-400 hover:text-slate-600 text-sm mt-1"
          >
            <Plus className="w-4 h-4" />
            Add subtask
          </button>
        )}
      </div>
    </div>
  );
}
