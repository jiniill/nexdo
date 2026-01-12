import { Send } from 'lucide-react';
import { Avatar } from '../../ui';
import { useUIStore, useTaskStore } from '../../../store';
import { format, parseISO } from 'date-fns';

export function ActivityFeed() {
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);
  const task = useTaskStore((s) => (selectedTaskId ? s.tasks[selectedTaskId] : null));

  if (!task) return null;

  // 임시 활동 데이터
  const activities = [
    {
      id: '1',
      user: { name: 'Kim' },
      action: 'changed status to',
      value: 'In Progress',
      valueColor: 'text-amber-600',
      timestamp: task.updatedAt,
    },
  ];

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        Activity
      </h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <Avatar name={activity.user.name} size="sm" className="mt-0.5" />
            <div>
              <div className="text-sm">
                <span className="font-medium text-slate-900">
                  {activity.user.name}
                </span>{' '}
                <span className="text-slate-500">{activity.action}</span>{' '}
                <span className={`font-medium ${activity.valueColor}`}>
                  {activity.value}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {format(parseISO(activity.timestamp), 'MMM d, h:mm a')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommentInput() {
  return (
    <div className="p-4 border-t border-slate-200 bg-slate-50">
      <div className="relative">
        <input
          type="text"
          placeholder="Leave a comment..."
          className="w-full pl-3 pr-10 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
