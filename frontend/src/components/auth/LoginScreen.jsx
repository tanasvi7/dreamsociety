
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader, CheckCircle } from 'lucide-react';
import Captcha from '../common/Captcha';
import WelcomeHeader from '../welcome/WelcomeHeader';
import ErrorDisplay from '../common/ErrorDisplay';

const LoginScreen = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [captchaValid, setCaptchaValid] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginStep, setLoginStep] = useState('idle'); // 'idle', 'authenticating', 'success', 'error'
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    if (!captchaValid) {
      newErrors.captcha = 'Please complete the security verification';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enhanced error handling function
  const handleLoginError = (error) => {
    let errorMessage = '';
    let errorType = 'general';
    let showRetry = false;
    let showContactSupport = false;

    // Network and connectivity errors
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      if (error.message.includes('ERR_CONNECTION_REFUSED') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('net::ERR_CONNECTION_REFUSED')) {
        errorMessage = 'Backend server is not running. Please start the backend server or check the connection.';
        errorType = 'backend_unavailable';
        showContactSupport = true;
      } else {
        errorMessage = 'No internet connection. Please check your network and try again.';
        errorType = 'network';
        showRetry = true;
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please try again.';
      errorType = 'timeout';
      showRetry = true;
    } else if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      switch (status) {
        case 400:
          errorMessage = errorData?.error || errorData?.message || 'Invalid email or password. Please check your credentials.';
          errorType = 'validation';
          break;
        case 401:
          errorMessage = 'Invalid email or password. Please check your credentials.';
          errorType = 'authentication';
          break;
        case 403:
          errorMessage = 'Access denied. Your account may be suspended.';
          errorType = 'access_denied';
          showContactSupport = true;
          break;
        case 404:
          errorMessage = 'Service not found. Please try again later.';
          errorType = 'service_not_found';
          showRetry = true;
          break;
        case 429:
          errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
          errorType = 'rate_limit';
          showRetry = true;
          break;
        case 500:
          errorMessage = 'Server error. Please try again later or contact support.';
          errorType = 'server_error';
          showRetry = true;
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          errorType = 'service_unavailable';
          showRetry = true;
          break;
        default:
          errorMessage = errorData?.error || errorData?.message || 'An unexpected error occurred.';
          errorType = 'unknown';
          showRetry = true;
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your connection.';
      errorType = 'no_response';
      showRetry = true;
    } else {
      errorMessage = error.message || 'An unexpected error occurred.';
      errorType = 'unknown';
      showRetry = true;
    }
    
    return { errorMessage, errorType, showRetry, showContactSupport };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoggingIn(true);
    setLoginStep('authenticating');
    setErrors({});
    
    try {
      console.log('LoginScreen: Starting login process...');
      
      const result = await login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });
      
      console.log('LoginScreen: Login result:', result);
      
        if (result && result.success) {
          console.log('LoginScreen: Login successful, checking for redirect context...');
          setLoginStep('success');
          
          // Check for redirect context
          const searchContext = localStorage.getItem('searchRedirectContext');
          const previewContext = localStorage.getItem('previewRedirectContext');
          
          // Determine redirect path based on user role
          let redirectPath = '/dashboard';
          
          // Check if user is admin and redirect to admin dashboard
          if (result.user && result.user.role === 'admin') {
            console.log('LoginScreen: User is admin, redirecting to admin dashboard');
            redirectPath = '/admin/dashboard';
          } else {
            console.log('LoginScreen: User is regular member, redirecting to member dashboard');
            redirectPath = '/dashboard';
          }
          
          let shouldClearContext = false;
          
          if (searchContext) {
            try {
              const context = JSON.parse(searchContext);
              const contextAge = Date.now() - context.timestamp;
              
              // Only use context if it's less than 5 minutes old
              if (contextAge < 5 * 60 * 1000) {
                console.log('LoginScreen: Found search context, will redirect to search results');
                // Keep the role-based redirect path
                shouldClearContext = true;
              } else {
                console.log('LoginScreen: Search context expired, clearing');
                localStorage.removeItem('searchRedirectContext');
              }
            } catch (error) {
              console.error('LoginScreen: Error parsing search context:', error);
              localStorage.removeItem('searchRedirectContext');
            }
          } else if (previewContext) {
            try {
              const context = JSON.parse(previewContext);
              const contextAge = Date.now() - context.timestamp;
              
              // Only use context if it's less than 5 minutes old
              if (contextAge < 5 * 60 * 1000) {
                console.log('LoginScreen: Found preview context, will redirect to appropriate section');
                // Keep the role-based redirect path
                shouldClearContext = true;
                // Store the context in a different key for the dashboard to use
                localStorage.setItem('pendingPreviewContext', previewContext);
              } else {
                console.log('LoginScreen: Preview context expired, clearing');
                localStorage.removeItem('previewRedirectContext');
              }
            } catch (error) {
              console.error('LoginScreen: Error parsing preview context:', error);
              localStorage.removeItem('previewRedirectContext');
            }
          }
          
          console.log('LoginScreen: Final redirect path:', redirectPath);
          
          // Show success state briefly before navigation
          setTimeout(() => {
            navigate(redirectPath);
            
            // Clear the original context after navigation
            if (shouldClearContext) {
              localStorage.removeItem('searchRedirectContext');
              localStorage.removeItem('previewRedirectContext');
            }
          }, 800);
        } else {
          setLoginStep('error');
          console.log('LoginScreen: Login failed with error:', result.error);
          setErrors({ general: result.error || 'Login failed' });
          setIsLoggingIn(false);
        }
      } catch (error) {
        setLoginStep('error');
        console.error('LoginScreen: Login error:', error);
        
        const { errorMessage, errorType, showRetry, showContactSupport } = handleLoginError(error);
        
        setErrors({ 
          general: errorMessage,
          type: errorType,
          showRetry,
          showContactSupport
        });
        setIsLoggingIn(false);
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col">
      <WelcomeHeader />
      
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                Welcome Back
              </h1>
              <p className="text-gray-600" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                Sign in to your account to continue
              </p>
            </div>

            {/* Success State */}
            {loginStep === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">Login successful! Redirecting...</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoggingIn}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter your email"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoggingIn}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter your password"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoggingIn}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Captcha Field */}
              <div className={isLoggingIn ? 'opacity-50 pointer-events-none' : ''}>
                <Captcha onValidationChange={setCaptchaValid} />
              </div>
              {errors.captcha && (
                <p className="mt-1 text-sm text-red-600">{errors.captcha}</p>
              )}

              {/* Error Display */}
              <ErrorDisplay
                error={errors.general}
                onRetry={() => {
                  setErrors({});
                  setIsLoggingIn(false);
                  setLoginStep('idle');
                }}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn || !captchaValid}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
                style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
              >
                {isLoggingIn ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center space-y-4">
              <div className="text-gray-600" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Sign up
                </Link>
              </div>
              
              {/* Add Forgot Password Link */}
              <div className="text-gray-600" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
