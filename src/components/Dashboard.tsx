import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Loader2 } from 'lucide-react';
import { useState } from 'react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isDarkMode, toggleTheme } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    sessionStorage.setItem('isLoggingOut', 'true');
    await supabase.auth.signOut();
    setIsLoggedOut(true);
    setTimeout(() => {
      navigate('/');
    }, 1500); // 1.5 detik delay
  };

  if (isLoggedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40 backdrop-blur-xs z-50 fixed inset-0">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
          <span className="text-lg font-semibold text-blue-500">Logging out...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome to Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center min-w-[90px]"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <h2 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                User Information
              </h2>
              <div className={`space-y-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {/* Tampilkan profil sesuai provider DAN field unik */}
                {user?.app_metadata?.provider === 'google' && user?.user_metadata?.picture ? (
                  <div>
                    <h3 className="font-semibold">Google Profile</h3>
                    {user?.user_metadata?.name ? (
                      <p>Name: {user.user_metadata.name}</p>
                    ) : (
                      <p className="text-sm text-red-400">No Google name found</p>
                    )}
                    {user?.user_metadata?.email && (
                      <p>Email: {user.user_metadata.email}</p>
                    )}
                    <img
                      src={user.user_metadata.picture}
                      alt="Google Profile"
                      className="w-16 h-16 rounded-full border mt-2"
                    />
                  </div>
                ) : user?.app_metadata?.provider === 'github' && user?.user_metadata?.avatar_url ? (
                  <div>
                    <h3 className="font-semibold">GitHub Profile</h3>
                    {user?.user_metadata?.full_name ? (
                      <p>Name: {user.user_metadata.full_name}</p>
                    ) : (
                      <p className="text-sm text-red-400">No GitHub name found</p>
                    )}
                    <p>Username: {user.user_metadata.user_name}</p>
                    {user?.user_metadata?.email && (
                      <p>Email: {user.user_metadata.email}</p>
                    )}
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="GitHub Profile"
                      className="w-16 h-16 rounded-full border mt-2"
                    />
                  </div>
                ) : user?.app_metadata?.provider === 'facebook' && user?.user_metadata?.avatar_url ? (
                  <div>
                    <h3 className="font-semibold">Facebook Profile</h3>
                    {user?.user_metadata?.full_name ? (
                      <p>Name: {user.user_metadata.full_name}</p>
                    ) : (
                      <p className="text-sm text-red-400">No Facebook name found</p>
                    )}
                    {user?.user_metadata?.email && (
                      <p>Email: {user.user_metadata.email}</p>
                    )}
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Facebook Profile"
                      className="w-16 h-16 rounded-full border mt-2"
                    />
                  </div>
                ) : user?.app_metadata?.provider === 'email' ? (
                  <div>
                    <h3 className="font-semibold">Email Account</h3>
                    {user?.user_metadata?.full_name && (
                      <p>Name: {user.user_metadata.full_name}</p>
                    )}
                    {user?.email && (
                      <p>Email: {user.email}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-red-400">No recognizable profile data found. Please re-login.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
            }`}>
              <p className={`${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                This is a test dashboard page. You are successfully logged in!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 