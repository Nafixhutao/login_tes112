import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Sun, 
  Moon, 
  Mail, 
  Lock, 
  Loader2
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// Custom SVG Icons for Social Media
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

function App() {
  const { user, isDarkMode, toggleTheme } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showLogoutLoading, setShowLogoutLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('isLoggingOut') === 'true') {
      setShowLogoutLoading(true);
      setTimeout(() => {
        setShowLogoutLoading(false);
        sessionStorage.removeItem('isLoggingOut');
      }, 1500);
    }
  }, []);

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  if (showLogoutLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40 backdrop-blur-xs z-50 fixed inset-0">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
          <span className="text-lg font-semibold text-blue-500">Logging out...</span>
        </div>
      </div>
    );
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setErrors({ general: error.message });
        return;
      }

      if (data?.user) {
        console.log('Login successful:', data.user);
        // Handle successful login here - e.g., redirect to dashboard
      }
    } catch {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      // Ensure we're using the full Supabase callback URL for Facebook
      const redirectTo = provider.toLowerCase() === 'facebook' 
        ? 'https://xheyfwrdiwtfdjpobifu.supabase.co/auth/v1/callback'
        : `${window.location.origin}/auth/callback`;
        
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider.toLowerCase() as 'google' | 'facebook' | 'github',
        options: {
          redirectTo,
          queryParams: {
            ...(provider.toLowerCase() === 'facebook' && {
              scope: 'email,public_profile',
              auth_type: 'rerequest'
            }),
            ...(provider.toLowerCase() === 'google' && {
              access_type: 'offline',
              prompt: 'consent'
            })
          }
        }
      });

      if (error) {
        setErrors({ general: error.message });
        return;
      }

      console.log(`Login with ${provider} initiated:`, data);
    } catch {
      setErrors({ general: 'An error occurred during social login. Please try again.' });
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ease-in-out ${
      isDarkMode 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Theme Toggle Button */}
      <button
        onClick={async () => {
          setIsToggling(true);
          await toggleTheme();
          setTimeout(() => setIsToggling(false), 300);
        }}
        disabled={isToggling}
        className={`fixed top-6 right-6 p-3 rounded-full transition-all duration-300 hover:scale-110 z-10 group ${
          isDarkMode
            ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-gray-700'
            : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-200'
        } ${isToggling ? 'animate-spin' : ''}`}
        aria-label="Toggle theme"
      >
        <div className="relative">
          {isDarkMode ? (
            <Sun className={`w-5 h-5 transition-all duration-300 ${isToggling ? 'rotate-180 scale-0' : 'rotate-0 scale-100'}`} />
          ) : (
            <Moon className={`w-5 h-5 transition-all duration-300 ${isToggling ? 'rotate-180 scale-0' : 'rotate-0 scale-100'}`} />
          )}
          {isToggling && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </button>

      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className={`w-full max-w-md transition-all duration-500 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200 shadow-2xl'
        } rounded-2xl p-8`}>
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              isDarkMode ? 'bg-blue-500/20' : 'bg-blue-600/10'
            }`}>
              <Lock className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome back
            </h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {errors.general}
              </div>
            )}

            {/* Email Field */}
            <div>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 pl-11 rounded-lg outline-none transition-colors duration-200 ease-in-out font-sans text-base leading-normal ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-200 border-gray-600 focus:border-blue-500 placeholder-gray-400'
                      : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-600 placeholder-gray-500'
                  } border-2 
                  ${isDarkMode ? `
                    [&:-webkit-autofill]:!bg-gray-700 
                    [&:-webkit-autofill]:!text-gray-200 
                    [&:-webkit-autofill]:shadow-[0_0_0_1000px_rgb(55,65,81)_inset] 
                    [-webkit-box-shadow:0_0_0_1000px_rgb(55,65,81)_inset]
                    [box-shadow:0_0_0_1000px_rgb(55,65,81)_inset]
                  ` : `
                    [&:-webkit-autofill]:!bg-gray-50
                    [&:-webkit-autofill]:!text-gray-900
                    [&:-webkit-autofill]:shadow-[0_0_0_1000px_rgb(249,250,251)_inset]
                    [-webkit-box-shadow:0_0_0_1000px_rgb(249,250,251)_inset]
                    [box-shadow:0_0_0_1000px_rgb(249,250,251)_inset]
                  `}
                  [&:-webkit-autofill]:!appearance-none 
                  [&:-webkit-autofill]:!font-sans
                  selection:bg-blue-500/20
                  ${isDarkMode ? 'selection:text-gray-200' : 'selection:text-gray-900'}`}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
                <Mail className={`absolute left-3 top-3.5 w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-3 pl-11 pr-11 rounded-lg outline-none transition-colors duration-200 ease-in-out font-sans text-base leading-normal ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-200 border-gray-600 focus:border-blue-500 placeholder-gray-400'
                      : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-600 placeholder-gray-500'
                  } border-2 
                  ${isDarkMode ? `
                    [&:-webkit-autofill]:!bg-gray-700 
                    [&:-webkit-autofill]:!text-gray-200 
                    [&:-webkit-autofill]:shadow-[0_0_0_1000px_rgb(55,65,81)_inset] 
                    [-webkit-box-shadow:0_0_0_1000px_rgb(55,65,81)_inset]
                    [box-shadow:0_0_0_1000px_rgb(55,65,81)_inset]
                  ` : `
                    [&:-webkit-autofill]:!bg-gray-50
                    [&:-webkit-autofill]:!text-gray-900
                    [&:-webkit-autofill]:shadow-[0_0_0_1000px_rgb(249,250,251)_inset]
                    [-webkit-box-shadow:0_0_0_1000px_rgb(249,250,251)_inset]
                    [box-shadow:0_0_0_1000px_rgb(249,250,251)_inset]
                  `}
                  [&:-webkit-autofill]:!appearance-none 
                  [&:-webkit-autofill]:!font-sans
                  selection:bg-blue-500/20
                  ${isDarkMode ? 'selection:text-gray-200' : 'selection:text-gray-900'}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <Lock className={`absolute left-3 top-3.5 w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-3.5 ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
                  }`}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Submit Button */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className={`w-4 h-4 rounded border-2 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-blue-500'
                      : 'bg-gray-100 border-gray-300 text-blue-600'
                  }`}
                />
                <span className={`ml-2 text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className={`text-sm font-medium ${
                  isDarkMode
                    ? 'text-blue-400 hover:text-blue-300'
                    : 'text-blue-600 hover:text-blue-500'
                }`}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                isDarkMode
                  ? 'bg-blue-500 hover:bg-blue-400 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>Sign in</span>
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${
                  isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
                }`}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className={`flex items-center justify-center py-3 px-4 rounded-lg border transition-all duration-200 hover:scale-105 group relative overflow-hidden ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 hover:border-gray-500'
                    : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md'
                }`}
              >
                <GoogleIcon />
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('Facebook')}
                className={`flex items-center justify-center py-3 px-4 rounded-lg border transition-all duration-200 hover:scale-105 group relative overflow-hidden ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 hover:border-gray-500'
                    : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md'
                }`}
              >
                <FacebookIcon />
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('GitHub')}
                className={`flex items-center justify-center py-3 px-4 rounded-lg border transition-all duration-200 hover:scale-105 group relative overflow-hidden ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 hover:border-gray-500'
                    : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md'
                }`}
              >
                <GitHubIcon />
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <button
                type="button"
                className={`font-medium transition-colors duration-200 ${
                  isDarkMode
                    ? 'text-blue-400 hover:text-blue-300'
                    : 'text-blue-600 hover:text-blue-500'
                }`}
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;