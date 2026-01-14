import { useEffect, useMemo, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button, Modal } from '../../ui';
import { cn } from '../../../lib/cn';
import { useProjectStore } from '../../../store';

const COLOR_OPTIONS = [
  { id: 'blue', dot: 'bg-blue-500' },
  { id: 'emerald', dot: 'bg-emerald-500' },
  { id: 'purple', dot: 'bg-purple-500' },
  { id: 'red', dot: 'bg-red-500' },
  { id: 'amber', dot: 'bg-amber-500' },
  { id: 'pink', dot: 'bg-pink-500' },
] as const;

type ProjectColor = (typeof COLOR_OPTIONS)[number]['id'];

function isProtectedProject(projectId: string) {
  return projectId === 'design-system';
}

type Mode = 'create' | 'edit';

export function ProjectEditorModal({
  mode,
  projectId,
  onClose,
  onCreated,
  onDeleted,
}: {
  mode: Mode;
  projectId?: string;
  onClose: () => void;
  onCreated?: (projectId: string) => void;
  onDeleted?: (projectId: string) => void;
}) {
  const project = useProjectStore((s) => (projectId ? s.projects[projectId] : null));
  const addProject = useProjectStore((s) => s.addProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);

  const isEdit = mode === 'edit';
  const locked = useMemo(() => (projectId ? isProtectedProject(projectId) : false), [projectId]);
  const canRender = typeof document !== 'undefined' && (!isEdit || (!!projectId && !!project));

  const [name, setName] = useState(() => (isEdit && project ? project.name : ''));
  const [color, setColor] = useState<ProjectColor>(() => {
    const fromProject = isEdit && project ? (project.color as ProjectColor) : null;
    return fromProject || 'blue';
  });

  useEffect(() => {
    if (!canRender) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (isEdit) {
          if (!projectId || !project) return;
          if (locked) return;
          const trimmed = name.trim();
          if (!trimmed) return;
          updateProject(projectId, { name: trimmed, color });
          onClose();
          return;
        }
        const trimmed = name.trim();
        if (!trimmed) return;
        const id = addProject(trimmed, color);
        onCreated?.(id);
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [addProject, canRender, color, isEdit, locked, name, onClose, onCreated, project, projectId, updateProject]);

  if (!canRender) return null;

  const title = isEdit ? 'Edit project' : 'New project';
  const subtitle = isEdit ? '프로젝트 이름/색상을 수정합니다.' : '새 프로젝트를 추가합니다.';

  const canSubmit = name.trim().length > 0 && (!isEdit || !locked);

  return (
    <Modal
      open={true}
      onClose={onClose}
      containerClassName="pt-[12vh]"
      contentClassName="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: Q2 Growth"
              className={cn(
                'mt-2 w-full rounded-lg border px-3 py-2 text-sm',
                'bg-white border-slate-200 text-slate-900',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                locked && 'opacity-60 cursor-not-allowed'
              )}
              disabled={locked}
              autoFocus
            />
            {locked && (
              <div className="mt-2 text-xs text-slate-500">
                이 프로젝트는 수정/삭제가 제한되어 있습니다.
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Color
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={locked}
                  onClick={() => setColor(opt.id)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                    color === opt.id ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                    locked && 'opacity-60 cursor-not-allowed hover:bg-white'
                  )}
                >
                  <span className={cn('w-2.5 h-2.5 rounded-full', opt.dot)} />
                  {opt.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          {isEdit && (
            <Button
              type="button"
              variant="danger"
              size="md"
              className="rounded-lg"
              disabled={locked}
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => {
                if (!projectId) return;
                if (locked) return;
                if (!confirm('Delete this project? Tasks in this project will be moved to Inbox.')) return;
                deleteProject(projectId);
                onDeleted?.(projectId);
                onClose();
              }}
            >
              Delete
            </Button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button type="button" variant="secondary" size="md" className="rounded-lg" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              className="rounded-lg"
              disabled={!canSubmit}
              onClick={() => {
                const trimmed = name.trim();
                if (!trimmed) return;
                if (isEdit) {
                  if (!projectId || !project) return;
                  if (locked) return;
                  updateProject(projectId, { name: trimmed, color });
                  onClose();
                  return;
                }
                const id = addProject(trimmed, color);
                onCreated?.(id);
                onClose();
              }}
            >
              {isEdit ? 'Save' : 'Create'}
            </Button>
          </div>
        </div>
    </Modal>
  );
}
