import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // 👈 Auth reactive kiya
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, AlertCircle, Eye, EyeOff, Check, Loader2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth(); // 👈 Real login function extracted
  const navigate = useNavigate();
  
  // States
  const [showSplash, setShowSplash] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Splash Screen Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // 👈 Real Backend Auth Call
      const success = await login(formData.email, formData.password, rememberMe);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      // Backend se aane wala error message yahan set hoga
      setError(err || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = () => {
    // 👈 Aapka updated Port 5012 wala route
    window.location.href = 'http://localhost:5012/api/auth/google';
  };

  // 1. SPLASH SCREEN VIEW
  if (showSplash) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#081229] to-[#0f275e] flex flex-col items-center justify-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-4xl text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-pulse mb-6">
          O
        </div>
        <h2 className="font-extrabold text-3xl tracking-tight text-white animate-fade-in-up">
          Oops<span className="text-blue-300 font-medium">Marked</span>
        </h2>
        <div className="mt-8">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  // 2. MAIN LOGIN VIEW
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#ffffff] to-[#eff6ff] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-white rounded-[2rem] border border-blue-50 shadow-[0_20px_50px_rgba(147,197,253,0.15)] flex flex-col md:flex-row w-full max-w-5xl overflow-hidden min-h-[650px] z-10 animate-fade-in-up">
        
        {/* LEFT PANEL */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-b from-[#081229] to-[#0f275e] relative flex-col justify-between p-12 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              O
            </div>
            <h2 className="font-extrabold text-2xl tracking-tight text-white">
              Oops<span className="text-blue-300 font-medium">Marked</span>
            </h2>
          </div>

          <div className="relative z-10 mb-10">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Never lose a <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">link again.</span>
            </h1>
            <p className="text-blue-100/80 text-lg leading-relaxed max-w-sm">
              Your intelligent command center for saving, tagging, and finding your digital inspiration instantly.
            </p>
          </div>

          <div className="relative z-10 text-xs text-blue-200/50 font-medium">
            © 2026 OopsMarkedIt. All rights reserved.
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">Welcome Back</h2>
              <p className="text-slate-500 text-sm">Sign in to your digital brain.</p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg text-sm flex items-center gap-3 mb-6 shadow-sm animate-fade-in-up">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <User size={20} />
                  </div>
                  <input 
                    type="email" name="email" placeholder="hello@oopsmarkedit.com" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 placeholder-slate-400 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-slate-700 placeholder-slate-400 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium"
                    onChange={handleChange}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors p-1">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    {rememberMe && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-slate-500 font-medium group-hover:text-blue-600 transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" size={16} className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex justify-center items-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
                {isSubmitting ? (
                   <>
                     <Loader2 size={20} className="animate-spin" /> 
                     <span>Entering System...</span>
                   </>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Or continue with</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <button type="button" onClick={handleSocialLogin}
                className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 hover:border-blue-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
              Don't have an account? <Link to="/signup" className="text-blue-600 font-bold cursor-pointer hover:underline hover:text-blue-600 transition-colors">Create account</Link>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Login;