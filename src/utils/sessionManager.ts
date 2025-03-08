import { User } from "../types/auth";
import { supabase } from "../lib/supabase";

const CURRENT_USER_KEY = 'currentUser';
const SESSION_TIMEOUT = 3000; // 3 seconds

/**
 * Utility for managing user session data
 */
export const SessionManager = {
  /**
   * Stores user data in session storage
   */
  saveUser: (user: User): void => {
    if (user) {
      try {
        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } catch (error) {
        console.error('Failed to save user to session storage:', error);
      }
    }
  },

  /**
   * Retrieves user data from session storage
   */
  getUser: (): User | null => {
    try {
      const userData = sessionStorage.getItem(CURRENT_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user from session storage:', error);
      return null;
    }
  },

  /**
   * Clears user data from session storage
   */
  clearUser: (): void => {
    try {
      sessionStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Failed to clear user from session storage:', error);
    }
  },

  /**
   * Gets the current session with timeout protection
   */
  getCurrentSession: async (): Promise<{
    session: any | null;
    user: User | null;
    error: Error | null;
  }> => {
    return new Promise((resolve) => {
      // Set timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        console.log('Session check timed out');
        resolve({ session: null, user: null, error: new Error('Session check timed out') });
      }, SESSION_TIMEOUT);

      // Try to get cached user first
      const cachedUser = SessionManager.getUser();
      if (cachedUser) {
        clearTimeout(timeoutId);
        resolve({ session: true, user: cachedUser, error: null });
        return;
      }

      // Otherwise check with Supabase
      supabase.auth.getSession()
        .then(({ data, error }) => {
          clearTimeout(timeoutId);
          if (error) {
            resolve({ session: null, user: null, error });
          } else {
            resolve({ 
              session: data.session, 
              user: data.session?.user ? {
                id: data.session.user.id,
                username: data.session.user.email?.split('@')[0] || 'User',
                name: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'User',
                avatar: data.session.user.user_metadata?.avatar_url,
                createdAt: data.session.user.created_at || new Date().toISOString()
              } : null,
              error: null 
            });
          }
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          resolve({ session: null, user: null, error });
        });
    });
  }
};

export default SessionManager;
