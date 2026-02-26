import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, ExternalLink, Command } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext'; // 👈 Context connect kiya

export default function CommandPalette({ isOpen, onClose }) {
  const { bookmarks } = useBookmarks(); // 👈 Global bookmarks list li
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Modal open hone par input focus aur state reset
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search Logic: Title aur Domain dono mein search karega
  const filteredMarks = searchQuery === ''
    ? bookmarks.slice(0, 6) // Agar empty hai toh latest 6 dikhao
    : bookmarks.filter(mark => 
        (mark.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (mark.domain || '').toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8);

  // Keyboard Navigation (Esc, Arrows, Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(filteredMarks.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + Math.max(filteredMarks.length, 1)) % Math.max(filteredMarks.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredMarks[selectedIndex];
        if (selected) {
          window.open(selected.url, '_blank');
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredMarks, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Palette Body */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Input Header */}
        <div className="flex items-center px-5 border-b border-slate-100 bg-slate-50/50">
          <Search className="text-slate-400" size={20} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Type to search your marks..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full py-5 px-4 bg-transparent outline-none text-slate-800 placeholder-slate-400 text-lg"
          />
          <div className="flex items-center gap-1.5">
            <kbd className="hidden sm:block border border-slate-200 rounded-md px-2 py-1 text-[10px] font-bold text-slate-400 bg-white">ESC</kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="py-2 max-h-[450px] overflow-y-auto">
          {filteredMarks.length > 0 ? (
            <div className="px-2">
              <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {searchQuery ? 'Suggestions' : 'Recently Marked'}
              </div>
              {filteredMarks.map((mark, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div 
                    key={mark.id}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => {
                      window.open(mark.url, '_blank');
                      onClose();
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${
                      isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center border ${
                        isSelected ? 'bg-white/20 border-white/10' : 'bg-white border-slate-100'
                      }`}>
                        {mark.favicon ? (
                          <img src={mark.favicon} alt="" className="w-6 h-6 object-contain" />
                        ) : (
                          <Globe size={18} className={isSelected ? 'text-white' : 'text-slate-400'} />
                        )}
                      </div>
                      <div className="truncate">
                        <p className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                          {mark.title || mark.domain}
                        </p>
                        <p className={`text-xs truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {mark.domain}
                        </p>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="flex items-center gap-2 shrink-0 animate-in slide-in-from-right-2">
                        <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded tracking-widest">OPEN</span>
                        <ExternalLink size={14} className="opacity-70" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Command size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium text-sm">No marks found for "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Footer Help */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><span className="bg-white border border-slate-200 px-1 rounded shadow-sm">↑↓</span> Navigate</span>
                <span className="flex items-center gap-1.5"><span className="bg-white border border-slate-200 px-1 rounded shadow-sm">↵</span> Open</span>
            </div>
            <span>OopsMarkedIT v1.0</span>
        </div>
      </div>
    </div>
  );
}