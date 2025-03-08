
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    login,
    loginWithGoogle,
    error
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state, or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Check for OAuth redirects
  useEffect(() => {
    const checkForOAuthRedirect = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session && !error) {
        // If we have a session but no error, we might have just completed an OAuth flow
        navigate('/dashboard', { replace: true });
      }
    };
    
    checkForOAuthRedirect();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        toast.error(error.message);
        console.error('Google login failed:', error);
      }
      
      // This will redirect to Google, so no need to navigate
    } catch (error: any) {
      console.error('Google login failed:', error);
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-softBeige to-wellness-softGreen/30">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-md mx-auto">
          <Link to="/" className="inline-flex items-center text-wellness-darkGreen hover:text-wellness-mediumGreen transition-colors mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl p-8 border border-wellness-softGreen/30 shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-medium text-wellness-darkGreen mb-2">Welcome Back!</h1>
              <p className="text-wellness-charcoal">Sign in to access your wellness dashboard</p>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-wellness-charcoal mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-wellness-charcoal/50" />
                  </div>
                  <input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="block w-full pl-10 pr-3 py-2 border border-wellness-softGreen/40 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen text-wellness-darkGreen placeholder-wellness-charcoal/50" 
                    placeholder="you@example.com" 
                    required 
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-wellness-charcoal mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-wellness-charcoal/50" />
                  </div>
                  <input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="block w-full pl-10 pr-10 py-2 border border-wellness-softGreen/40 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen text-wellness-darkGreen placeholder-wellness-charcoal/50" 
                    placeholder="••••••••" 
                    required 
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-wellness-charcoal/50" /> : <Eye className="h-5 w-5 text-wellness-charcoal/50" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input 
                    id="remember-me" 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-wellness-softGreen/40 text-wellness-mediumGreen focus:ring-wellness-softGreen" 
                    checked={rememberMe} 
                    onChange={e => setRememberMe(e.target.checked)} 
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-wellness-charcoal">
                    Remember me
                  </label>
                </div>
                
                <Link to="/forgot-password" className="text-sm text-wellness-darkGreen hover:text-wellness-mediumGreen">
                  Forgot password?
                </Link>
              </div>
              
              <div>
                <button 
                  type="submit" 
                  className="w-full flex justify-center items-center bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <LogIn className="h-5 w-5 mr-2" />
                  )}
                  Sign In
                </button>
              </div>
              
              <div className="relative flex items-center justify-center">
                <div className="border-t border-wellness-softGreen/40 absolute w-full"></div>
                <div className="relative bg-white bg-opacity-80 px-3 text-sm text-wellness-charcoal">
                  or continue with
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 w-full transition-colors"
                  disabled={isSubmitting}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-wellness-charcoal">
                Don't have an account?{' '}
                <Link to="/register" className="text-wellness-darkGreen hover:text-wellness-mediumGreen font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
