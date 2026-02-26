import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import api from '../services/api'; // Import your axios instance

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Calling the backend endpoint you created
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#ffffff] to-[#eff6ff] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-md p-10 text-center animate-fade-in-up">
          <CheckCircle size={64} className="text-emerald-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Check your email</h2>
          <p className="text-slate-500 mb-8">We've sent a password reset link to <b>{email}</b></p>
          <Link to="/login" className="text-blue-600 font-bold hover:underline">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#ffffff] to-[#eff6ff] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-md p-10 relative z-10">
        <h2 className="text-2xl font-extrabold text-slate-800 mb-2 text-center">Forgot Password?</h2>
        <p className="text-slate-500 text-sm mb-8 text-center">Enter your email and we'll send you a reset link.</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Enter your email" 
            required 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-blue-400"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-slate-500 hover:text-blue-600 flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;