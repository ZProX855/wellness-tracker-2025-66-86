
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
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state, or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Check for OAuth redirects
  useEffect(() => {
    let isMounted = true;
    
    const checkForOAuthRedirect = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (data?.session && !error && isMounted) {
          // If we have a session but no error, we might have just completed an OAuth flow
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        console.error('Error checking for OAuth redirect:', err);
      }
    };
    
    checkForOAuthRedirect();
    
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await login(email, password);
      toast.success('Logged in successfully!');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      // Error is already displayed via the useAuth hook
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
        throw error;
      }
      // This will redirect to Google, so no need to navigate
    } catch (error) {
      console.error('Google login failed:', error);
      toast.error(error instanceof Error ? error.message : 'Google login failed. Please try again.');
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
                <span className="relative px-2 bg-white bg-opacity-80 text-sm text-wellness-charcoal">or continue with</span>
              </div>
              
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="flex items-center justify-center w-full py-2 px-4 border border-wellness-softGreen/40 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" className="mr-2">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                    </g>
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
