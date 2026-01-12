import { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Hash, User, Clock, ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/cn';

interface SearchResult {
  id: string;
  type: 'task' | 'project' | 'person' | 'recent';
  title: string;
  subtitle?: string;
}

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const recentSearches: SearchResult[] = [
    { id: 'r1', type: 'recent', title: '대시보드 차트', subtitle: '최근 검색' },
    { id: 'r2', type: 'recent', title: '인증 흐름', subtitle: '최근 검색' },
  ];

  const allResults: SearchResult[] = [
    { id: '1', type: 'task' as const, title: '사용자 인증 흐름 기획', subtitle: 'Q1 제품 런칭' },
    { id: '2', type: 'task' as const, title: '대시보드 차트 성능 최적화', subtitle: 'Q1 제품 런칭' },
    { id: '3', type: 'project' as const, title: 'Q1 제품 런칭', subtitle: '프로젝트' },
    { id: '4', type: 'person' as const, title: 'Kim', subtitle: '팀원' },
  ];
  const mockResults = query ? allResults.filter(r => r.title.toLowerCase().includes(query.toLowerCase())) : [];

  const results = query ? mockResults : recentSearches;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      setIsOpen(false);
      setQuery('');
      setSelectedIndex(0);
    }
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'task': return <FileText className="w-4 h-4 text-slate-400" />;
      case 'project': return <Hash className="w-4 h-4 text-blue-500" />;
      case 'person': return <User className="w-4 h-4 text-purple-500" />;
      case 'recent': return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md w-64 hover:border-slate-300 transition-all text-left group"
      >
        <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-500" />
        <span className="flex-1 text-slate-400">Search or Type command...</span>
        <kbd className="px-1.5 py-0.5 text-[10px] font-sans font-medium text-slate-400 bg-white border border-slate-200 rounded shadow-sm">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div
            ref={modalRef}
            className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
              <Search className="w-5 h-5 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyNavigation}
                  placeholder="태스크, 프로젝트, 팀원 검색..."
                  className="flex-1 text-base bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-slate-400"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery('');
                      setSelectedIndex(0);
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              <kbd className="px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 rounded">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {results.length === 0 && query ? (
                <div className="p-8 text-center text-slate-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">"{query}"에 대한 검색 결과가 없습니다</p>
                </div>
              ) : (
                <div className="py-2">
                  {!query && (
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      최근 검색
                    </div>
                  )}
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => {
                        setIsOpen(false);
                        setQuery('');
                        setSelectedIndex(0);
                      }}
                      className={cn(
                        'w-full px-3 py-2 flex items-center gap-3 text-left transition-colors',
                        selectedIndex === index ? 'bg-slate-100' : 'hover:bg-slate-50'
                      )}
                    >
                      {getResultIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {result.title}
                        </p>
                        {result.subtitle && (
                          <p className="text-xs text-slate-500 truncate">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                      {selectedIndex === index && (
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↑</kbd>
                <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↓</kbd>
                <span>이동</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">Enter</kbd>
                <span>선택</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">ESC</kbd>
                <span>닫기</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
