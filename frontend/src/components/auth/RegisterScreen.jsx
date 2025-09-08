

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Loader, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import TermsAndConditions from '../common/TermsAndConditions';
import { apiPost } from '../../services/apiService';
import WelcomeHeader from '../welcome/WelcomeHeader';
import api from '../../services/apiService';

// Simplified registration - no need for complex state management

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    workingType: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    captcha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  // Generate simple math captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operation = Math.random() > 0.5 ? '+' : '-';
    
    let question, answer;
    if (operation === '+') {
      question = `${num1} + ${num2} = ?`;
      answer = num1 + num2;
    } else {
      // Ensure positive result
      const larger = Math.max(num1, num2);
      const smaller = Math.min(num1, num2);
      question = `${larger} - ${smaller} = ?`;
      answer = larger - smaller;
    }
    
    setCaptchaQuestion(question);
    setCaptchaAnswer(answer.toString());
  };

  // Check email/phone availability
  const checkAvailability = async () => {
    if (!formData.email || !formData.phone) {
      setErrors({ general: 'Please enter both email and phone number first' });
      return false;
    }

    setCheckingAvailability(true);
    setErrors({});

    try {
      const response = await api.get('/auth/check-availability', {
        params: {
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.trim()
        }
      });

      if (response.data.available) {
        setAvailabilityChecked(true);
        generateCaptcha();
        return true;
      } else {
        const conflicts = response.data.conflicts;
        let errorMessage = '';
        
        if (conflicts.includes('email') && conflicts.includes('phone')) {
          errorMessage = 'Both email and phone number are already registered. Please use different credentials.';
        } else if (conflicts.includes('email')) {
          errorMessage = 'Email address is already registered. Please use a different email.';
        } else if (conflicts.includes('phone')) {
          errorMessage = 'Phone number is already registered. Please use a different phone number.';
        }
        
        setErrors({ general: errorMessage });
        return false;
      }
    } catch (error) {
      console.error('Availability check error:', error);
      setErrors({ general: 'Failed to check availability. Please try again.' });
      return false;
    } finally {
      setCheckingAvailability(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Working type validation
    if (!formData.workingType) {
      newErrors.workingType = 'Please select your working type';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    // Availability check validation
    if (!availabilityChecked) {
      newErrors.general = 'Please check email and phone availability first';
    }

    // Captcha validation
    if (!formData.captcha) {
      newErrors.captcha = 'Please solve the captcha';
    } else if (formData.captcha !== captchaAnswer) {
      newErrors.captcha = 'Incorrect answer. Please try again.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Reset availability check if email or phone changes
    if ((name === 'email' || name === 'phone') && availabilityChecked) {
      setAvailabilityChecked(false);
      setCaptchaQuestion('');
      setCaptchaAnswer('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      setErrors({});
      
      try {
        console.log('Starting registration process...');
        
        // Prepare payload for backend
        const payload = {
          full_name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.trim(),
          working_type: formData.workingType,
          password: formData.password
        };
        console.log('Registration payload:', payload);
        
        const result = await register(payload);
        console.log('Registration result:', result);
        
        // Check if registration was successful
        if (result && result.success) {
          console.log('Registration successful, redirecting to OTP verification...');
          
          // Store email for OTP verification
          localStorage.setItem('pendingRegistrationEmail', formData.email.toLowerCase().trim());
          localStorage.setItem('registrationTimestamp', Date.now().toString());
          
          // Show success message briefly before navigation
          setErrors({ success: 'Registration successful! Please verify your email to activate your account...' });
          
          // Small delay to show success message
          setTimeout(() => {
            navigate('/verify-otp', { 
              state: { email: formData.email.toLowerCase().trim() } 
            });
          }, 1000);
        } else {
          console.log('Registration failed:', result.error);
          setErrors({ general: result.error || 'Registration failed. Please try again.' });
        }
      } catch (error) {
        console.error('Registration error:', error);
        
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error.response) {
          const status = error.response.status;
          const errorData = error.response.data;
          
          switch (status) {
            case 400:
              errorMessage = errorData?.error || 'Invalid registration data. Please check your information.';
              break;
            case 409:
              errorMessage = 'Email or phone number already exists. Please use different credentials.';
              break;
            case 429:
              errorMessage = 'Too many registration attempts. Please wait a few minutes before trying again.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = errorData?.error || errorMessage;
          }
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage = 'No internet connection. Please check your network and try again.';
        }
        
        setErrors({ general: errorMessage });
      } finally {
        setLoading(false);
      }
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
                Create Account
              </h1>
              <p className="text-gray-600" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                Join our community today
              </p>
            </div>

            {/* Success State */}
            {errors.success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">{errors.success}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter your full name"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
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
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter your email"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter your phone number"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Availability Check Button */}
              <div>
                <button
                  type="button"
                  onClick={checkAvailability}
                  disabled={checkingAvailability || !formData.email || !formData.phone || loading}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
                  style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                >
                  {checkingAvailability ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      Checking Availability...
                    </>
                  ) : availabilityChecked ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Email & Phone Available
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Check Email & Phone Availability
                    </>
                  )}
                </button>
              </div>

              {/* Working Type Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Working Type
                </label>
                <select
                  name="workingType"
                  value={formData.workingType}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                    errors.workingType ? 'border-red-500' : 'border-gray-300'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                >
                  <option value="">Select your working type</option>
                  <option value="govt employee">Government Employee</option>
                  <option value="private employee">Private Employee</option>
                  <option value="businessman">Businessman</option>
                  <option value="student">Student</option>
                  <option value="unemployed">Unemployed</option>
                </select>
                {errors.workingType && (
                  <p className="mt-1 text-sm text-red-600">{errors.workingType}</p>
                )}
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
                    disabled={loading}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Create a password"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={loading}
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

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Confirm your password"
                    style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label className="text-sm text-gray-700" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Terms and Conditions
                    </button>
                  </label>
                  {errors.acceptTerms && (
                    <p className="mt-1 text-sm text-red-600">{errors.acceptTerms}</p>
                  )}
                </div>
              </div>

              {/* Captcha Field */}
              {captchaQuestion && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                    Security Verification
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-center">
                        <p className="text-lg font-mono text-gray-800" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                          {captchaQuestion}
                        </p>
                      </div>
                    </div>
                    <input
                      type="text"
                      name="captcha"
                      value={formData.captcha}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-20 px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-center text-lg font-mono ${
                        errors.captcha ? 'border-red-500' : 'border-gray-300'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="?"
                      style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                    />
                  </div>
                  {errors.captcha && (
                    <p className="mt-1 text-sm text-red-600">{errors.captcha}</p>
                  )}
                </div>
              )}


              {/* Error Display */}
              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{errors.general}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !availabilityChecked || !captchaQuestion}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
                style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : !availabilityChecked ? (
                  'Check Availability First'
                ) : !captchaQuestion ? (
                  'Complete Security Check'
                ) : (
                  'Create Account'
                )}
              </button>

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

        </div>
      </div>

      {/* Terms and Conditions Modal */}
      <TermsAndConditions isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

export default RegisterScreen;