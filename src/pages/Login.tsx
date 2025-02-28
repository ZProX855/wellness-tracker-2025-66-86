
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { GoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, loginWithGoogle, loginWithGoogleToken, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state, or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleLoginFallback = async () => {
    try {
      setIsSubmitting(true);
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Google login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      setIsSubmitting(true);
      
      if (credentialResponse.credential) {
        await loginWithGoogleToken(credentialResponse.credential);
        navigate(from, { replace: true });
      } else {
        throw new Error('No credential received from Google');
      }
    } catch (error) {
      console.error('Google login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-softBeige to-wellness-softGreen/30">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-md mx-auto">
          <Link
            to="/"
            className="inline-flex items-center text-wellness-darkGreen hover:text-wellness-mediumGreen transition-colors mb-8"
          >
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
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-wellness-softGreen/40 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen text-wellness-darkGreen placeholder-wellness-charcoal/50"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-wellness-charcoal/50" />
                    ) : (
                      <Eye className="h-5 w-5 text-wellness-charcoal/50" />
                    )}
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
                    onChange={(e) => setRememberMe(e.target.checked)}
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
                <div className="bg-white px-3 relative text-sm text-wellness-charcoal">or continue with</div>
              </div>
              
              <div className="flex justify-center">
                <GoogleLogin 
                  onSuccess={handleGoogleLoginSuccess}
                  onError={() => {
                    console.error('Google login failed');
                    // Fall back to mock Google login if real one fails
                    handleGoogleLoginFallback();
                  }}
                  useOneTap
                  theme="outline"
                  shape="rectangular"
                  text="signin_with"
                  locale="en"
                />
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
