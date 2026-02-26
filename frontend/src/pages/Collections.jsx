import React, { useState, useEffect } from 'react';
import { Folder, Edit2, Trash2, X, Plus, Loader2, FolderPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState(''); 
  const [isCreating, setIsCreating] = useState(false); 
  const navigate = useNavigate();

  // 1. Fetch Collections from Backend
  const fetchCollections = async () => {
    try {
      const res = await api.get('/collections');
      if (res.data.success) setCollections(res.data.data);
    } catch (err) {
      console.error("Collections Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCollections(); }, []);

  // 2. Delete Collection
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure? This will remove the folder but your bookmarks are safe.")) {
      try {
        await api.delete(`/collections/${id}`);
        setCollections(prev => prev.filter(c => c.id !== id));
      } catch (err) { alert("Failed to delete collection."); }
    }
  };

  // 3. Update Collection
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/collections/${editingItem.id}`, { name: editingItem.name });
      if (res.data.success) {
        setCollections(prev => prev.map(c => c.id === editingItem.id ? res.data.data : c));
        setIsEditModalOpen(false);
        setEditingItem(null);
      }
    } catch (err) { alert("Update failed."); }
  };

  // 4. Create Collection (NEW INLINE LOGIC) 
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    setIsCreating(true);

    try {
      const res = await api.post('/collections', { name: newCollectionName });
      if (res.data.success) {
        setCollections(prev => [res.data.data, ...prev]);
        setIsCreateModalOpen(false);
        setNewCollectionName('');
      }
    } catch (err) {
      console.error(err);
      alert("Folder banane mein error aaya!");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    // 🔥 FIX: 'max-w-7xl mx-auto' hata kar 'w-full h-full' kar diya gaya hai
    <div className="w-full min-h-full flex flex-col p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Collections</span>
        </h1>
        
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 z-50 relative"
        >
          <Plus size={18} strokeWidth={3} />
          Create New
        </button>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <p className="font-medium animate-pulse">Organizing your library...</p>
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
          {collections.map((col) => (
            <div 
              key={col.id}
              onClick={() => navigate(`/collections/${col.id}`)}
              className="group bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all cursor-pointer relative flex flex-col items-start"
            >
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingItem(col); setIsEditModalOpen(true); }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={(e) => handleDelete(e, col.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
                <Folder size={24} />
              </div>

              <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors mb-1 truncate w-full pr-10">
                {col.name}
              </h3>
              
              <p className="text-slate-400 text-sm font-medium">
                {col.Bookmarks?.length || 0} bookmarks
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
             <Folder size={32} className="text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-700">No collections yet</h2>
          <p className="text-slate-500 mt-2">Start by creating a folder to organize your links.</p>
        </div>
      )}

      {/* 🚀 MODALS SECTON */}

      {/* 1. Create Collection Modal (INLINE) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 tracking-tight italic">New Collection</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-50 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Collection Name</label>
                <div className="group flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:border-blue-400 focus-within:ring-4 ring-blue-50 transition-all duration-300">
                  <div className="pl-4 text-slate-400 group-focus-within:text-blue-500 transition-colors"><FolderPlus size={18} /></div>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="e.g. React Resources" 
                    required
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="w-full py-4 px-4 bg-transparent outline-none text-slate-700 font-medium"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isCreating || !newCollectionName.trim()}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCreating ? <Loader2 size={18} className="animate-spin" /> : 'Create Folder'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Collection Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-xl text-slate-800 tracking-tight">Edit Collection</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">New Folder Name</label>
                <input 
                  autoFocus
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-700"
                  value={editingItem?.name || ''}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}