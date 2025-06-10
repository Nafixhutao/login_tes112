import { useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthCallback = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error during auth callback:', error.message);
        // Redirect to login page with error
        window.location.href = `/?error=${encodeURIComponent(error.message)}`;
        return;
      }

      if (session) {
        // Successfully logged in, redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        // No session, redirect back to login
        window.location.href = '/';
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default AuthCallback; 