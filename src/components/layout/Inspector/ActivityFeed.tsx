import { useState } from 'react';
import { Send } from 'lucide-react';
import { Avatar } from '../../ui';
import { useActivityStore, useProjectStore, useUIStore, useTaskStore, useUserStore } from '../../../store';
import { format, parseISO } from 'date-fns';
import { cn } from '../../../lib/cn';
import { DEFAULT_STATUSES } from '../../../types';

export function ActivityFeed() {
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);
  const task = useTaskStore((s) => (selectedTaskId ? s.tasks[selectedTaskId] : null));
  const project = useProjectStore((s) => (task?.projectId ? s.projects[task.projectId] : null));
  const currentUserId = useUserStore((s) => s.currentUserId);
  const getUserById = useUserStore((s) => s.getUserById);
  const activities = useActivityStore((s) => (selectedTaskId ? s.getTaskActivities(selectedTaskId) : []));
  const addComment = useActivityStore((s) => s.addComment);

  if (!task) return null;

  const statuses = project?.statuses ?? DEFAULT_STATUSES;
  const getStatusName = (statusId: string) => statuses.find((s) => s.id === statusId)?.name ?? statusId;

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        Activity
      </h3>

      {activities.length === 0 ? (
        <div className="text-sm text-slate-400 bg-slate-50 border border-slate-100 rounded-lg p-3">
          아직 활동이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const user = getUserById(activity.actorUserId);
            const actorName = user?.name ?? activity.actorUserId;

            return (
              <div key={activity.id} className="flex gap-3">
                <Avatar name={actorName} size="sm" className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  {activity.type === 'comment' ? (
                    <>
                      <div className="text-sm font-medium text-slate-900">
                        {actorName}
                      </div>
                      <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100 whitespace-pre-wrap">
                        {activity.content}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex gap-2">
                        <span>{format(parseISO(activity.createdAt), 'MMM d, h:mm a')}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm">
                        <span className="font-medium text-slate-900">{actorName}</span>{' '}
                        <span className="text-slate-500">
                          {activity.type === 'created' && 'created this task'}
                          {activity.type === 'completed' && 'completed this task'}
                          {activity.type === 'reopened' && 'reopened this task'}
                          {activity.type === 'status_change' && 'changed status'}
                          {activity.type === 'updated' && 'updated task'}
                        </span>
                        {activity.type === 'status_change' && activity.toStatusId && (
                          <span className="text-slate-900 font-medium"> → {getStatusName(activity.toStatusId)}</span>
                        )}
                      </div>
                      {activity.type === 'updated' && activity.content && (
                        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-2 mt-1 whitespace-pre-wrap">
                          {activity.content}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {format(parseISO(activity.createdAt), 'MMM d, h:mm a')}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CommentInput
        onSubmit={(content) => {
          if (!selectedTaskId) return;
          addComment(selectedTaskId, currentUserId, content);
        }}
      />
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
