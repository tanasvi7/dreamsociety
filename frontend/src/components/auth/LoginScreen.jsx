
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
    if (error.code === 'ERR_NETWORK' || 
        error.message.includes('Network Error') ||
        error.message.includes('ERR_INTERNET_DISCONNECTED')) {
      errorMessage = 'No internet connection. Please check your network and try again.';
      errorType = 'network';
      showRetry = true;
    }
    // Timeout errors
    else if (error.code === 'ECONNABORTED' || 
             error.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please check your connection and try again.';
      errorType = 'timeout';
      showRetry = true;
    }
    // Server errors
    else if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      switch (status) {
        case 400:
          errorMessage = errorData?.error || 'Invalid request. Please check your email and password.';
          errorType = 'validation';
          break;
        case 401:
          errorMessage = 'Invalid email or password. Please try again.';
          errorType = 'credentials';
          break;
        case 403:
          errorMessage = 'Access denied. Your account may be suspended. Please contact support.';
          errorType = 'access_denied';
          showContactSupport = true;
          break;
        case 404:
          errorMessage = 'Server not found. Please check if the service is available.';
          errorType = 'server_not_found';
          showRetry = true;
          break;
        case 408:
          errorMessage = 'Request timeout. Please try again.';
          errorType = 'timeout';
          showRetry = true;
          break;
        case 429:
          errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
          errorType = 'rate_limit';
          showRetry = true;
          break;
        case 500:
          errorMessage = 'Server error. Our team has been notified. Please try again later.';
          errorType = 'server_error';
          showRetry = true;
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
          errorType = 'service_unavailable';
          showRetry = true;
          break;
        default:
          errorMessage = errorData?.error || 'An unexpected error occurred. Please try again.';
          errorType = 'unknown';
          showRetry = true;
      }
    }
    // Request made but no response
    else if (error.request) {
      errorMessage = 'No response from server. Please check your connection and try again.';
      errorType = 'no_response';
      showRetry = true;
    }
    // Other errors
    else {
      errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      errorType = 'unknown';
      showRetry = true;
    }

    return {
      message: errorMessage,
      type: errorType,
      showRetry,
      showContactSupport
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setIsLoggingIn(true);
        setLoginStep('authenticating');
        setErrors({});
        
        console.log('LoginScreen: Submitting form with data:', formData);
        const result = await login(formData);
        console.log('LoginScreen: Login result:', result);
        
        if (result.success) {
          setLoginStep('success');
          console.log('LoginScreen: Login successful, navigating to:', result.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
          
          // Show success state briefly before navigation
          setTimeout(() => {
            if (result.user?.role === 'admin') {
              navigate('/admin/dashboard');
            } else {
              navigate('/dashboard');
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
        setIsLoggingIn(false);
        
        const errorInfo = handleLoginError(error);
        setErrors({ 
          general: errorInfo.message,
          type: errorInfo.type,
          showRetry: errorInfo.showRetry,
          showContactSupport: errorInfo.showContactSupport
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear form error when user starts typing
    if (errors.form) {
      setErrors(prev => ({
        ...prev,
        form: ''
      }));
    }
    // Reset login state when user starts typing
    if (isLoggingIn || loginStep !== 'idle') {
      setIsLoggingIn(false);
      setLoginStep('idle');
    }
  };

  const resetLoginState = () => {
    setIsLoggingIn(false);
    setLoginStep('idle');
    setErrors({});
  };

  return (
    <div className="min-h-screen flex flex-col">
      <WelcomeHeader />
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative"
           style={{
             backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0.5) 100%), url("back.png")',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat',
             backgroundSize: 'cover',
           }}>
        <div className="max-w-md w-full relative z-10">
          {/* Form Container */}
          <div className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 relative transition-all duration-300 ${
            isLoggingIn ? 'scale-[1.02] shadow-blue-500/20' : ''
          }`}>
            {/* Loading Overlay */}
            {isLoggingIn && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
                  </div>
                  <p className="text-gray-600 font-medium" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                    Authenticating...
                  </p>
                </div>
              </div>
            )}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>Welcome Back</h2>
              <p className="text-gray-600" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>Sign in to your UNITY Nest account</p>
            </div>

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
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter your password"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
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

            {/* Enhanced Error Display */}
            <ErrorDisplay
              error={errors.general}
              errorType={errors.type}
              showRetry={errors.showRetry}
              showContactSupport={errors.showContactSupport}
              onRetry={() => {
                setErrors({});
                setLoginStep('idle');
                setIsLoggingIn(false);
              }}
              onContactSupport={() => {
                // You can implement contact support functionality here
                window.open('mailto:support@dreamsociety.com', '_blank');
              }}
            />

            {/* Loading Progress Bar */}
            {isLoggingIn && (
              <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1 rounded-full animate-pulse" 
                     style={{
                       animation: 'loading 2s ease-in-out infinite',
                       background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #3b82f6)',
                       backgroundSize: '200% 100%'
                     }}>
                </div>
              </div>
            )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn || loading}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center shadow-lg ${
                  loginStep === 'success' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-105' 
                    : loginStep === 'error'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 hover:scale-105'
                } ${(isLoggingIn || loading) ? 'opacity-75 cursor-not-allowed' : ''}`}
                style={{fontFamily: 'Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
              >
                {loginStep === 'success' ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2 animate-pulse" />
                    Welcome Back!
                  </>
                ) : loginStep === 'error' ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Try Again
                  </>
                ) : isLoggingIn || loading ? (
                  <>
                    <div className="relative">
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full animate-pulse"></div>
                    </div>
                    Authenticating...
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
