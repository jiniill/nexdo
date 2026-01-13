import type { ComponentType } from 'react';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useTaskStore, useUIStore } from '../../store';

type MenuSeparator = { key: string; separator: true };
type MenuAction = {
  key: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
};
type MenuItem = MenuSeparator | MenuAction;

function shouldAllowNativeContextMenu(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return true;
  if (target.closest('input, textarea, select, [contenteditable="true"]')) return true;
  return false;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function AppContextMenu() {
  const contextMenu = useUIStore((s) => s.contextMenu);
  const openContextMenu = useUIStore((s) => s.openContextMenu);
  const closeContextMenu = useUIStore((s) => s.closeContextMenu);
  const openInspector = useUIStore((s) => s.openInspector);
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const tasks = useTaskStore((s) => s.tasks);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      if (e.shiftKey) return;
      if (shouldAllowNativeContextMenu(e.target)) return;

      e.preventDefault();
      e.stopPropagation();

      const target = e.target instanceof HTMLElement ? e.target : null;
      const taskNode = target?.closest('[data-task-id]') as HTMLElement | null;
      const taskId = taskNode?.dataset.taskId;

      if (taskId) {
        openContextMenu(e.clientX, e.clientY, { kind: 'task', taskId });
      } else {
        openContextMenu(e.clientX, e.clientY, { kind: 'app' });
      }
    };

    window.addEventListener('contextmenu', onContextMenu, { capture: true });
    return () => window.removeEventListener('contextmenu', onContextMenu, { capture: true });
  }, [openContextMenu]);

  useEffect(() => {
    if (!contextMenu.open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeContextMenu();
    };

    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current && menuRef.current.contains(e.target as Node)) return;
      closeContextMenu();
    };

    const onResizeOrScroll = () => closeContextMenu();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('resize', onResizeOrScroll);
    window.addEventListener('scroll', onResizeOrScroll, true);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('resize', onResizeOrScroll);
      window.removeEventListener('scroll', onResizeOrScroll, true);
    };
  }, [closeContextMenu, contextMenu.open]);

  useLayoutEffect(() => {
    if (!contextMenu.open) return;
    if (!menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    const left = clamp(contextMenu.x, 8, window.innerWidth - rect.width - 8);
    const top = clamp(contextMenu.y, 8, window.innerHeight - rect.height - 8);
    menuRef.current.style.left = `${left}px`;
    menuRef.current.style.top = `${top}px`;
    menuRef.current.style.visibility = 'visible';
  }, [contextMenu.open, contextMenu.target, contextMenu.x, contextMenu.y]);

  const items: MenuItem[] = useMemo(() => {
    if (!contextMenu.target) return [];
    if (contextMenu.target.kind === 'app') {
      return [
        {
          key: 'new-task',
          icon: Plus,
          label: '새 태스크',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('nexdo:quick-capture', { detail: { source: 'context-menu' } }));
            closeContextMenu();
          },
        },
      ];
    }

    const taskId = contextMenu.target.taskId;
    const task = tasks[taskId];
    const isDone = task?.statusId === 'done';

    return [
      {
        key: 'open',
        icon: ExternalLink,
        label: '열기',
        onClick: () => {
          openInspector(taskId);
          closeContextMenu();
        },
        disabled: !task,
      },
      {
        key: 'toggle',
        icon: isDone ? Circle : CheckCircle2,
        label: isDone ? '완료 해제' : '완료',
        onClick: () => {
          if (!task) return;
          toggleComplete(task.id);
          closeContextMenu();
        },
        disabled: !task,
      },
      { key: 'sep-1', separator: true } as const,
      {
        key: 'delete',
        icon: Trash2,
        label: '삭제',
        destructive: true,
        onClick: () => {
          if (!task) return;
          deleteTask(task.id);
          closeContextMenu();
        },
        disabled: !task,
      },
    ];
  }, [closeContextMenu, contextMenu.target, deleteTask, openInspector, tasks, toggleComplete]);

  if (!contextMenu.open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        ref={menuRef}
        className="fixed min-w-52 rounded-lg bg-white shadow-xl border border-slate-200 overflow-hidden"
        style={{
          left: contextMenu.x,
          top: contextMenu.y,
          visibility: 'hidden',
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {items.map((item) => {
          if ('separator' in item) {
            return <div key={item.key} className="h-px bg-slate-100 my-1" />;
          }

          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              disabled={item.disabled}
              onClick={item.onClick}
              className={cn(
                'w-full px-3 py-2 text-sm flex items-center gap-2 text-left transition-colors',
                item.destructive
                  ? 'text-red-600 hover:bg-red-50 disabled:text-red-300 disabled:hover:bg-transparent'
                  : 'text-slate-700 hover:bg-slate-50 disabled:text-slate-300 disabled:hover:bg-transparent'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
