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
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(task?.description || '');

  if (!task) return null;

  const handleTitleSave = () => {
    if (title.trim() && title !== task.title) {
      updateTask(task.id, { title: title.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSave = () => {
    const trimmed = description.trim();
    const next = trimmed.length > 0 ? trimmed : undefined;

    if (next !== task.description) {
      updateTask(task.id, { description: next });
    }
    setIsEditingDescription(false);
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
      {isEditingDescription ? (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionSave}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setDescription(task.description || '');
              setIsEditingDescription(false);
            }
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleDescriptionSave();
            }
          }}
          placeholder="Add a description..."
          rows={3}
          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none placeholder:text-slate-400"
          autoFocus
        />
      ) : (
        <p
          onClick={() => {
            setDescription(task.description || '');
            setIsEditingDescription(true);
          }}
          className="text-sm text-slate-600 cursor-text hover:bg-slate-50 rounded px-1 -mx-1 whitespace-pre-wrap"
        >
          {task.description ? (
            task.description
          ) : (
            <span className="text-slate-400 italic">Add a description...</span>
          )}
        </p>
      )}
    </div>
  );
}
