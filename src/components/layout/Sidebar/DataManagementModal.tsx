import { useMemo, useState } from 'react';
import { Download, Upload, X, RotateCcw } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { Button, Modal } from '../../ui';
import { useActivityStore, useProjectStore, useTaskStore, useTimeStore, useUIStore, useUserStore } from '../../../store';
import { activityRepository, projectRepository, taskRepository, timeRepository, uiRepository, userRepository } from '../../../data/repositories';

type ExportBundleBase = {
  exportedAt: string;
  tasks: ReturnType<typeof taskRepository.load>;
  projects: ReturnType<typeof projectRepository.load>;
  activities: ReturnType<typeof activityRepository.load>;
  users: ReturnType<typeof userRepository.load>;
  ui: ReturnType<typeof uiRepository.load>;
};

type ExportBundleV1 = ExportBundleBase & {
  version: 1;
};

type ExportBundleV2 = ExportBundleBase & {
  version: 2;
  time: ReturnType<typeof timeRepository.load>;
};

type ExportBundle = ExportBundleV1 | ExportBundleV2;

function safeJsonParse(value: string): { ok: true; data: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(value) as unknown };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function DataManagementModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'export' | 'import'>('export');
  const [exportText, setExportText] = useState('');
  const [importText, setImportText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const filename = useMemo(() => {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    return `nexdo-backup-${ts}.json`;
  }, []);

  const handleExport = () => {
    const bundle: ExportBundleV2 = {
      version: 2,
      exportedAt: new Date().toISOString(),
      tasks: taskRepository.load(),
      projects: projectRepository.load(),
      activities: activityRepository.load(),
      users: userRepository.load(),
      ui: uiRepository.load(),
      time: timeRepository.load(),
    };
    const text = JSON.stringify(bundle, null, 2);
    setExportText(text);
    setError(null);
  };

  const applyImportedState = (bundle: ExportBundle) => {
    // Minimal sanitation: drop root IDs that don't exist.
    const tasks = bundle.tasks;
    const taskIds = new Set(Object.keys(tasks.tasks ?? {}));
    const rootTaskIds = Array.isArray(tasks.rootTaskIds) ? tasks.rootTaskIds.filter((id) => taskIds.has(id)) : [];

    useTaskStore.setState({ tasks: tasks.tasks ?? {}, rootTaskIds });
    useProjectStore.setState({ projects: bundle.projects.projects ?? {} });
    useActivityStore.setState({ activitiesByTaskId: bundle.activities.activitiesByTaskId ?? {} });
    useTimeStore.setState({ sessions: bundle.version === 2 ? bundle.time.sessions ?? [] : [] });
    const users = bundle.users.users ?? {};
    const importedCurrent = bundle.users.currentUserId ?? null;
    const currentUserId =
      (importedCurrent && users[importedCurrent] ? importedCurrent : Object.keys(users)[0]) ?? 'me';
    useUserStore.setState({ users, currentUserId });
    useUIStore.setState({
      sidebarCollapsed: bundle.ui.sidebarCollapsed ?? false,
      viewMode: bundle.ui.viewMode ?? 'list',
      collapsedSections: bundle.ui.collapsedSections ?? {},
      taskStatusFilters: bundle.ui.taskStatusFilters ?? [],
      taskPriorityFilters: bundle.ui.taskPriorityFilters ?? [],
      taskAssigneeFilter: bundle.ui.taskAssigneeFilter ?? null,
      taskSort: bundle.ui.taskSort ?? 'due-date',
      inspectorOpen: false,
      selectedTaskId: null,
      contextMenu: { open: false, x: 0, y: 0, target: null },
      draggingTask: null,
    });
  };

  const handleImport = () => {
    setError(null);
    const parsed = safeJsonParse(importText);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }

    const data = parsed.data as Partial<ExportBundle>;
    if (data.version !== 1 && data.version !== 2) {
      setError('Unsupported backup version.');
      return;
    }
    if (!data.tasks || !data.projects || !data.activities || !data.users || !data.ui) {
      setError('Missing required keys in backup.');
      return;
    }

    if (!confirm('Import will overwrite your current local data. Continue?')) return;

    applyImportedState(data as ExportBundle);
    setImportText('');
    setError(null);
    onClose();
  };

  const handleReset = () => {
    if (!confirm('Reset to default sample data? This will overwrite your current local data.')) return;
    localStorage.removeItem('nexdo-tasks');
    localStorage.removeItem('nexdo-projects');
    localStorage.removeItem('nexdo-activities');
    localStorage.removeItem('nexdo-time-sessions');
    localStorage.removeItem('nexdo-users');
    localStorage.removeItem('nexdo-ui');
    window.location.reload();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      containerClassName="pt-[12vh]"
      contentClassName="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">Data</div>
          <div className="text-xs text-slate-500 mt-0.5">내보내기/가져오기 (localStorage)</div>
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

      <div className="px-5 pt-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('export')}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg border transition-colors',
              tab === 'export'
                ? 'bg-primary-50 text-primary-700 border-primary-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            )}
          >
            Export
          </button>
          <button
            type="button"
            onClick={() => setTab('import')}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg border transition-colors',
              tab === 'import'
                ? 'bg-primary-50 text-primary-700 border-primary-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            )}
          >
            Import
          </button>

          <div className="ml-auto">
            <Button type="button" variant="secondary" size="sm" icon={<RotateCcw className="w-4 h-4" />} onClick={handleReset}>
              Reset sample
            </Button>
          </div>
        </div>
      </div>

      <div className="p-5">
        {tab === 'export' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button type="button" variant="primary" size="md" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
                Generate
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={!exportText}
                onClick={() => exportText && downloadText(filename, exportText)}
              >
                Download
              </Button>
              <span className="ml-auto text-xs text-slate-500">{filename}</span>
            </div>
            <textarea
              value={exportText}
              readOnly
              rows={14}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              placeholder="Click Generate to create a backup JSON."
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button type="button" variant="primary" size="md" icon={<Upload className="w-4 h-4" />} onClick={handleImport}>
                Import (overwrite)
              </Button>
              <div className="text-xs text-slate-500">Paste backup JSON then import.</div>
            </div>
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={14}
              className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              placeholder="Paste JSON here..."
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
