import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Lock, MoreHorizontal } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { useProjectStore } from '../../../store';
import { useMemo, useState } from 'react';
import { ProjectEditorModal } from './ProjectEditorModal';

const colorDots: Record<string, string> = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  pink: 'bg-pink-500',
};

export function ProjectList() {
  const projects = useProjectStore((s) => s.getAllProjects());
  const { projectId: currentProjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [editProjectId, setEditProjectId] = useState<string | null>(null);

  const activeProjectId = useMemo(() => (currentProjectId ? String(currentProjectId) : null), [currentProjectId]);

  return (
    <>
      <div className="space-y-0.5">
        {projects.map((project) => {
          const isActive =
            location.pathname === `/project/${project.id}` ||
            currentProjectId === project.id;

          return (
            <Link
              key={project.id}
              to={`/project/${project.id}`}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors group',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  colorDots[project.color] || 'bg-slate-400'
                )}
              />
              <span className="truncate">{project.name}</span>

              {project.id === 'design-system' ? (
                <Lock className="w-3 h-3 text-slate-400 ml-auto" />
              ) : (
                <button
                  type="button"
                  className={cn(
                    'ml-auto p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white/70 transition-colors',
                    'opacity-0 group-hover:opacity-100'
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditProjectId(project.id);
                  }}
                  aria-label="Edit project"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              )}
            </Link>
          );
        })}
      </div>

      {editProjectId && (
        <ProjectEditorModal
          mode="edit"
          projectId={editProjectId}
          onClose={() => setEditProjectId(null)}
          onDeleted={(projectId) => {
            if (activeProjectId === projectId) {
              navigate('/');
            }
          }}
        />
      )}
    </>
  );
}
