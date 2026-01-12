import { useState } from 'react';
import { Send } from 'lucide-react';
import { Avatar } from '../../ui';
import { useUIStore, useTaskStore } from '../../../store';
import { format, parseISO } from 'date-fns';
import { cn } from '../../../lib/cn';

interface Activity {
  id: string;
  type: 'status' | 'comment';
  user: { name: string };
  action?: string;
  value?: string;
  valueColor?: string;
  content?: string;
  timestamp: string;
}

export function ActivityFeed() {
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);
  const task = useTaskStore((s) => (selectedTaskId ? s.tasks[selectedTaskId] : null));
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'status',
      user: { name: 'Kim' },
      action: 'changed status to',
      value: 'In Progress',
      valueColor: 'text-amber-600',
      timestamp: '2025-01-12T00:00:00.000Z',
    },
    {
      id: '2',
      type: 'comment',
      user: { name: 'Park' },
      content: '@Kim 현재 DB 커넥션 풀 설정 확인해봤는데, max connection을 좀 더 늘려야 할 것 같아.',
      timestamp: '2025-01-11T23:00:00.000Z',
    },
  ]);

  const addComment = (content: string) => {
    const newComment: Activity = {
      id: Date.now().toString(),
      type: 'comment',
      user: { name: '김개발' },
      content,
      timestamp: new Date().toISOString(),
    };
    setActivities(prev => [newComment, ...prev]);
  };

  if (!task) return null;

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        Activity
      </h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <Avatar name={activity.user.name} size="sm" className="mt-0.5" />
            <div className="flex-1 min-w-0">
              {activity.type === 'status' ? (
                <>
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
                </>
              ) : (
                <>
                  <div className="text-sm font-medium text-slate-900">
                    {activity.user.name}
                  </div>
                  <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100">
                    {activity.content}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex gap-2">
                    <span>{format(parseISO(activity.timestamp), 'MMM d, h:mm a')}</span>
                    <button className="hover:text-slate-600 transition-colors">Reply</button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <CommentInput onSubmit={addComment} />
    </div>
  );
}

interface CommentInputProps {
  onSubmit?: (content: string) => void;
}

export function CommentInput({ onSubmit }: CommentInputProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (value.trim() && onSubmit) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn(
      'mt-4 p-3 rounded-lg border transition-all',
      isFocused
        ? 'bg-white border-primary-300 ring-2 ring-primary-100'
        : 'bg-slate-50 border-slate-200'
    )}>
      <div className="flex items-start gap-2">
        <Avatar name="김개발" size="sm" className="mt-0.5" />
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="댓글 남기기..."
            className="w-full text-sm bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-slate-400"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            value.trim()
              ? 'text-primary-600 hover:bg-primary-50'
              : 'text-slate-300'
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
