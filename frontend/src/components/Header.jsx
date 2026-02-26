import React, { useEffect } from 'react';

export default function Header({ onOpenModal, onOpenCommand }) {
  
  // 🔥 Ctrl + K / Cmd + K Shortcut Logic
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if Ctrl or Cmd is pressed along with 'k'
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); // Browser ka default search rokne ke liye
        if (onOpenCommand) {
          onOpenCommand(); // Aapka command palette open karega
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommand]); // Dependency array mein onOpenCommand add kiya

  return (
    <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-blue-100 h-20 px-8 flex justify-between items-center">
      
      {/* Search Input - Clicking this opens Command Palette */}
      <div 
        className="flex-1 max-w-2xl relative group cursor-text" 
        onClick={onOpenCommand}
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-blue-300">🔍</span>
        </div>
        <input 
          type="text" 
          placeholder="Search your bookmarks..." 
          readOnly // Makes it act like a button to open the real command palette
          className="w-full bg-white/80 border border-blue-100 rounded-full py-2.5 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm cursor-text"
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 font-medium">⌘K</span>
        </div>
      </div>
      
      {/* Gradient Action Button - Clicking this opens Add Modal */}
      <button 
        onClick={onOpenModal}
        className="ml-6 px-6 py-2.5 font-semibold text-sm rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-500 transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center gap-2"
      >
        <span className="text-lg leading-none">+</span> New Mark
      </button>
    </header>
  );
}