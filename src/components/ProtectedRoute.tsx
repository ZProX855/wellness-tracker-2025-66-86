
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, logout } = useAuth();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First check for an active Supabase session
        const { data, error } = await supabase.auth.getSession();
        const hasValidSession = !!data.session && !error;
        
        // Log the session state for debugging
        console.log(
          'Session check in ProtectedRoute:', 
          hasValidSession ? 'Valid session detected' : 'No valid session'
        );
        
        setHasSession(hasValidSession);
        
        // If no valid session but we have a user in state, log the inconsistency
        if (!hasValidSession && user) {
          console.warn('Inconsistent auth state: user in context but no valid session');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setHasSession(false);
      } finally {
        // Resolve the loading state
        setIsCheckingSession(false);
      }
    };
    
    // Set timeout to prevent infinite loading state
    const sessionTimeout = setTimeout(() => {
      console.warn('Session check timed out after 5 seconds');
      setIsCheckingSession(false);
    }, 5000);
    
    checkSession();
    
    return () => clearTimeout(sessionTimeout);
  }, [user]);
  
  // Show loading state while checking
  if (isLoading || isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-wellness-softBeige to-wellness-softGreen/30 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-md flex flex-col items-center max-w-md w-full">
          <div className="w-12 h-12 border-4 border-wellness-mediumGreen border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-medium text-wellness-darkGreen">Verifying your session...</h2>
          <p className="text-wellness-charcoal mt-2 text-center">Please wait while we authenticate you.</p>
        </div>
      </div>
    );
  }
  
  // If no user and no session, redirect to login
  if (!user && !hasSession) {
    console.log('No user or session, redirecting to login from:', location.pathname);
    toast.error('Please sign in to access this page');
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
