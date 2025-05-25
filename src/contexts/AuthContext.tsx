
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface UserWithMetadata extends User {
  name?: string;
  avatar?: string;
}

interface AuthContextType {
  user: UserWithMetadata | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, phoneNumber: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cleanup function to prevent auth limbo states
const cleanupAuthState = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithMetadata | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const enrichUserWithMetadata = (currentUser: User | null): UserWithMetadata | null => {
    if (!currentUser) return null;
    
    return {
      ...currentUser,
      name: currentUser.user_metadata?.name || currentUser.user_metadata?.full_name || 'User',
      avatar: currentUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.user_metadata?.name || currentUser.user_metadata?.full_name || 'User')}&background=random`
    };
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session) {
          setSession(session);
          setUser(enrichUserWithMetadata(session.user));
          console.log('User signed in:', session.user.email);
          
          // Only redirect on successful login, not on page refresh
          if (window.location.pathname === '/' || window.location.pathname.includes('auth')) {
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 100);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUser(null);
          setSession(null);
          // Don't auto-redirect on sign out, let the logout function handle it
        } else if (event === 'INITIAL_SESSION') {
          setSession(session);
          setUser(enrichUserWithMetadata(session?.user ?? null));
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error('Error getting session:', error);
        cleanupAuthState();
      }
      
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(enrichUserWithMetadata(session?.user ?? null));
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      
      // Clean up existing state first
      cleanupAuthState();
      
      const { error, data } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      console.log('Login successful:', data.user?.email);
      toast.success('Successfully logged in!');
      
    } catch (error: any) {
      console.error('Error logging in:', error);
      const errorMessage = error.message || 'Failed to log in';
      
      if (errorMessage.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else if (errorMessage.includes('Email not confirmed')) {
        toast.error('Please check your email and confirm your account');
      } else {
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting logout');
      
      // Clean up auth state first
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('Logout error:', error);
      }
      
      // Force page reload for clean state
      window.location.href = '/';
      
    } catch (error: any) {
      console.error('Error logging out:', error);
      toast.error(error.message || 'Failed to log out');
    }
  };

  const signup = async (email: string, password: string, name: string, phoneNumber: string) => {
    try {
      console.log('Attempting signup for:', email);
      
      // Clean up existing state
      cleanupAuthState();
      
      const { error, data } = await supabase.auth.signUp({ 
        email: email.trim(), 
        password,
        options: {
          data: {
            full_name: name,
            name: name,
            phone_number: phoneNumber,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          }
        } 
      });
      
      if (error) {
        console.error('Signup error:', error);
        throw error;
      }
      
      console.log('Signup successful:', data.user?.email);
      
      if (data.user && !data.session) {
        toast.success('Registration successful! Please check your email to confirm your account.');
      } else if (data.session) {
        toast.success('Registration successful! You are now logged in.');
      }
      
    } catch (error: any) {
      console.error('Error signing up:', error);
      const errorMessage = error.message || 'Failed to sign up';
      
      if (errorMessage.includes('User already registered')) {
        toast.error('An account with this email already exists');
      } else {
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!session && !!user,
      login,
      logout,
      signup
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
