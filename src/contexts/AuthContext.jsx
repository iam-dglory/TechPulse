/**
 * Authentication Context for TexhPulze
 *
 * Provides authentication state and methods throughout the application.
 * Integrates with Supabase Auth for user management.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Authentication Context Type
 */
const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
  resetPassword: async () => {},
});

/**
 * Custom hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Authentication Provider Component
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      setUser(session?.user ?? null);

      // Handle specific events
      if (event === 'SIGNED_IN') {
        await ensureProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Initialize authentication state
   */
  async function initializeAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user ?? null);

      // Ensure profile exists
      if (session?.user) {
        await ensureProfile(session.user);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Ensure user profile exists in database
   */
  async function ensureProfile(user) {
    if (!user) return;

    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
        return;
      }

      // Create profile if it doesn't exist
      if (!existingProfile) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          role: 'citizen', // Default role
        });

        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      }
    } catch (error) {
      console.error('Error ensuring profile:', error);
    }
  }

  /**
   * Sign up new user
   *
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @param {string} [credentials.fullName] - User full name
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function signUp({ email, password, fullName }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName || null,
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to sign up',
        };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return {
          success: true,
          requiresConfirmation: true,
          message: 'Please check your email to confirm your account.',
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to sign up',
      };
    }
  }

  /**
   * Sign in existing user
   *
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function signIn({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to sign in',
        };
      }

      return { success: true, user: data.user };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to sign in',
      };
    }
  }

  /**
   * Sign out current user
   *
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to sign out',
        };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to sign out',
      };
    }
  }

  /**
   * Update user profile
   *
   * @param {Object} updates - Profile updates
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function updateProfile(updates) {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to update profile',
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to update profile',
      };
    }
  }

  /**
   * Request password reset
   *
   * @param {string} email - User email
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to reset password',
        };
      }

      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to reset password',
      };
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
