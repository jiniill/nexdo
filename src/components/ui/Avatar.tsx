import { cn } from '../../lib/cn';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away';
  className?: string;
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
}: AvatarProps) {
  const imageUrl = src || getAvatarUrl(name);

  return (
    <div className={cn('relative inline-block', className)}>
      <img
        src={imageUrl}
        alt={name}
        title={name}
        className={cn(
          'rounded-full border border-slate-200 object-cover',
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

export function AvatarStack({ avatars, max = 3, size = 'sm', className }: AvatarStackProps) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={cn('flex -space-x-1.5', className)}>
      {visible.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <span
          className={cn(
            'flex items-center justify-center rounded-full ring-2 ring-white bg-slate-100 text-slate-500 font-medium',
            size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'
          )}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}
