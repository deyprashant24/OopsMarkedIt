import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutGrid, Folder, Settings, Plus, Hash } from 'lucide-react';
import api from '../services/api';

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await api.get('/collections');
        if (res.data.success) {
          setCollections(res.data.data);
        }
      } catch (err) {
        console.error("Sidebar Collections Fetch Error:", err);
      }
    };
    fetchCollections();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-20 hover:w-64 h-full bg-gradient-to-b from-[#081229] to-[#0f275e] border-r border-blue-900/50 flex flex-col py-6 transition-all duration-300 ease-in-out shadow-2xl z-50 text-white relative group/sidebar overflow-hidden">
      
      {/* 🚀 TOP SECTION */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
        
        {/* Logo */}
        <Link to="/dashboard" className="px-6 mb-10 flex items-center shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] shrink-0 text-white">
            O
          </div>
          {/* Logo Text with max-w-0 trick */}
          <div className="overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover/sidebar:max-w-[150px] group-hover/sidebar:opacity-100 group-hover/sidebar:ml-3 flex items-center">
            <h2 className="font-extrabold text-xl tracking-tight text-white whitespace-nowrap">
              Oops<span className="text-blue-300 font-medium">MarkedIT</span>
            </h2>
          </div>
        </Link>
        
        {/* Main Navigation */}
        <nav className="flex flex-col gap-1 px-4">
          <NavItem to="/dashboard" icon={<LayoutGrid size={20} />} label="All Marks" active={location.pathname === '/dashboard'} />
          <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" active={location.pathname === '/settings'} />
        </nav>

        {/* Collections Section */}
        <div className="mt-10 px-4">
          {/* Collections Header */}
          <div className="flex items-center justify-between px-3 mb-4 overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover/sidebar:max-w-[200px] group-hover/sidebar:opacity-100 h-0 group-hover/sidebar:h-auto">
            <span className="text-[10px] font-black text-blue-300/40 uppercase tracking-[0.2em] whitespace-nowrap">Collections</span>
            <button 
              onClick={() => navigate('/collections')}
              className="text-blue-300/40 hover:text-white transition-colors shrink-0"
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            {collections.map((col) => (
              <NavItem 
                key={col.id} 
                to={`/collections/${col.id}`} 
                icon={<Hash size={18} className={location.pathname === `/collections/${col.id}` ? 'text-blue-400' : 'text-blue-200/40'} />} 
                label={col.name} 
                active={location.pathname === `/collections/${col.id}`} 
              />
            ))}
            
            {collections.length === 0 && (
              <div className="px-3 py-2 text-[10px] text-blue-200/20 italic overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover/sidebar:max-w-[200px] group-hover/sidebar:opacity-100 whitespace-nowrap">
                No folders yet...
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 🚀 BOTTOM SECTION: Profile & Always Visible Logout */}
      <div className="p-4 mt-auto shrink-0 flex flex-col gap-2">
        
        {/* User Details Box */}
        <div className="flex items-center p-2 rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 transition-colors">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center font-bold text-sm shadow-md shrink-0 text-white uppercase">
            {user?.name?.charAt(0) || 'A'}
          </div>

          {/* User Name & Subtext */}
          <div className="flex flex-col justify-center overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover/sidebar:max-w-[150px] group-hover/sidebar:opacity-100 group-hover/sidebar:ml-3">
            <span className="text-sm font-bold text-white truncate">{user?.name || 'Admin'}</span>
            <span className="text-[10px] text-blue-200/60 truncate">My Workspace</span>
          </div>
        </div>

        {/* Logout Button (Fixed for Mobile!) */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 border border-transparent overflow-hidden text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          {/* Icon is ALWAYS visible */}
          <span className="shrink-0 w-6 flex justify-center"><LogOut size={20} /></span>
          
          {/* Text is visible on hover/PC */}
          <span className="transition-all duration-300 overflow-hidden max-w-0 opacity-0 group-hover/sidebar:max-w-[150px] group-hover/sidebar:opacity-100 group-hover/sidebar:ml-3 text-sm whitespace-nowrap font-medium">
            Log Out
          </span>
        </button>

      </div>
    </aside>
  );
}

// 🚀 REUSABLE NAV ITEM
function NavItem({ to, icon, label, active }) {
  return (
    <Link 
      to={to} 
      className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 border border-transparent overflow-hidden ${
        active 
        ? 'bg-blue-600/20 text-blue-300 font-bold border-blue-500/20 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]' 
        : 'text-blue-200/60 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className="shrink-0 w-6 flex justify-center">{icon}</span>
      
      {/* Text takes 0px width when collapsed */}
      <span className="transition-all duration-300 overflow-hidden max-w-0 opacity-0 group-hover/sidebar:max-w-[150px] group-hover/sidebar:opacity-100 group-hover/sidebar:ml-3 text-sm whitespace-nowrap">
        {label}
      </span>
    </Link>
  );
}