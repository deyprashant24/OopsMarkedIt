import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Folder, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import api from '../services/api'; 

export default function AddMarkModal({ isOpen, onClose, onAddSuccess }) {
  const [url, setUrl] = useState('');
  const [collectionId, setCollectionId] = useState(''); // 👈 ID store karne ke liye
  const [collections, setCollections] = useState([]);   // 👈 Dropdown ke liye
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch Collections for the dropdown when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchCollections = async () => {
        try {
          const res = await api.get('/collections');
          if (res.data.success) {
            setCollections(res.data.data);
          }
        } catch (err) {
          console.error("Failed to load collections for dropdown", err);
        }
      };
      fetchCollections();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      // Backend ko URL aur optional Collection ID bhej rahe hain
      const response = await api.post('/bookmarks', { 
        url, 
        collectionId: collectionId || null // 👈 Ab ye real ID jayegi
      });
      
      if (response.data.success) {
        handleClose();
        if (onAddSuccess) onAddSuccess(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save bookmark. Check your URL.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    setCollectionId('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleClose}></div>
      
      {/* Modal Content */}
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Add New Mark</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-700 p-2 hover:bg-white rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-6">
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm flex items-start gap-3 border border-red-100 animate-in shake duration-300">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* URL Input */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Website URL</label>
              <div className="group flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:border-blue-400 focus-within:ring-4 ring-blue-50 transition-all duration-300">
                <div className="pl-4 text-slate-400 group-focus-within:text-blue-500 transition-colors"><LinkIcon size={18} /></div>
                <input 
                  type="url" 
                  placeholder="https://github.com/trending" 
                  autoFocus
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full py-4 px-4 bg-transparent outline-none text-slate-700 placeholder-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Collection Dropdown */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Collection (Optional)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 pointer-events-none transition-colors">
                  <Folder size={18} />
                </div>
                <select 
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  className="w-full py-4 pl-12 pr-10 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-400 focus:ring-4 ring-blue-50 transition-all appearance-none text-slate-700 font-medium cursor-pointer"
                >
                  <option value="">No Collection (Inbox)</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={handleClose} 
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !url}
              className="px-8 py-3 text-sm font-bold bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                'Save Mark'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}