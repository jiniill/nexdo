import { Plus } from 'lucide-react';

interface QuickCaptureProps {
  onAdd?: () => void;
}

export function QuickCapture({ onAdd }: QuickCaptureProps) {
  const handleClick = () => {
    if (onAdd) {
      onAdd();
    } else {
      // Dispatch 'c' key event to open FloatingInput modal
      const event = new KeyboardEvent('keydown', { key: 'c', bubbles: true });
      document.dispatchEvent(event);
    }
  };

  return (
    <div className="p-3">
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-2 bg-white border border-slate-200 shadow-sm hover:border-primary-300 hover:shadow text-slate-600 hover:text-primary-600 px-3 py-2 rounded-lg text-sm font-medium transition-all group"
      >
        <div className="bg-primary-50 text-primary-600 rounded p-0.5 group-hover:bg-primary-600 group-hover:text-white transition-colors">
          <Plus className="w-4 h-4" />
        </div>
        새 태스크 추가
        <span className="ml-auto text-xs text-slate-400 font-mono">C</span>
      </button>
    </div>
  );
}
