
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleAuthService } from '../services/googleAuthService';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Get the stored redirect path or default to dashboard
        const redirectPath = sessionStorage.getItem('authRedirectPath') || '/dashboard';
        
        // If user is already authenticated, just redirect
        if (user) {
          toast.success('Successfully signed in!');
          navigate(redirectPath, { replace: true });
          return;
        }
        
        // Process the OAuth callback
        const { success, error } = await googleAuthService.handleCallback();
        
        if (success) {
          toast.success('Successfully signed in with Google!');
          navigate(redirectPath, { replace: true });
        } else {
          setError(error || 'Authentication failed');
          toast.error(error || 'Authentication failed');
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Error processing callback:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        toast.error(err instanceof Error ? err.message : 'Authentication failed');
        navigate('/login', { replace: true });
      } finally {
        setIsProcessing(false);
        // Clean up the stored redirect path
        sessionStorage.removeItem('authRedirectPath');
      }
    };
    
    processOAuthCallback();
  }, [navigate, user]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-wellness-softBeige to-wellness-softGreen/30 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-md flex flex-col items-center max-w-md w-full">
          <div className="w-16 h-16 border-4 border-wellness-mediumGreen border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-medium text-wellness-darkGreen mt-4">Processing your sign in...</h2>
          <p className="text-wellness-charcoal mt-2 text-center">Please wait while we complete your authentication.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-wellness-softBeige to-wellness-softGreen/30 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-md flex flex-col items-center max-w-md w-full">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="text-xl font-medium text-wellness-darkGreen mt-4">Authentication Failed</h2>
          <p className="text-wellness-charcoal mt-2 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
