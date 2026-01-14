import { Inbox, Calendar, Zap, User, Clock, Trash2, BarChart3 } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { useUIStore, useTaskStore } from '../../../store';
import { SidebarHeader } from './SidebarHeader';
import { QuickCapture } from './QuickCapture';
import { NavSection } from './NavSection';
import { NavLink } from './NavLink';
import { ProjectList } from './ProjectList';
import { UserProfile } from './UserProfile';
import { useState } from 'react';
import { ProjectEditorModal } from './ProjectEditorModal';
import { useNavigate } from 'react-router-dom';

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const inboxCount = useTaskStore((s) => s.getInboxTasks().length);
  const todayCount = useTaskStore((s) => s.getTodayTasks().length);
  const trashCount = useTaskStore((s) => s.getDeletedRootTasks().length);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const navigate = useNavigate();

  if (collapsed) {
    return null;
  }

  return (
    <aside
      className={cn(
        'w-64 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0 transition-all duration-300'
      )}
    >
      <SidebarHeader />

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-thin">
        {/* Favorites */}
        <NavSection title="Favorites">
          <NavLink to="/inbox" icon={Inbox} label="Inbox" badge={inboxCount} />
          <NavLink
            to="/today"
            icon={Calendar}
            label="오늘 할 일"
            badge={todayCount}
          />
          <NavLink
            to="/urgent"
            icon={Zap}
            label="긴급 / 중요"
            iconColor="text-amber-500"
          />
        </NavSection>

        {/* Projects */}
        <NavSection title="Projects" onAdd={() => setCreateProjectOpen(true)}>
          <ProjectList />
        </NavSection>

        {/* Filters */}
        <NavSection title="Filters">
          <NavLink to="/assigned" icon={User} label="Assigned to me" />
          <NavLink to="/overdue" icon={Clock} label="Overdue" />
          <NavLink to="/reports" icon={BarChart3} label="Reports" />
          <NavLink to="/trash" icon={Trash2} label="Trash" badge={trashCount || undefined} />
        </NavSection>
      </div>

      <div className="px-3 pb-3">
        <QuickCapture />
      </div>

      <UserProfile />

      {createProjectOpen && (
        <ProjectEditorModal
          mode="create"
          onClose={() => setCreateProjectOpen(false)}
          onCreated={(projectId) => navigate(`/project/${projectId}`)}
        />
      )}
    </aside>
  );
}
