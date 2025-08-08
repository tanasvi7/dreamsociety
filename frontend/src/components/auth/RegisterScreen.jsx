
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Loader } from 'lucide-react';
import Captcha from '../common/Captcha';
import TermsAndConditions from '../common/TermsAndConditions';
import { apiPost, checkAvailability } from '../../services/apiService';
import WelcomeHeader from '../welcome/WelcomeHeader';

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
  const { register, loading, pendingRegistration } = useAuth();
  const navigate = useNavigate();

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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    } else if (!availabilityStatus.email.available) {
      console.log('❌ Form validation: Email already exists in database');
      newErrors.email = 'Email address is already registered. Please try a different email address.';
    } else {
      console.log('✅ Form validation: Email is available in database');
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    } else if (!availabilityStatus.phone.available) {
      console.log('❌ Form validation: Phone already exists in database');
      newErrors.phone = 'Phone number is already registered. Please try a different phone number.';
    } else {
      console.log('✅ Form validation: Phone is available in database');
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password should be at least 8 characters for better security';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!captchaValid) {
      newErrors.captcha = 'Please complete the security verification';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the Terms and Conditions to continue';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        console.log('Starting registration process...');
        // Prepare payload for backend
        const payload = {
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        };
        console.log('Registration payload:', payload);
        
        const result = await register(payload);
        console.log('Registration result:', result);
        
        // Check if registration was successful
        if (result && result.success) {
          console.log('Registration successful, navigating to OTP verification...');
          
          // Preserve any redirect context for after OTP verification
          const searchContext = localStorage.getItem('searchRedirectContext');
          const previewContext = localStorage.getItem('previewRedirectContext');
          
          if (searchContext) {
            localStorage.setItem('pendingSearchContext', searchContext);
          }
          if (previewContext) {
            localStorage.setItem('pendingPreviewContext', previewContext);
          }
          
          navigate('/verify-otp');
        } else {
          console.log('Registration failed:', result.error);
          setErrors({ submit: result.error || 'Registration failed. Please try again.' });
        }
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ submit: 'Registration failed. Please try again.' });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear submit error when user starts typing
    if (errors.submit) {
      setErrors(prev => ({
        ...prev,
        submit: ''
      }));
    }
    
    // Reset availability status when user starts typing
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`h-5 w-5 ${errors.name ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-300 ${
                      errors.name 
                        ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                    placeholder="Enter your full name"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                  />
                  {errors.name && (
                    <div className="mt-2 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-700 font-medium">{errors.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${errors.email || (formData.email && !availabilityStatus.email.checking && !availabilityStatus.email.available) ? 'text-red-400' : formData.email && !availabilityStatus.email.checking && availabilityStatus.email.available ? 'text-green-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-300 ${
                      errors.email || (formData.email && !availabilityStatus.email.checking && !availabilityStatus.email.available)
                        ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-500' 
                        : formData.email && !availabilityStatus.email.checking && availabilityStatus.email.available
                        ? 'border-green-400 bg-green-50 focus:ring-green-200 focus:border-green-500'
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                    placeholder="Enter your email"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                  />
                  {/* Availability indicator */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {availabilityStatus.email.checking && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    )}
                    {!availabilityStatus.email.checking && formData.email && (
                      <>
                        {availabilityStatus.email.available ? (
                          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Error and Success Messages - Outside the relative container */}
                {errors.email && (
                  <div className="mt-2 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">{errors.email}</p>
                  </div>
                )}
                {formData.email && !availabilityStatus.email.checking && availabilityStatus.email.available && !errors.email && (
                  <div className="mt-2 flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                     <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                     </svg>
                     <p className="text-sm text-green-700 font-medium">✓ Email is available</p>
                   </div>
                 )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className={`h-5 w-5 ${errors.phone || (formData.phone && !availabilityStatus.phone.checking && !availabilityStatus.phone.available) ? 'text-red-400' : formData.phone && !availabilityStatus.phone.checking && availabilityStatus.phone.available ? 'text-green-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-300 ${
                      errors.phone || (formData.phone && !availabilityStatus.phone.checking && !availabilityStatus.phone.available)
                        ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-500' 
                        : formData.phone && !availabilityStatus.phone.checking && availabilityStatus.phone.available
                        ? 'border-green-400 bg-green-50 focus:ring-green-200 focus:border-green-500'
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                    placeholder="+91 9876543210"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                  />
                  {/* Availability indicator */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {availabilityStatus.phone.checking && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    )}
                    {!availabilityStatus.phone.checking && formData.phone && (
                      <>
                        {availabilityStatus.phone.available ? (
                          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Error and Success Messages - Outside the relative container */}
                {errors.phone && (
                  <div className="mt-2 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">{errors.phone}</p>
                  </div>
                )}
                {formData.phone && !availabilityStatus.phone.checking && availabilityStatus.phone.available && !errors.phone && (
                  <div className="mt-2 flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-green-700 font-medium">✓ Phone number is available</p>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-300 ${
                      errors.password 
                        ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                    placeholder="Create a password"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                  {errors.password && (
                    <div className="mt-2 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-700 font-medium">{errors.password}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${errors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-300 ${
                      errors.confirmPassword 
                        ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                    placeholder="Confirm your password"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                  {errors.confirmPassword && (
                    <div className="mt-2 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-700 font-medium">{errors.confirmPassword}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Captcha Field */}
              <Captcha onValidationChange={setCaptchaValid} />
              {errors.captcha && (
                <div className="mt-2 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700 font-medium">{errors.captcha}</p>
                </div>
              )}

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label className="text-sm text-gray-700" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={handleTermsClick}
                      className="text-blue-600 hover:text-blue-700 underline font-medium"
                      style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                    >
                      Terms and Conditions
                    </button>
                    {' '}of UNITY Nest
                  </label>
                  {errors.acceptTerms && (
                    <div className="mt-2 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-700 font-medium">{errors.acceptTerms}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-600 hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                style={{fontFamily: 'Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
              
              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-4 rounded-xl text-center shadow-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{errors.submit}</span>
                  </div>
                </div>
              )}
            </form>

            {/* Links */}
            <div className="mt-6 text-center">
              <div className="text-gray-600" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      <TermsAndConditions 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
      />
    </div>
  );
};

export default RegisterScreen;
