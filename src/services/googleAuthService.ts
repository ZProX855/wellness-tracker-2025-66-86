
import { supabase } from '../lib/supabase';

// Configuration with the provided Google OAuth credentials
const GOOGLE_CLIENT_ID = "484533780768-lqgm2fp3u57eddfujrvvhgpdeu7kt6m0.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

// Get the current origin for dynamic redirect URIs
const getRedirectUri = () => {
  return `${window.location.origin}/auth/callback`;
};

export const googleAuthService = {
  /**
   * Initiates Google OAuth flow
   * @param redirectPath Path to redirect to after successful authentication
   */
  async signIn(redirectPath = '/dashboard'): Promise<void> {
    // Store the redirect path for later use
    sessionStorage.setItem('authRedirectPath', redirectPath);
    
    // Create OAuth URL with correct parameters
    const redirectUri = getRedirectUri();
    
    // We still use Supabase for the actual auth, but with corrected parameters
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    if (error) {
      console.error('Google OAuth initiation error:', error);
      throw error;
    }
  },
  
  /**
   * Handle OAuth callback and extract session data
   */
  async handleCallback(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting auth session:', error);
        return { success: false, error: error.message };
      }
      
      if (!data.session) {
        return { success: false, error: 'No session found' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }
};
