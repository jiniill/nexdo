import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { Header } from '../components/layout/Header';
import { PageBody } from '../components/layout/PageBody';
import { EmptyState } from '../components/ui';
import { useProjectStore, useTaskStore, useTimeStore, useUIStore } from '../store';
import { computeTrackedSeconds, formatDurationShort } from '../lib/time';
import { cn } from '../lib/cn';

export default function Reports() {
  const navigate = useNavigate();
  const openInspector = useUIStore((s) => s.openInspector);
  const allTasksMap = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.getAllProjects());
  const sessions = useTimeStore((s) => s.sessions);

  const [nowTick, setNowTick] = useState(() => Date.now());
  const [range, setRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  const hasActiveTracking = useMemo(() => {
    return Object.values(allTasksMap).some((t) => !!t.trackingStartedAt && !t.deletedAt);
  }, [allTasksMap]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasActiveTracking) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [hasActiveTracking]);

  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const rangeWindow = useMemo(() => {
    const now = new Date(nowTick);
    const endMs = nowTick;
    const startMs =
      range === 'today'
        ? startOfDay(now).getTime()
        : range === 'week'
          ? startOfWeek(now, { weekStartsOn: 1 }).getTime()
          : range === 'month'
            ? startOfMonth(now).getTime()
            : 0;
    return { startMs, endMs };
  }, [nowTick, range]);

  const report = useMemo(() => {
    const tasks = Object.values(allTasksMap).filter((t) => !t.deletedAt);

    const sessionsByTaskId = new Map<string, number>();

    if (range !== 'all') {
      const startMs = rangeWindow.startMs;
      const endMs = rangeWindow.endMs;

      sessions.forEach((s) => {
        const startedMs = Date.parse(s.startedAt);
        const endedMs = Date.parse(s.endedAt);
        if (!Number.isFinite(startedMs) || !Number.isFinite(endedMs)) return;
        const overlapStart = Math.max(startMs, startedMs);
        const overlapEnd = Math.min(endMs, endedMs);
        const overlap = Math.max(0, Math.floor((overlapEnd - overlapStart) / 1000));
        if (overlap <= 0) return;
        sessionsByTaskId.set(s.taskId, (sessionsByTaskId.get(s.taskId) ?? 0) + overlap);
      });

      // In-flight tracking time (not yet persisted as a session).
      tasks.forEach((t) => {
        if (!t.trackingStartedAt) return;
        const startedMs = Date.parse(t.trackingStartedAt);
        if (!Number.isFinite(startedMs)) return;
        const overlapStart = Math.max(startMs, startedMs);
        const overlapEnd = endMs;
        const overlap = Math.max(0, Math.floor((overlapEnd - overlapStart) / 1000));
        if (overlap <= 0) return;
        sessionsByTaskId.set(t.id, (sessionsByTaskId.get(t.id) ?? 0) + overlap);
      });
    }

    const rows = tasks
      .map((t) => {
        const trackedSeconds =
          range === 'all' ? computeTrackedSeconds(t, nowTick) : (sessionsByTaskId.get(t.id) ?? 0);
        return {
          task: t,
          trackedSeconds,
          estimatedMinutes: t.estimatedMinutes ?? 0,
        };
      })
      .filter((r) => r.trackedSeconds > 0 || r.estimatedMinutes > 0);

    const totalTrackedSeconds = rows.reduce((acc, r) => acc + r.trackedSeconds, 0);
    const totalEstimatedMinutes = rows.reduce((acc, r) => acc + r.estimatedMinutes, 0);

    const byProject = new Map<
      string,
      { projectId: string; name: string; trackedSeconds: number; estimatedMinutes: number; taskCount: number }
    >();

    rows.forEach((r) => {
      const pid = r.task.projectId ?? 'inbox';
      const name = pid === 'inbox' ? 'Inbox' : (projectById.get(pid)?.name ?? 'Unknown project');
      const prev = byProject.get(pid) ?? { projectId: pid, name, trackedSeconds: 0, estimatedMinutes: 0, taskCount: 0 };
      byProject.set(pid, {
        ...prev,
        trackedSeconds: prev.trackedSeconds + r.trackedSeconds,
        estimatedMinutes: prev.estimatedMinutes + r.estimatedMinutes,
        taskCount: prev.taskCount + 1,
      });
    });

    const projectRows = Array.from(byProject.values()).sort((a, b) => b.trackedSeconds - a.trackedSeconds);

    const topTasks = rows
      .slice()
      .sort((a, b) => b.trackedSeconds - a.trackedSeconds)
      .slice(0, 12);

    const active = tasks.find((t) => !!t.trackingStartedAt) ?? null;

    return { totalTrackedSeconds, totalEstimatedMinutes, projectRows, topTasks, active };
  }, [allTasksMap, nowTick, projectById, range, rangeWindow.endMs, rangeWindow.startMs, sessions]);

  const hasAnyOverall = useMemo(() => {
    const tasks = Object.values(allTasksMap).filter((t) => !t.deletedAt);
    if (sessions.length > 0) return true;
    return tasks.some((t) => (t.trackedSeconds ?? 0) > 0 || !!t.trackingStartedAt || (t.estimatedMinutes ?? 0) > 0);
  }, [allTasksMap, sessions.length]);

  const hasAnyInRange = report.totalTrackedSeconds > 0 || report.totalEstimatedMinutes > 0;
  const rangeLabel = range === 'today' ? 'Today' : range === 'week' ? 'This week' : range === 'month' ? 'This month' : 'All time';

  return (
    <>
      <Header breadcrumbs={[{ label: 'Reports' }]} showViewSwitcher={false} />
      <PageBody>
        {!hasAnyOverall ? (
          <EmptyState title="No data yet" description="Start tracking time or add an estimate to see reports." />
        ) : (
          <div className="px-6 py-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-slate-800">
                  <BarChart3 className="w-5 h-5 text-slate-500" />
                  <h1 className="text-lg font-semibold">Time report</h1>
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {range === 'all'
                    ? 'All-time totals use each task’s tracked total.'
                    : 'Range totals are based on recorded tracking sessions (legacy totals are not backfilled).'
                  }
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-end">
                <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
                  {(['today', 'week', 'month', 'all'] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setRange(k)}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-md border transition-colors',
                        range === k
                          ? 'bg-primary-50 text-primary-700 border-primary-200'
                          : 'bg-white text-slate-600 border-transparent hover:bg-slate-50 hover:border-slate-200'
                      )}
                    >
                      {k === 'today' ? 'Today' : k === 'week' ? 'Week' : k === 'month' ? 'Month' : 'All'}
                    </button>
                  ))}
                </div>

                {report.active && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-green-200 bg-green-50">
                    <Timer className="w-4 h-4 text-green-600" />
                    <div className="text-sm text-slate-700">
                      <span className="font-medium">Tracking:</span>{' '}
                      <span className="tabular-nums text-green-700">
                        {formatDurationShort(computeTrackedSeconds(report.active, nowTick))}
                      </span>
                      <span className="text-slate-400"> · </span>
                      <span className="text-slate-600">{report.active.title}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!hasAnyInRange && (
              <div className="rounded-xl bg-white border border-slate-200 p-4 text-sm text-slate-500">
                No tracked/estimated time in the selected range.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white border border-slate-200 p-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tracked · {rangeLabel}</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
                  {formatDurationShort(report.totalTrackedSeconds)}
                </div>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 p-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
                  {formatDurationShort(report.totalEstimatedMinutes * 60)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-800">By project</div>
                </div>
                <div className="divide-y divide-slate-100">
                  {report.projectRows.map((p) => (
                    <button
                      key={p.projectId}
                      type="button"
                      onClick={() => {
                        if (p.projectId === 'inbox') navigate('/inbox');
                        else navigate(`/project/${p.projectId}`);
                      }}
                      className={cn(
                        'w-full text-left px-4 py-3 flex items-center gap-3',
                        'hover:bg-slate-50 transition-colors'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-800 truncate">{p.name}</div>
                        <div className="text-xs text-slate-500">
                          {p.taskCount} task{p.taskCount === 1 ? '' : 's'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-800 tabular-nums">
                          {formatDurationShort(p.trackedSeconds)}
                        </div>
                        {p.estimatedMinutes > 0 && (
                          <div className="text-[11px] text-slate-500 tabular-nums">
                            est {formatDurationShort(p.estimatedMinutes * 60)}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-800">Top tracked tasks</div>
                </div>
                <div className="divide-y divide-slate-100">
                  {report.topTasks.map((row) => (
                    <button
                      key={row.task.id}
                      type="button"
                      onClick={() => openInspector(row.task.id)}
                      className={cn(
                        'w-full text-left px-4 py-3 flex items-center gap-3',
                        'hover:bg-slate-50 transition-colors'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-slate-800 truncate">{row.task.title}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {(row.task.projectId ? projectById.get(row.task.projectId)?.name : 'Inbox') ?? 'Inbox'}
                        </div>
                      </div>
                      <div
                        className={cn(
                          'text-sm tabular-nums',
                          row.task.trackingStartedAt ? 'text-green-700' : 'text-slate-700'
                        )}
                        title={row.task.trackingStartedAt ? 'Tracking now' : undefined}
                      >
                        {formatDurationShort(row.trackedSeconds)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </PageBody>
    </>
  );
}
