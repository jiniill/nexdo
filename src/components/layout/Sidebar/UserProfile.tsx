import { Settings } from 'lucide-react';
import { Avatar } from '../../ui';

export function UserProfile() {
  return (
    <div className="p-3 border-t border-slate-200">
      <button className="flex items-center gap-3 w-full p-2 hover:bg-slate-100 rounded-lg transition-colors text-left">
        <Avatar name="김개발" showStatus status="online" size="md" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-900 truncate">김개발</div>
          <div className="text-xs text-slate-500 truncate">Pro Plan</div>
        </div>
        <Settings className="w-4 h-4 text-slate-400" />
      </button>
    </div>
  );
}
