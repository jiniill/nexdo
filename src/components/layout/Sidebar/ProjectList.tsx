import { Link, useLocation, useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { useProjectStore } from '../../../store';

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

  return (
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
            {project.id === 'design-system' && (
              <Lock className="w-3 h-3 text-slate-400 ml-auto" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
