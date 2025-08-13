

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import Captcha from '../common/Captcha';
import TermsAndConditions from '../common/TermsAndConditions';
import { apiPost, checkAvailability, clearPendingRegistration } from '../../services/apiService';
import WelcomeHeader from '../welcome/WelcomeHeader';

// Utility function to clear stuck registration state
const clearStuckRegistrationState = () => {
  const currentRegistrationEmail = localStorage.getItem('currentRegistrationEmail');
  const registrationStartTime = localStorage.getItem('registrationStartTime');
  
  if (currentRegistrationEmail && registrationStartTime) {
    const timeSinceStart = Date.now() - parseInt(registrationStartTime);
    const maxProcessingTime = 2 * 60 * 1000; // 2 minutes
    
    if (timeSinceStart > maxProcessingTime) {
      console.log('Clearing stuck registration state for:', currentRegistrationEmail);
      localStorage.removeItem('currentRegistrationEmail');
      localStorage.removeItem('registrationStartTime');
      return true;
    }
  }
  return false;
};

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [captchaValid, setCaptchaValid] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState({
    email: { available: true, checking: false },
    phone: { available: true, checking: false }
  });
  const [showTerms, setShowTerms] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const { register, loading, pendingRegistration, testBackendConnection } = useAuth();
  const navigate = useNavigate();

  // State to handle the specific loading animation for OTP sending
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Clear stuck registration state on component mount
  useEffect(() => {
    const wasCleared = clearStuckRegistrationState();
    if (wasCleared) {
      console.log('Stuck registration state cleared on component mount');
    }
  }, []);

  // Redirect to OTP verification if there's already a pending registration
  useEffect(() => {
    if (pendingRegistration) {
      navigate('/verify-otp');
    }
  }, [pendingRegistration, navigate]);

  // Debounced email and phone availability check
  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (formData.email && /\S+@\S+\.\S+/.test(formData.email)) {
        setAvailabilityStatus(prev => ({
          ...prev,
          email: { ...prev.email, checking: true }
        }));
        try {
          console.log('🔍 Checking email availability in database:', formData.email);
          const data = await checkAvailability(formData.email);
          console.log('📧 Database check result:', data);
          
          const isAvailable = data.available && !data.conflicts.includes('email');
          console.log('📧 Email availability:', isAvailable ? 'AVAILABLE' : 'ALREADY EXISTS');
          
          setAvailabilityStatus(prev => ({
            ...prev,
            email: { 
              available: isAvailable,
              checking: false 
            }
          }));
          
          // Set error if email is not available
          if (!data.available && data.conflicts.includes('email')) {
            console.log('❌ Email validation failed: Already registered in database');
            setErrors(prev => ({
              ...prev,
              email: 'Email address is already registered. Please try a different email address.'
            }));
          } else if (errors.email && errors.email.includes('already registered')) {
            console.log('✅ Email validation passed: Available in database');
            setErrors(prev => ({
              ...prev,
              email: ''
            }));
          }
        } catch (error) {
          console.error('❌ Email availability check error:', error);
          setAvailabilityStatus(prev => ({
            ...prev,
            email: { available: true, checking: false }
          }));
        }
      }
    };

    const timeoutId = setTimeout(checkEmailAvailability, 800);
    return () => clearTimeout(timeoutId);
  }, [formData.email, errors.email]);

  // Debounced phone availability check
  useEffect(() => {
    const checkPhoneAvailability = async () => {
      if (formData.phone && /^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
        setAvailabilityStatus(prev => ({
          ...prev,
          phone: { ...prev.phone, checking: true }
        }));
        try {
          console.log('🔍 Checking phone availability in database:', formData.phone);
          const data = await checkAvailability(undefined, formData.phone);
          console.log('📱 Database check result:', data);
          
          const isAvailable = data.available && !data.conflicts.includes('phone');
          console.log('📱 Phone availability:', isAvailable ? 'AVAILABLE' : 'ALREADY EXISTS');
          
          setAvailabilityStatus(prev => ({
            ...prev,
            phone: { 
              available: isAvailable,
              checking: false 
            }
          }));
          
          // Set error if phone is not available
          if (!data.available && data.conflicts.includes('phone')) {
            console.log('❌ Phone validation failed: Already registered in database');
            setErrors(prev => ({
              ...prev,
              phone: 'Phone number is already registered. Please try a different phone number.'
            }));
          } else if (errors.phone && errors.phone.includes('already registered')) {
            console.log('✅ Phone validation passed: Available in database');
            setErrors(prev => ({
              ...prev,
              phone: ''
            }));
          }
        } catch (error) {
          console.error('❌ Phone availability check error:', error);
          setAvailabilityStatus(prev => ({
            ...prev,
            phone: { available: true, checking: false }
          }));
        }
      }
    };

    const timeoutId = setTimeout(checkPhoneAvailability, 800);
    return () => clearTimeout(timeoutId);
  }, [formData.phone, errors.phone]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Full name must be less than 50 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email && !availabilityStatus.email.checking && !availabilityStatus.email.available) {
      newErrors.email = 'Email address is already registered. Please try a different email address.';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (minimum 10 digits)';
    } else if (formData.phone && !availabilityStatus.phone.checking && !availabilityStatus.phone.available) {
      newErrors.phone = 'Phone number is already registered. Please try a different phone number.';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password should be at least 8 characters for better security';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password should contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Captcha validation
    if (!captchaValid) {
      newErrors.captcha = 'Please complete the security verification';
    }

    // Terms validation
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the Terms and Conditions to continue';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) return;
    
    // Check submit attempts limit
    if (submitAttempts >= 3) {
      setErrors({ submit: 'Too many submission attempts. Please wait a few minutes before trying again.' });
      return;
    }
    
    if (validateForm()) {
      setIsSendingOtp(true); // Start the specific OTP sending loading state
      try {
        console.log('Starting registration process...');
        
        // Clear any previous errors
        setErrors({});
        
        // Prepare payload for backend
        const payload = {
          full_name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.trim(),
          password: formData.password
        };
        console.log('Registration payload:', payload);
        
        const result = await register(payload);
        console.log('Registration result:', result);
        
        // Check if registration was successful
        if (result && result.success) {
          console.log('Registration successful, navigating to OTP verification...');
          
          // Show success message briefly before navigation
          setErrors({ success: 'Registration successful! Redirecting to verification...' });
          
          // Preserve any redirect context for after OTP verification
          const searchContext = localStorage.getItem('searchRedirectContext');
          const previewContext = localStorage.getItem('previewRedirectContext');
          
          if (searchContext) {
            localStorage.setItem('pendingSearchContext', searchContext);
          }
          if (previewContext) {
            localStorage.setItem('pendingPreviewContext', previewContext);
          }
          
          // Small delay to show success message
          setTimeout(() => {
            navigate('/verify-otp');
          }, 1000);
        } else {
          console.log('Registration failed:', result.error);
          
          // Handle specific error types
          if (result.type === 'email_exists') {
            setErrors({ email: result.error });
          } else if (result.type === 'phone_exists') {
            setErrors({ phone: result.error });
          } else if (result.type === 'both_exist') {
            setErrors({ email: result.error, phone: result.error });
          } else if (result.type === 'registration_in_progress') {
            // Add a manual reset option for registration in progress
            setErrors({ 
              submit: `${result.error} Click here to reset and try again.`,
              showResetOption: true 
            });
          } else if (result.type === 'backend_unavailable') {
            setErrors({ 
              submit: result.error,
              showResetOption: true 
            });
          } else {
            setErrors({ submit: result.error || 'Registration failed. Please try again.' });
          }
        }
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ submit: 'Registration failed. Please try again.' });
      } finally {
        setIsSendingOtp(false); // End the specific OTP sending loading state
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear all errors when user starts typing
    setErrors(prev => {
      const newErrors = { ...prev };
      
      // Clear the specific field error
      if (newErrors[name]) {
        delete newErrors[name];
      }
      
      // Clear submit error
      if (newErrors.submit) {
        delete newErrors.submit;
      }
      
      // Clear success message
      if (newErrors.success) {
        delete newErrors.success;
      }
      
      // Clear captcha error if user is typing in any field
      if (newErrors.captcha) {
        delete newErrors.captcha;
      }
      
      // Clear acceptTerms error if user is typing in any field
      if (newErrors.acceptTerms) {
        delete newErrors.acceptTerms;
      }
      
      return newErrors;
    });
    
    // Reset availability status when user starts typing in email or phone
    if (name === 'email' || name === 'phone') {
      setAvailabilityStatus(prev => ({
        ...prev,
        [name]: { available: true, checking: false }
      }));
    }
  };

  const handleTermsClick = (e) => {
    e.preventDefault();
    setShowTerms(true);
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    
    // Clear the specific field error when user focuses on the input
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Manual reset function for stuck registration state
  const handleManualReset = async () => {
    try {
      // Clear all registration-related localStorage items
      localStorage.removeItem('currentRegistrationEmail');
      localStorage.removeItem('registrationStartTime');
      localStorage.removeItem('pendingRegistrationEmail');
      localStorage.removeItem('registrationTimestamp');
      
      // Clear form errors
      setErrors({});
      
      // Reset submit attempts
      setSubmitAttempts(0);
      
      // If we have an email in the form, try to clear the pending registration on the backend
      if (formData.email) {
        try {
          const result = await clearPendingRegistration(formData.email.toLowerCase().trim());
          console.log('Backend registration cleared:', result.message);
        } catch (error) {
          console.log('Error clearing backend registration:', error.message);
          // Continue with frontend reset even if backend call fails
        }
      }
      
      console.log('Manual registration reset completed');
    } catch (error) {
      console.error('Error during manual reset:', error);
      // Still clear frontend state even if there's an error
      setErrors({});
      setSubmitAttempts(0);
    }
  };

  // Debug function to test backend connectivity
  const handleDebugBackend = async () => {
    try {
      console.log('Testing backend connectivity...');
      const result = await testBackendConnection();
      
      if (result.success) {
        setErrors({ success: 'Backend is working properly!' });
      } else {
        setErrors({ 
          submit: `Backend test failed: ${result.error}`,
          debug: result.details 
        });
      }
    } catch (error) {
      console.error('Debug test error:', error);
      setErrors({ submit: 'Debug test failed: ' + error.message });
    }
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
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>Create Account</h2>
              <p className="text-gray-600" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>Join UNITY Nest today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <User className={`h-5 w-5 ${errors.name ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-300 ${
                      errors.name 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                    placeholder="Enter your full name"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                    disabled={loading}
                  />
                </div>
                {errors.name && (
                  <div className="mt-2 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{errors.name}</p>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Mail className={`h-5 w-5 ${errors.email || (formData.email && !availabilityStatus.email.checking && !availabilityStatus.email.available) ? 'text-red-400' : formData.email && !availabilityStatus.email.checking && availabilityStatus.email.available ? 'text-green-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-300 ${
                      errors.email || (formData.email && !availabilityStatus.email.checking && !availabilityStatus.email.available)
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-500' 
                        : formData.email && !availabilityStatus.email.checking && availabilityStatus.email.available
                        ? 'border-green-400 focus:ring-green-200 focus:border-green-500'
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                    placeholder="Enter your email"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                    disabled={loading}
                  />
                  {/* Availability indicator */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-10">
                    {availabilityStatus.email.checking && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    )}
                    {!availabilityStatus.email.checking && formData.email && (
                      <>
                        {availabilityStatus.email.available ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </>
                    )}
                  </div>
                </div>
                {errors.email && (
                  <div className="mt-2 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{errors.email}</p>
                  </div>
                )}
              </div>

              {/* Phone Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Phone className={`h-5 w-5 ${errors.phone || (formData.phone && !availabilityStatus.phone.checking && !availabilityStatus.phone.available) ? 'text-red-400' : formData.phone && !availabilityStatus.phone.checking && availabilityStatus.phone.available ? 'text-green-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-300 ${
                      errors.phone || (formData.phone && !availabilityStatus.phone.checking && !availabilityStatus.phone.available)
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-500' 
                        : formData.phone && !availabilityStatus.phone.checking && availabilityStatus.phone.available
                        ? 'border-green-400 focus:ring-green-200 focus:border-green-500'
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                    placeholder="Enter your phone number"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                    disabled={loading}
                  />
                  {/* Availability indicator */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-10">
                    {availabilityStatus.phone.checking && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    )}
                    {!availabilityStatus.phone.checking && formData.phone && (
                      <>
                        {availabilityStatus.phone.available ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </>
                    )}
                  </div>
                </div>
                {errors.phone && (
                  <div className="mt-2 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{errors.phone}</p>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-300 ${
                      errors.password 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                    placeholder="Create a password"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                    disabled={loading}
                  />
                  {/* Eye icon indicator */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-10">
                    <button
                      type="button"
                      className="hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <div className="mt-2 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{errors.password}</p>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className={`h-5 w-5 ${errors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-300 ${
                      errors.confirmPassword 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                    placeholder="Confirm your password"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                    disabled={loading}
                  />
                  {/* Eye icon indicator */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-10">
                    <button
                      type="button"
                      className="hover:text-gray-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.confirmPassword && (
                  <div className="mt-2 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{errors.confirmPassword}</p>
                  </div>
                )}
              </div>

              {/* Captcha Field */}
              <div className="relative">
                <Captcha onValidationChange={setCaptchaValid} />
                {errors.captcha && (
                  <div className="mt-2 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{errors.captcha}</p>
                  </div>
                )}
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="relative">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <label className="text-sm text-gray-700" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={handleTermsClick}
                        className="text-blue-600 hover:text-blue-700 underline font-medium"
                        style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                        disabled={loading}
                      >
                        Terms and Conditions
                      </button>
                      {' '}of UNITY Nest
                    </label>
                  </div>
                </div>
                {errors.acceptTerms && (
                  <div className="mt-2 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{errors.acceptTerms}</p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || isSendingOtp}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-600 hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                style={{fontFamily: 'Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
              >
                {isSendingOtp ? (
                  <div className="flex items-center space-x-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Sending OTP...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
              
              
              {/* Success Message */}
              {errors.success && (
                <div className="mt-2 flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-700 font-medium">{errors.success}</p>
                </div>
              )}
              
              {/* Submit Error */}
              {errors.submit && (
                <div className="mt-2 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700 font-medium">{errors.submit}</p>
                    {/* Show reset button for backend unavailable errors or registration in progress */}
                    {(errors.submit.includes('Cannot connect to the server') || 
                      errors.submit.includes('Registration already in progress')) && (
                      <button
                        type="button"
                        onClick={handleManualReset}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 underline"
                      >
                        Reset and try again
                      </button>
                    )}
                    {/* Show debug information if available */}
                    {errors.debug && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer">Show debug info</summary>
                        <pre className="text-xs text-gray-700 mt-1 bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(errors.debug, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Attempts Warning */}
              {submitAttempts >= 2 && (
                <div className="mt-2 flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <p className="text-sm text-yellow-700 font-medium">
                    {submitAttempts}/3 attempts used. Too many failed attempts will require a cooldown period.
                  </p>
                </div>
              )}
            </form>

            {/* Links */}
            <div className="mt-6 text-center">
              <div className="text-gray-600" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                Already have a account?
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold ml-1">
                  Login
                </Link>
              </div>
            </div>
          </div>

          {/* Back button */}
          <Link to="/" className="absolute top-4 left-4 inline-flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showTerms && <TermsAndConditions onClose={() => setShowTerms(false)} />}
    </div>
  );
};

export default RegisterScreen;