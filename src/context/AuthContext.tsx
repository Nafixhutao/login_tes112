import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  user: any;
  loading: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  isDarkMode: true,
  toggleTheme: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = async () => {
    setIsDarkMode(!isDarkMode);
  };

  const value = {
    user,
    loading,
    isDarkMode,
    toggleTheme
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 