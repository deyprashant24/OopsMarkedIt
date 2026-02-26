import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LayoutGrid, Loader2, MoreVertical, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';
import api from '../services/api';

export default function Dashboard() {
  const { id } = useParams();
  const { bookmarks, loading, fetchBookmarks } = useBookmarks();
  
  // States for Menu and Edit Modal
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingMark, setEditingMark] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchBookmarks(id);
  }, [id, fetchBookmarks]);

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const pageTitle = id ? "Collection" : "Recently";
  const highlightedTitle = id ? "Marks" : "Marked";

  // Handle Delete
  const handleDelete = async (markId) => {
    if (window.confirm("Are you sure you want to delete this mark?")) {
      try {
        await api.delete(`/bookmarks/${markId}`);
        fetchBookmarks(id); // Refresh UI
      } catch (err) {
        alert("Failed to delete bookmark");
      }
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await api.put(`/bookmarks/${editingMark.id}`, {
        title: editingMark.title,
        description: editingMark.description,
        imageUrl: editingMark.imageUrl
      });
      setEditingMark(null);
      fetchBookmarks(id); // Refresh UI
    } catch (err) {
      alert("Failed to update bookmark");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full min-h-full flex flex-col px-8 py-8">
      {/* Heading */}
      <h1 className="text-3xl font-extrabold mb-8 text-slate-800 tracking-tight shrink-0">
        {pageTitle} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">{highlightedTitle}</span>
      </h1>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <p className="font-medium animate-pulse">Loading your library...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
          <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <LayoutGrid size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No marks here!</h2>
          <p className="text-slate-500">This collection is currently empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up items-stretch pb-10">
          {bookmarks.map((mark) => (
            <div key={mark.id} className="relative group bg-white border border-slate-200/60 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col min-h-[380px] h-full shadow-sm">
              
              {/* Image Section (Clickable) */}
              <a href={mark.url} target="_blank" rel="noopener noreferrer" className="h-44 bg-slate-100 relative overflow-hidden shrink-0 border-b border-slate-200/50 block">
                {mark.imageUrl ? (
                  <img src={mark.imageUrl} alt={mark.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-300">
                    <LayoutGrid size={32} />
                  </div>
                )}
              </a>

              {/* Options Menu Button (3 dots) */}
              <div className="absolute top-3 right-3 z-10">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === mark.id ? null : mark.id);
                  }}
                  className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 shadow-sm border border-slate-200/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical size={16} />
                </button>

                {/* Dropdown Menu */}
                {activeMenu === mark.id && (
                  <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingMark(mark); setActiveMenu(null); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(mark.id); setActiveMenu(null); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Content Section (Clickable) */}
              <a href={mark.url} target="_blank" rel="noopener noreferrer" className="p-5 flex flex-col flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <img 
                    src={mark.favicon || `https://www.google.com/s2/favicons?domain=${mark.domain}&sz=64`} 
                    alt="" 
                    className="w-5 h-5 mt-1 shrink-0 object-contain rounded-sm"
                  />
                  <h3 className="font-bold text-slate-800 leading-tight line-clamp-2 text-[15px]">
                    {mark.title || mark.domain}
                  </h3>
                </div>
                <p className="text-[13px] text-slate-500 line-clamp-3 leading-relaxed flex-1">
                  {mark.description || "No description available."}
                </p>
                <div className="pt-4 mt-auto">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 truncate inline-block max-w-full">
                    {mark.domain}
                  </span>
                </div>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* 📝 EDIT MARK MODAL */}
      {editingMark && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Edit Mark</h3>
              <button onClick={() => setEditingMark(null)} className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-50 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                <input 
                  type="text" 
                  value={editingMark.title || ''}
                  onChange={(e) => setEditingMark({...editingMark, title: e.target.value})}
                  className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  rows="3"
                  value={editingMark.description || ''}
                  onChange={(e) => setEditingMark({...editingMark, description: e.target.value})}
                  className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm font-medium resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><ImageIcon size={12}/> Cover Image URL</label>
                <input 
                  type="url" 
                  value={editingMark.imageUrl || ''}
                  onChange={(e) => setEditingMark({...editingMark, imageUrl: e.target.value})}
                  placeholder="Paste an image link here..."
                  className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm font-medium text-blue-600"
                />
              </div>

              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full mt-4 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isUpdating ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}