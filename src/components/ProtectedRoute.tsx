
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Set a timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session check timed out')), 5000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        // Race between the actual request and the timeout
        const { data, error } = await Promise.race([
          sessionPromise,
          timeoutPromise.then(() => ({ data: { session: null }, error: null }))
        ]) as any;
        
        const hasValidSession = !!data.session && !error;
        setHasSession(hasValidSession);
        
        if (hasValidSession) {
          console.log('Valid session detected in ProtectedRoute');
        } else {
          console.log('No valid session detected in ProtectedRoute');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setHasSession(false);
      } finally {
        setIsCheckingSession(false);
      }
    };
    
    checkSession();
  }, []);
  
  if (isLoading || isCheckingSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user && !hasSession) {
    console.log('No user or session, redirecting to login');
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
