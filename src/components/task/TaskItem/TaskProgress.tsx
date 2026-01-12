interface TaskProgressProps {
  completed: number;
  total: number;
}

export function TaskProgress({ completed, total }: TaskProgressProps) {
  if (total === 0) return null;

  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="flex items-center gap-2 mt-0.5">
      <div className="h-1 w-16 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-400">
        {completed}/{total} Subtasks
      </span>
    </div>
  );
}
