import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Loader, AlertCircle, CheckCircle, Mail, RefreshCw } from 'lucide-react';
import WelcomeHeader from '../welcome/WelcomeHeader';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [success, setSuccess] = useState(false);
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state or localStorage
  const email = location.state?.email || localStorage.getItem('pendingRegistrationEmail');

  useEffect(() => {
    // If no email found, redirect to registration
    if (!email) {
      navigate('/register');
      return;
    }

    // Start resend cooldown timer
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const validateOTP = () => {
    const newErrors = {};

    if (!otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
      
      // Clear error when user starts typing
      if (errors.otp) {
        setErrors(prev => ({ ...prev, otp: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateOTP()) return;

    setLoading(true);
    setErrors({});

    try {
      console.log('Verifying OTP for email:', email);
      
      const result = await verifyOtp({
        email: email.toLowerCase().trim(),
        otp: otp.trim()
      });

      if (result.success) {
        console.log('OTP verification successful');
        setSuccess(true);
        
        // Show success message briefly before navigation
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        console.log('OTP verification failed:', result.error);
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setErrors({ general: 'OTP verification failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setErrors({});

    try {
      const result = await resendOtp(email);
      
      if (result.success) {
        setResendCooldown(60); // 60 seconds cooldown
        setErrors({ success: 'OTP resent successfully. Please check your email.' });
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setErrors({ general: 'Failed to resend OTP. Please try again.' });
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToRegister = () => {
    // Clear pending registration data
    localStorage.removeItem('pendingRegistrationEmail');
    localStorage.removeItem('registrationTimestamp');
    navigate('/register');
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col">
      <WelcomeHeader />
      
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={handleBackToRegister}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Registration
            </button>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                Verify Your Email
              </h1>
              <p className="text-gray-600" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                We've sent a 6-digit code to
              </p>
              <p className="text-blue-600 font-semibold">{email}</p>
            </div>

            {/* Success State */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">Email verified successfully! Your account is now active. Redirecting to dashboard...</span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {errors.success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">{errors.success}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={handleChange}
                  disabled={loading || success}
                  className={`w-full px-4 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-center text-2xl tracking-widest font-mono ${
                    errors.otp ? 'border-red-500' : 'border-gray-300'
                  } ${loading || success ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="000000"
                  maxLength={6}
                  style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                />
                {errors.otp && (
                  <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
                )}
              </div>

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
                disabled={loading || success || otp.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
                style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Verified!
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendLoading || resendCooldown > 0 || success}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                  style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
                >
                  {resendLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-1" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Resend Code
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
                <strong>Check your spam folder</strong> if you don't see the email in your inbox.
                The verification code will expire in 10 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
