import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { User, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await authService.register(formData);
      navigate('/login', { state: { message: 'Signup successful! Please login.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#ffffff] to-[#eff6ff] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row-reverse w-full max-w-5xl overflow-hidden">
        {/* Branding Panel (Right) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-b from-[#081229] to-[#0f275e] p-12 text-white flex-col justify-center">
          <h1 className="text-5xl font-bold mb-6">Join Us.</h1>
          <p className="text-blue-100/80 text-lg">Create an account to start bookmarking your world.</p>
        </div>

        {/* Form Panel (Left) */}
        <div className="w-full md:w-1/2 p-10 md:p-16">
          <h2 className="text-3xl font-bold mb-6 text-slate-800">Create Account</h2>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex gap-2"><AlertCircle size={18}/>{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-400" size={20}/>
              <input type="text" placeholder="Full Name" required className="w-full bg-slate-50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={20}/>
              <input type="email" placeholder="Email Address" required className="w-full bg-slate-50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={20}/>
              <input type="password" placeholder="Password" required className="w-full bg-slate-50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all flex justify-center items-center gap-2">
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Sign Up'}
            </button>
          </form>
          <p className="mt-8 text-center text-slate-500">Already have an account? <Link to="/login" className="text-blue-600 font-bold underline">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;