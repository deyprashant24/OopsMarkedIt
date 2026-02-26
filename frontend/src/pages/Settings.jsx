import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Key, Trash2, Check, Edit2, X, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function Settings() {
  const { user } = useAuth(); 
  
  // Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Delete Account States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Handlers ---

  const handleUpdateProfile = async () => {
    if (!editName.trim() || editName === user?.name) {
      setIsEditingProfile(false);
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await api.put('/auth/updatedetails', { name: editName });
      if (res.data.success) {
        window.location.reload(); // Reload to get fresh user data
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordError("New passwords don't match!");
    }

    setIsSavingPassword(true);
    try {
      const res = await api.put('/auth/updatepassword', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.data.success) {
        alert("Password updated successfully!");
        setIsPasswordModalOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await api.delete('/auth/deleteaccount');
      window.location.reload(); // Token hat jayega aur user login pe chala jayega
    } catch (err) {
      alert("Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full h-full p-6 md:p-10 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-10">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Settings</h1>
          <p className="text-slate-500">Manage your account preferences and security.</p>
        </div>

        {/* 1. Profile Section */}
        <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Profile Information</h2>
                <p className="text-sm text-slate-500">Your personal details</p>
              </div>
            </div>
            {!isEditingProfile && (
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <Edit2 size={14} /> Edit
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Full Name</label>
              {isEditingProfile ? (
                <div className="flex gap-2">
                  <input 
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-white border border-blue-400 focus:ring-4 ring-blue-50 outline-none rounded-xl py-3 px-4 text-slate-800 font-medium transition-all"
                  />
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={isSavingProfile}
                    className="bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center shrink-0 w-24"
                  >
                    {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
                  </button>
                  <button 
                    onClick={() => { setIsEditingProfile(false); setEditName(user?.name); }}
                    className="bg-slate-100 text-slate-600 px-4 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-700 font-medium">
                  {user?.name || 'Loading...'}
                </div>
              )}
            </div>

            {/* Email Field (Non-editable for security) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Email Address</label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-700 font-medium cursor-not-allowed flex justify-between items-center opacity-70">
                <span>{user?.email || 'Loading...'}</span>
                <Check size={16} className="text-emerald-500" />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Security Section */}
        <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Security</h2>
              <p className="text-sm text-slate-500">Protect your account</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 border border-slate-100 rounded-2xl">
            <div className="flex items-center gap-3 w-full">
              <Key size={20} className="text-slate-400" />
              <div>
                <h3 className="font-semibold text-slate-800">Password</h3>
                <p className="text-sm text-slate-500">Change your current password</p>
              </div>
            </div>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="whitespace-nowrap px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all w-full sm:w-auto text-sm"
            >
              Update Password
            </button>
          </div>
        </section>

        {/* 3. Danger Zone */}
        <section className="bg-red-50/50 rounded-[2rem] p-8 border border-red-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <Trash2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-700">Danger Zone</h2>
              <p className="text-sm text-red-500/80">Permanent destructive actions</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="text-sm text-red-800/70 font-medium">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="whitespace-nowrap px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 w-full sm:w-auto text-sm"
            >
              Delete Account
            </button>
          </div>
        </section>
      </div>

      {/* 🚀 MODALS SECTON */}

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-slate-100">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Update Password</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdatePassword} className="p-8 space-y-5">
              {passwordError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex gap-2 items-center border border-red-100">
                  <AlertCircle size={16} /> {passwordError}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Current Password</label>
                <input type="password" required value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">New Password</label>
                <input type="password" required minLength="6" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Confirm New Password</label>
                <input type="password" required value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400" />
              </div>
              <button type="submit" disabled={isSavingPassword} className="w-full mt-4 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex justify-center gap-2">
                {isSavingPassword ? <Loader2 size={18} className="animate-spin" /> : 'Save New Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-red-100">
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Delete Account?</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                This action is <strong className="text-red-600">permanent</strong>. All your collections, bookmarks, and settings will be wiped out immediately.
              </p>
              
              <div className="pt-4 space-y-2 text-left">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Type "DELETE" to confirm</label>
                <input 
                  type="text" 
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-400 text-center font-bold text-red-600 tracking-widest" 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => {setIsDeleteModalOpen(false); setDeleteConfirmText('');}} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 size={18} className="animate-spin" /> : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}