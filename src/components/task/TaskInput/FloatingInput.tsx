import { useState } from 'react';
import { Plus, ArrowUp } from 'lucide-react';
import { useTaskStore } from '../../../store';

interface FloatingInputProps {
  projectId?: string;
}

export function FloatingInput({ projectId }: FloatingInputProps) {
  const [value, setValue] = useState('');
  const addTask = useTaskStore((s) => s.addTask);

  const handleSubmit = () => {
    if (value.trim()) {
      // 간단한 자연어 파싱 (추후 고도화)
      let title = value.trim();
      let priority: 'urgent' | 'high' | 'medium' | 'low' | 'none' = 'none';

      if (title.includes('!높음') || title.includes('!high')) {
        priority = 'high';
        title = title.replace(/!높음|!high/g, '').trim();
      } else if (title.includes('!긴급') || title.includes('!urgent')) {
        priority = 'urgent';
        title = title.replace(/!긴급|!urgent/g, '').trim();
      }

      addTask(title, { projectId, priority });
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
    <div className="absolute bottom-6 left-6 right-6 lg:left-20 lg:right-20">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-2 flex items-center gap-3 ring-1 ring-slate-900/5">
        <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
          <Plus className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="새로운 태스크 입력... (예: 내일 오후 3시 디자인 리뷰 #업무 !높음)"
          className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-2 placeholder:text-slate-400 font-medium"
        />
        <div className="flex items-center gap-1 text-slate-400 pr-2">
          <span className="text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
            #Project
          </span>
          <span className="text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
            @Person
          </span>
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white p-1.5 rounded-lg transition-colors ml-2 shadow-sm"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
