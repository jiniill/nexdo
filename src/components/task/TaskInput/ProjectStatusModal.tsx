import { useEffect, useMemo, useState } from 'react';
import { Plus, X, ChevronUp, ChevronDown, Trash2, RotateCcw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../../../lib/cn';
import { useProjectStore, useTaskStore } from '../../../store';
import { DEFAULT_STATUSES, type Status } from '../../../types';
import { Modal } from '../../ui';

const COLOR_OPTIONS: Status['color'][] = ['slate', 'blue', 'amber', 'red', 'purple', 'green'];

function normalizeOrders(statuses: Status[]): Status[] {
  const sorted = [...statuses].sort((a, b) => a.order - b.order);
  return sorted.map((s, idx) => ({ ...s, order: idx }));
}

export function ProjectStatusModal({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const project = useProjectStore((s) => s.projects[projectId]);
  const updateProject = useProjectStore((s) => s.updateProject);
  const ensureProjectStatusIds = useTaskStore((s) => s.ensureProjectStatusIds);

  const initialStatuses = useMemo(() => normalizeOrders(project?.statuses ?? DEFAULT_STATUSES), [project?.statuses]);
  const [draft, setDraft] = useState<Status[]>(initialStatuses);

  useEffect(() => {
    setDraft(initialStatuses);
  }, [initialStatuses]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, projectId]);

  if (!project) return null;

  const statuses = normalizeOrders(draft);
  const doneIds = new Set(statuses.filter((s) => s.isDone).map((s) => s.id));

  const handleSave = () => {
    const next = normalizeOrders(draft);
    const validIds = next.map((s) => s.id);
    const fallback = next[0]?.id ?? 'todo';

    updateProject(projectId, { statuses: next });
    ensureProjectStatusIds(projectId, validIds, fallback);
    onClose();
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      containerClassName="pt-[12vh]"
      contentClassName="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Statuses</div>
            <div className="text-xs text-slate-500 mt-0.5">{project.name} 프로젝트의 상태 컬럼</div>
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

        <div className="p-5">
          <div className="space-y-2">
            {statuses.map((s, idx) => {
              const canMoveUp = idx > 0;
              const canMoveDown = idx < statuses.length - 1;
              const canDelete = statuses.length > 1 && !doneIds.has(s.id);

              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      disabled={!canMoveUp}
                      onClick={() => {
                        const next = [...statuses];
                        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                        setDraft(normalizeOrders(next));
                      }}
                      className={cn(
                        'p-1 rounded-md border',
                        canMoveUp ? 'border-slate-200 hover:bg-slate-50 text-slate-500' : 'border-slate-100 text-slate-200'
                      )}
                      aria-label="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={!canMoveDown}
                      onClick={() => {
                        const next = [...statuses];
                        [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                        setDraft(normalizeOrders(next));
                      }}
                      className={cn(
                        'p-1 rounded-md border',
                        canMoveDown ? 'border-slate-200 hover:bg-slate-50 text-slate-500' : 'border-slate-100 text-slate-200'
                      )}
                      aria-label="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                    <div className="text-xs font-medium text-slate-500 min-w-10">#{s.order}</div>
                    <input
                      value={s.name}
                      onChange={(e) => {
                        const next = statuses.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x));
                        setDraft(next);
                      }}
                      className="flex-1 min-w-0 text-sm border-none bg-transparent focus:outline-none"
                    />
                    <select
                      value={s.color}
                      onChange={(e) => {
                        const next = statuses.map((x) =>
                          x.id === s.id ? { ...x, color: e.target.value as Status['color'] } : x
                        );
                        setDraft(next);
                      }}
                      className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-600"
                    >
                      {COLOR_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    {doneIds.has(s.id) && (
                      <span className="text-[10px] font-semibold px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200">
                        DONE
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!canDelete}
                    onClick={() => {
                      const next = statuses.filter((x) => x.id !== s.id);
                      setDraft(normalizeOrders(next));
                    }}
                    className={cn(
                      'p-2 rounded-md border',
                      canDelete
                        ? 'border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-700'
                        : 'border-slate-100 text-slate-200'
                    )}
                    aria-label="Delete status"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setDraft(normalizeOrders(DEFAULT_STATUSES));
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to default
            </button>

            <button
              type="button"
              onClick={() => {
                const id = `status-${uuidv4().slice(0, 8)}`;
                setDraft(
                  normalizeOrders([
                    ...statuses,
                    { id, name: 'New status', color: 'slate', order: statuses.length },
                  ])
                );
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            >
              <Plus className="w-4 h-4" />
              Add status
            </button>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold rounded-md bg-primary-600 hover:bg-primary-700 text-white"
          >
            Save
          </button>
        </div>
    </Modal>
  );
}
