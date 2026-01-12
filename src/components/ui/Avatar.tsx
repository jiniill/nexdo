import { cn } from '../../lib/cn';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away';
  className?: string;
  hideBorder?: boolean;
}

const sizeStyles = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

const statusSizeStyles = {
  sm: 'w-2 h-2 -top-0.5 -right-0.5 border',
  md: 'w-2.5 h-2.5 -top-0.5 -right-0.5 border-2',
  lg: 'w-3 h-3 top-0 right-0 border-2',
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-slate-400',
  away: 'bg-amber-500',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=64`;
}

export function Avatar({
  src,
  name,
  size = 'md',
  showStatus = false,
  status = 'online',
  className,
  hideBorder = false,
}: AvatarProps) {
  const imageUrl = src || getAvatarUrl(name);

  return (
    <div className={cn('relative inline-block', className)}>
      <img
        src={imageUrl}
        alt={name}
        title={name}
        className={cn(
          'rounded-full object-cover',
          !hideBorder && 'border border-slate-200',
          sizeStyles[size]
        )}
        onError={(e) => {
          // 이미지 로드 실패 시 이니셜 표시
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <span
        className={cn(
          'hidden items-center justify-center rounded-full bg-slate-200 text-slate-600 font-medium',
          sizeStyles[size]
        )}
      >
        {getInitials(name)}
      </span>
      {showStatus && (
        <span
          className={cn(
            'absolute rounded-full border-white',
            statusSizeStyles[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}

// 아바타 스택
interface AvatarStackProps {
  avatars: Array<{ src?: string; name: string }>;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

const stackSizeStyles = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
};

export function AvatarStack({ avatars, max = 3, size = 'sm', className }: AvatarStackProps) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <span className={cn('flex -space-x-1.5', className)}>
      {visible.map((avatar, index) => (
        <img
          key={index}
          className={cn(
            'inline-block rounded-full ring-2 ring-white object-cover',
            stackSizeStyles[size]
          )}
          src={avatar.src || `https://ui-avatars.com/api/?name=${encodeURIComponent(avatar.name)}&background=random&size=64`}
          alt={avatar.name}
          title={avatar.name}
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'inline-flex items-center justify-center rounded-full ring-2 ring-white bg-slate-100 text-slate-500 font-medium',
            stackSizeStyles[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </span>
  );
}
