import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, ArrowLeft, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import WelcomeHeader from '../welcome/WelcomeHeader';
import ErrorDisplay from '../common/ErrorDisplay';
import api from '../../services/apiService';

const ForgotPasswordScreen = () => {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'newPassword', 'success'
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = () => {
    const newErrors = {};
    
    if (!formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = 'OTP must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNewPassword = () => {
    const newErrors = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await api.post('/auth/forgot-password', {
        email: formData.email.toLowerCase().trim()
      });
      
      console.log('OTP sent successfully:', response.data);
      setStep('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        switch (status) {
          case 404:
            errorMessage = 'Email not found. Please check your email address.';
            break;
          case 429:
            errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
            break;
          default:
            errorMessage = errorData?.error || errorMessage;
        }
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'No internet connection. Please check your network and try again.';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!validateOTP()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await api.post('/auth/verify-forgot-password-otp', {
        email: formData.email.toLowerCase().trim(),
        otp: formData.otp
      });
      
      console.log('OTP verified successfully:', response.data);
      setStep('newPassword');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      
      let errorMessage = 'Failed to verify OTP. Please try again.';
      
      if (error.response) {
        const errorData = error.response.data;
        errorMessage = errorData?.error || errorMessage;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validateNewPassword()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await api.post('/auth/reset-password', {
        email: formData.email.toLowerCase().trim(),
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      
      console.log('Password reset successfully:', response.data);
      setStep('success');
    } catch (error) {
      console.error('Error resetting password:', error);
      
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.response) {
        const errorData = error.response.data;
        errorMessage = errorData?.error || errorMessage;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await api.post('/auth/resend-forgot-password-otp', {
        email: formData.email.toLowerCase().trim()
      });
      
      console.log('OTP resent successfully:', response.data);
      setErrors({ success: 'OTP resent successfully! Please check your email.' });
    } catch (error) {
      console.error('Error resending OTP:', error);
      
      let errorMessage = 'Failed to resend OTP. Please try again.';
      
      if (error.response) {
        const errorData = error.response.data;
        errorMessage = errorData?.error || errorMessage;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSendOTP} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email address"
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Captcha Field */}

      {/* Error Display */}
      <ErrorDisplay
        error={errors.general}
        onRetry={() => {
          setErrors({});
          setIsLoading(false);
        }}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader className="w-5 h-5 animate-spin mr-2" />
            Sending OTP...
          </>
        ) : (
          'Send Reset Code'
        )}
      </button>
    </form>
  );

  const renderOTPStep = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          We've sent a 6-digit verification code to <strong>{formData.email}</strong>
        </p>
        <p className="text-sm text-gray-500">
          Please check your email and enter the code below
        </p>
      </div>

      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          id="otp"
          value={formData.otp}
          onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest ${
            errors.otp ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="000000"
          maxLength={6}
          disabled={isLoading}
        />
        {errors.otp && (
          <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
        )}
      </div>

      {/* Success/Error Messages */}
      {errors.success && (
        <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-green-700 text-sm">{errors.success}</span>
        </div>
      )}

      <ErrorDisplay
        error={errors.general}
        onRetry={() => {
          setErrors({});
          setIsLoading(false);
        }}
      />

      <div className="space-y-3">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </button>

        <button
          type="button"
          onClick={handleResendOTP}
          disabled={isLoading}
          className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
        >
          Didn't receive the code? Resend
        </button>
      </div>
    </form>
  );

  const renderNewPasswordStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="text-gray-600">
          Code verified! Please enter your new password
        </p>
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="newPassword"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            className={`w-full pr-10 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.newPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter new password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className={`w-full pr-10 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Confirm new password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      <ErrorDisplay
        error={errors.general}
        onRetry={() => {
          setErrors({});
          setIsLoading(false);
        }}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader className="w-5 h-5 animate-spin mr-2" />
            Resetting Password...
          </>
        ) : (
          'Reset Password'
        )}
      </button>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
        <p className="text-gray-600">
          Your password has been successfully reset. You can now log in with your new password.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg"
        >
          Go to Login
        </button>
        
        <button
          onClick={() => {
            setStep('email');
            setFormData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
            setErrors({});
          }}
          className="w-full py-2 text-gray-600 hover:text-gray-700 font-medium transition-colors"
        >
          Reset Another Password
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col">
      <WelcomeHeader />
      
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              to="/login"
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {step === 'email' && 'Forgot Password'}
                {step === 'otp' && 'Enter Verification Code'}
                {step === 'newPassword' && 'Set New Password'}
                {step === 'success' && 'Success!'}
              </h1>
              <p className="text-gray-600">
                {step === 'email' && 'Enter your email to receive a reset code'}
                {step === 'otp' && 'We sent a code to your email'}
                {step === 'newPassword' && 'Create a new secure password'}
                {step === 'success' && 'Your password has been reset'}
              </p>
            </div>

            {/* Progress Steps */}
            {step !== 'success' && (
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    1
                  </div>
                  <div className={`w-12 h-1 ${
                    ['otp', 'newPassword'].includes(step) ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === 'otp' ? 'bg-blue-600 text-white' : 
                    ['newPassword'].includes(step) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </div>
                  <div className={`w-12 h-1 ${
                    step === 'newPassword' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === 'newPassword' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    3
                  </div>
                </div>
              </div>
            )}

            {/* Form Content */}
            {step === 'email' && renderEmailStep()}
            {step === 'otp' && renderOTPStep()}
            {step === 'newPassword' && renderNewPasswordStep()}
            {step === 'success' && renderSuccessStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
