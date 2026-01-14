import { useCallback, useMemo, useRef, useState } from 'react';
import { Settings, LogOut, Moon, Sun, User, CreditCard, HelpCircle, ChevronRight, Database } from 'lucide-react';
import { Avatar } from '../../ui';
import { cn } from '../../../lib/cn';
import { DataManagementModal } from './DataManagementModal';
import { useClickOutside } from '../../../lib/hooks/useClickOutside';

export function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const refs = useMemo(() => [menuRef], []);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  useClickOutside({ refs, onOutside: closeMenu, enabled: isOpen });

  return (
    <div className="p-3 border-t border-slate-200 relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-3 w-full p-2 rounded-lg transition-colors text-left',
          isOpen ? 'bg-slate-100' : 'hover:bg-slate-100'
        )}
      >
        <Avatar name="김개발" showStatus status="online" size="md" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-900 truncate">김개발</div>
          <div className="text-xs text-slate-500 truncate">Pro Plan</div>
        </div>
        <Settings className={cn(
          'w-4 h-4 text-slate-400 transition-transform',
          isOpen && 'rotate-90'
        )} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Profile Section */}
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Avatar name="김개발" size="lg" />
              <div>
                <p className="font-medium text-slate-900">김개발</p>
                <p className="text-xs text-slate-500">kim@example.com</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button className="w-full px-3 py-2 text-sm text-left text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
              <User className="w-4 h-4 text-slate-400" />
              프로필 설정
              <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
            </button>
            <button className="w-full px-3 py-2 text-sm text-left text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
              <CreditCard className="w-4 h-4 text-slate-400" />
              구독 관리
              <span className="ml-auto px-1.5 py-0.5 bg-primary-100 text-primary-600 text-[10px] rounded font-medium">Pro</span>
            </button>
            <button className="w-full px-3 py-2 text-sm text-left text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
              <Settings className="w-4 h-4 text-slate-400" />
              환경설정
              <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setShowDataModal(true);
              }}
              className="w-full px-3 py-2 text-sm text-left text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
            >
              <Database className="w-4 h-4 text-slate-400" />
              데이터 관리
              <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
            </button>
          </div>

          <div className="border-t border-slate-100 py-1">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full px-3 py-2 text-sm text-left text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-slate-400" />
              )}
              다크 모드
              <div className={cn(
                'ml-auto w-8 h-5 rounded-full transition-colors relative',
                isDarkMode ? 'bg-primary-600' : 'bg-slate-200'
              )}>
                <div className={cn(
                  'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                  isDarkMode ? 'translate-x-3.5' : 'translate-x-0.5'
                )} />
              </div>
            </button>
            <button className="w-full px-3 py-2 text-sm text-left text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              도움말
            </button>
          </div>

          <div className="border-t border-slate-100 py-1">
            <button className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      )}

      <DataManagementModal open={showDataModal} onClose={() => setShowDataModal(false)} />
    </div>
  );
}
