import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const ResetPassword = () => {
  const { token } = useParams(); // URL se token lene ke liye
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Backend PUT route: /api/auth/reset-password/:resetToken
      const res = await api.put(`/auth/reset-password/${token}`, { password });
      
      if (res.data.success) {
        setSubmitted(true);
        // 3 second baad login pe bhej do
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Token is invalid or has expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#ffffff] to-[#eff6ff] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-md p-10 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Password Updated!</h2>
          <p className="text-slate-500 mb-8">Your password has been reset successfully. Redirecting you to login...</p>
          <Loader2 className="animate-spin mx-auto text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#ffffff] to-[#eff6ff] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(147,197,253,0.15)] w-full max-w-md p-10 relative z-10 border border-blue-50">
        
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Set New Password</h2>
          <p className="text-slate-500 text-sm">Please enter your new secure password.</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg text-sm flex items-center gap-3 mb-6">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">New Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={20} />
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                minLength={6}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={20} />
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] flex justify-center items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Update Password'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <Link to="/login" className="text-slate-500 hover:text-blue-600 flex items-center justify-center gap-2 font-medium">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;