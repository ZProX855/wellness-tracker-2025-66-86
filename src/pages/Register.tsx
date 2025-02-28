
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import Header from '../components/Header';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const { register, loginWithGoogle, loginWithGoogleToken, error } = useAuth();
  const navigate = useNavigate();
  
  const validatePassword = () => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    setPasswordError('');
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await register(email, password, name);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleLoginFallback = async () => {
    try {
      setIsSubmitting(true);
      await loginWithGoogle();
      navigate('/dashboard');
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
        navigate('/dashboard');
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
              <h1 className="text-2xl font-medium text-wellness-darkGreen mb-2">Join Wellness Tracker</h1>
              <p className="text-wellness-charcoal">Create your account to start your wellness journey</p>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-wellness-charcoal mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-wellness-charcoal/50" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-wellness-softGreen/40 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen text-wellness-darkGreen placeholder-wellness-charcoal/50"
                    placeholder="Your Name"
                    required
                  />
                </div>
              </div>
              
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
                    minLength={8}
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
                <p className="mt-1 text-xs text-wellness-charcoal">
                  Password must be at least 8 characters
                </p>
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-wellness-charcoal mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-wellness-charcoal/50" />
                  </div>
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-wellness-softGreen/40 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen text-wellness-darkGreen placeholder-wellness-charcoal/50"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {passwordError && (
                  <p className="mt-1 text-xs text-red-600">{passwordError}</p>
                )}
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
                    <UserPlus className="h-5 w-5 mr-2" />
                  )}
                  Create Account
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
                  text="signup_with"
                  locale="en"
                />
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-wellness-charcoal">
                Already have an account?{' '}
                <Link to="/login" className="text-wellness-darkGreen hover:text-wellness-mediumGreen font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
