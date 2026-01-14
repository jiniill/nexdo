import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { cn } from '../../lib/cn';
import { Portal } from './Portal';

export function Modal({
  open,
  onClose,
  children,
  zIndexClassName = 'z-[1000]',
  containerClassName,
  contentClassName,
  backdropClassName,
  showBackdrop = true,
  closeOnBackdrop = true,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  zIndexClassName?: string;
  containerClassName?: string;
  contentClassName?: string;
  backdropClassName?: string;
  showBackdrop?: boolean;
  closeOnBackdrop?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <Portal>
      <div className={cn('fixed inset-0', zIndexClassName)}>
        {showBackdrop && (
          <div
            className={cn('absolute inset-0 bg-slate-900/50 animate-in fade-in duration-200', backdropClassName)}
            onClick={closeOnBackdrop ? onClose : undefined}
          />
        )}
        <div className={cn('relative flex items-start justify-center pt-[12vh]', containerClassName)}>
          <div className={cn('relative', contentClassName)}>{children}</div>
        </div>
      </div>
    </Portal>
  );
}

