import { useState } from 'react';
import { useTaskStore, useUIStore, useProjectStore } from '../../../store';

export function TaskDetails() {
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);
  const task = useTaskStore((s) => (selectedTaskId ? s.tasks[selectedTaskId] : null));
  const updateTask = useTaskStore((s) => s.updateTask);
  const project = useProjectStore((s) =>
    task?.projectId ? s.projects[task.projectId] : null
  );

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(task?.title || '');

  if (!task) return null;

  const handleTitleSave = () => {
    if (title.trim() && title !== task.title) {
      updateTask(task.id, { title: title.trim() });
    }
    setIsEditingTitle(false);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
        {project ? `Projects / ${project.name}` : 'Inbox'}
      </div>

      {/* Title */}
      {isEditingTitle ? (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTitleSave();
            if (e.key === 'Escape') {
              setTitle(task.title);
              setIsEditingTitle(false);
            }
          }}
          className="text-xl font-bold text-slate-900 leading-tight mb-2 w-full bg-transparent border-b-2 border-primary-500 focus:outline-none"
          autoFocus
        />
      ) : (
        <h2
          onClick={() => {
            setTitle(task.title);
            setIsEditingTitle(true);
          }}
          className="text-xl font-bold text-slate-900 leading-tight mb-2 cursor-text hover:bg-slate-50 rounded px-1 -mx-1"
        >
          {task.title}
        </h2>
      )}

      {/* Description */}
      <p className="text-sm text-slate-600">
        {task.description || (
          <span className="text-slate-400 italic">Add a description...</span>
        )}
      </p>
    </div>
  );
}
