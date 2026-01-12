import { useUIStore } from '../../../store';
import { InspectorHeader } from './InspectorHeader';
import { TaskDetails } from './TaskDetails';
import { PropertyGrid } from './PropertyGrid';
import { SubtaskList } from './SubtaskList';
import { ActivityFeed } from './ActivityFeed';

export function Inspector() {
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);

  if (!selectedTaskId) return null;

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col flex-shrink-0">
      <InspectorHeader />

      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
        <TaskDetails />

        <PropertyGrid />

        <hr className="border-slate-100" />

        <SubtaskList />

        <hr className="border-slate-100" />

        <ActivityFeed />
      </div>
    </aside>
  );
}
