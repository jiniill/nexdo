import { useCallback, useLayoutEffect, useMemo, useState, useRef, useEffect } from 'react';
import { Bell, MessageSquare, UserPlus, CheckCircle2, Clock, X, Timer, Square } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { ViewSwitcher } from './ViewSwitcher';
import { SearchBar } from './SearchBar';
import { cn } from '../../../lib/cn';
import { Portal } from '../../ui';
import { useTaskStore, useUIStore } from '../../../store';
import { computeTrackedSeconds, formatDurationShort } from '../../../lib/time';
import { useClickOutside } from '../../../lib/hooks/useClickOutside';

interface HeaderProps {
  breadcrumbs?: { label: string; to?: string }[];
  status?: string;
  showViewSwitcher?: boolean;
}

interface Notification {
  id: string;
  type: 'comment' | 'assign' | 'complete' | 'due';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

function ActiveTrackingIndicator() {
  const openInspector = useUIStore((s) => s.openInspector);
  const stopTracking = useTaskStore((s) => s.stopTracking);
  const activeTask = useTaskStore((s) => {
    const candidates = Object.values(s.tasks);
    return candidates.find((t) => !!t.trackingStartedAt && !t.deletedAt) ?? null;
  });

  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!activeTask) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [activeTask]);

  if (!activeTask) return null;

  const duration = formatDurationShort(computeTrackedSeconds(activeTask, nowTick));

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => openInspector(activeTask.id)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md hover:border-slate-300 hover:bg-slate-100 transition-all text-left max-w-[280px]"
        title={activeTask.title}
      >
        <Timer className="w-4 h-4 text-green-600 flex-shrink-0" />
        <span className="text-slate-700 tabular-nums">{duration}</span>
        <span className="text-slate-400">·</span>
        <span className="min-w-0 flex-1 truncate text-slate-600">{activeTask.title}</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          stopTracking(activeTask.id);
        }}
        className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Stop tracking"
        title="Stop tracking"
      >
        <Square className="w-4 h-4" />
      </button>
    </div>
  );
}

export function Header({
  breadcrumbs = [{ label: 'Home' }],
  status,
  showViewSwitcher = true,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'comment', title: 'Park님이 댓글을 남겼습니다', description: '"DB 커넥션 풀 설정 확인해봤는데..."', time: '1시간 전', read: false },
    { id: '2', type: 'assign', title: '새 태스크가 할당되었습니다', description: '대시보드 차트 성능 최적화', time: '2시간 전', read: false },
    { id: '3', type: 'complete', title: 'Kim님이 태스크를 완료했습니다', description: 'OAuth 2.0 리서치', time: '3시간 전', read: true },
    { id: '4', type: 'due', title: '마감이 임박한 태스크', description: '사용자 인증 흐름 기획 - 오늘 마감', time: '5시간 전', read: true },
  ]);
  const notifRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const [notifPosition, setNotifPosition] = useState<{ top: number; right: number } | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const notifRefs = useMemo(() => [notifRef, notifMenuRef], []);
  const closeNotifications = useCallback(() => setShowNotifications(false), []);
  useClickOutside({ refs: notifRefs, onOutside: closeNotifications, enabled: showNotifications });

  useLayoutEffect(() => {
    if (!showNotifications) return;

    const updatePosition = () => {
      const rect = notifRef.current?.getBoundingClientRect();
      if (!rect) return;
      setNotifPosition({
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [showNotifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'comment': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'assign': return <UserPlus className="w-4 h-4 text-purple-500" />;
      case 'complete': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'due': return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 bg-white z-10">
      {/* Left: Breadcrumbs & View Switcher */}
      <div className="flex items-center gap-4">
        <Breadcrumbs items={breadcrumbs} status={status} />
        {showViewSwitcher && (
          <>
            <div className="h-4 w-px bg-slate-200 mx-2" />
            <ViewSwitcher />
          </>
        )}
      </div>

      {/* Right: Search & Actions */}
      <div className="flex items-center gap-3">
        <SearchBar />
        <ActiveTrackingIndicator />

        {/* Notification Button & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              'p-2 rounded-full transition-colors relative',
              showNotifications
                ? 'text-slate-600 bg-slate-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            )}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
        </div>
      </div>

      {showNotifications &&
        notifPosition &&
        (
        <Portal>
          <div
            ref={notifMenuRef}
            className="fixed z-[1000] w-80 bg-white rounded-lg shadow-lg border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200"
            style={{ top: notifPosition.top, right: notifPosition.right }}
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">알림</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-full font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  모두 읽음
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">새로운 알림이 없습니다</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={cn(
                      'px-4 py-3 flex gap-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0 group',
                      !notif.read && 'bg-blue-50/50'
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm',
                        notif.read ? 'text-slate-600' : 'text-slate-900 font-medium'
                      )}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {notif.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {notif.time}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notif.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-2 border-t border-slate-100">
              <button className="w-full text-center text-xs text-primary-600 hover:text-primary-700 font-medium py-1">
                모든 알림 보기
              </button>
            </div>
          </div>
        </Portal>
        )}
    </header>
  );
}
