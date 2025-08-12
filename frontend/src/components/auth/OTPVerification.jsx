
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Loader, Shield, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import WelcomeHeader from '../welcome/WelcomeHeader';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);
  const inputRefs = useRef([]);
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  // Get pending registration email from localStorage
  const pendingEmail = localStorage.getItem('pendingRegistrationEmail');
  const registrationTimestamp = localStorage.getItem('registrationTimestamp');

  useEffect(() => {
    // Check if registration session is valid
    if (!pendingEmail || !registrationTimestamp) {
      console.log('No pending registration found, redirecting to register');
      navigate('/register');
      return;
    }

    // Check if session has expired (30 minutes)
    const sessionAge = Date.now() - parseInt(registrationTimestamp);
    const maxSessionAge = 30 * 60 * 1000; // 30 minutes
    
    if (sessionAge > maxSessionAge) {
      console.log('Registration session expired');
      setSessionExpired(true);
      // Clear expired session data
      localStorage.removeItem('pendingRegistrationEmail');
      localStorage.removeItem('registrationTimestamp');
      return;
    }
    
    // Set initial timer (10 minutes)
    setTimer(10 * 60); // 10 minutes in seconds
  }, [pendingEmail, registrationTimestamp, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => {
          const newTimer = prev - 1;
          if (newTimer <= 0) {
            setCanResend(true);
          }
          return newTimer;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit) && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (otpValue = otp.join('')) => {
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    // Check verification attempts limit
    if (verificationAttempts >= 5) {
      setError('Too many verification attempts. Please request a new OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyOtp({ email: pendingEmail, otp: otpValue });
      
      if (result.success) {
        console.log('OTP verification successful, checking for redirect context...');
        
        // Check for search or preview redirect context
        const pendingSearchContext = localStorage.getItem('pendingSearchContext');
        const pendingPreviewContext = localStorage.getItem('pendingPreviewContext');
        
        let redirectPath = '/dashboard';
        let shouldClearContext = false;
        
        if (pendingSearchContext) {
          try {
            const context = JSON.parse(pendingSearchContext);
            const contextAge = Date.now() - context.timestamp;
            
            // Only use context if it's less than 5 minutes old
            if (contextAge < 5 * 60 * 1000) {
              console.log('OTPVerification: Found search context, will redirect to search results');
              redirectPath = '/dashboard';
              shouldClearContext = true;
            } else {
              console.log('OTPVerification: Search context expired, clearing');
              localStorage.removeItem('pendingSearchContext');
            }
          } catch (error) {
            console.error('OTPVerification: Error parsing search context:', error);
            localStorage.removeItem('pendingSearchContext');
          }
        } else if (pendingPreviewContext) {
          try {
            const context = JSON.parse(pendingPreviewContext);
            const contextAge = Date.now() - context.timestamp;
            
            // Only use context if it's less than 5 minutes old
            if (contextAge < 5 * 60 * 1000) {
              console.log('OTPVerification: Found preview context, will redirect to appropriate section');
              redirectPath = '/dashboard';
              shouldClearContext = true;
            } else {
              console.log('OTPVerification: Preview context expired, clearing');
              localStorage.removeItem('pendingPreviewContext');
            }
          } catch (error) {
            console.error('OTPVerification: Error parsing preview context:', error);
            localStorage.removeItem('pendingPreviewContext');
          }
        }
        
        console.log('OTPVerification: Final redirect path:', redirectPath);
        navigate(redirectPath);
        
        // Clear the original context after navigation
        if (shouldClearContext) {
          localStorage.removeItem('searchRedirectContext');
          localStorage.removeItem('previewRedirectContext');
        }
      } else {
        setVerificationAttempts(prev => prev + 1);
        
        // Handle specific error types
        if (result.type === 'otp_expired') {
          setError('OTP has expired. Please request a new one.');
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0].focus();
        } else if (result.type === 'max_attempts_exceeded' || result.error?.includes('Maximum verification attempts exceeded')) {
          setError('Too many failed attempts. Please request a new OTP.');
          setOtp(['', '', '', '', '', '']);
          // Enable resend button immediately
          setCanResend(true);
          setTimer(0);
          inputRefs.current[0].focus();
        } else if (result.type === 'session_expired') {
          setSessionExpired(true);
          setError('Registration session expired. Please start registration again.');
        } else {
          setError(result.error || 'Invalid OTP. Please try again.');
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0].focus();
        }
      }
    } catch (error) {
      setVerificationAttempts(prev => prev + 1);
      
      // Handle specific error messages from backend
      if (error.message?.includes('Maximum verification attempts exceeded')) {
        setError('Too many failed attempts. Please request a new OTP.');
        setCanResend(true);
        setTimer(0);
      } else {
        setError('Verification failed. Please try again.');
      }
      
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendLoading) return;

    setResendLoading(true);
    setError('');

    try {
      const result = await resendOtp(pendingEmail);
      
      if (result.success) {
        setTimer(10 * 60); // Reset timer to 10 minutes
        setCanResend(false);
        setVerificationAttempts(0); // Reset verification attempts
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0].focus();
        
        // Show success message
        setError(''); // Clear any previous errors
      } else {
        // Handle specific resend errors
        if (result.type === 'no_pending_registration') {
          setSessionExpired(true);
          setError('No pending registration found. Please start registration again.');
        } else if (result.type === 'session_expired') {
          setSessionExpired(true);
          setError('Registration session expired. Please register again.');
        } else {
          setError(result.error || 'Failed to resend OTP. Please try again.');
        }
      }
    } catch (error) {
      // Handle specific error messages
      if (error.message?.includes('Maximum verification attempts exceeded')) {
        setError('Too many failed attempts. Please request a new OTP.');
        setCanResend(true);
        setTimer(0);
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToRegister = () => {
    // Clear all registration data
    localStorage.removeItem('pendingRegistrationEmail');
    localStorage.removeItem('registrationTimestamp');
    localStorage.removeItem('pendingSearchContext');
    localStorage.removeItem('pendingPreviewContext');
    navigate('/register');
  };

  // Show session expired message
  if (sessionExpired) {
    return (
      <>
        <WelcomeHeader />
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Session Expired</h1>
              <p className="text-gray-600 mb-6">
                Your registration session has expired. Please start the registration process again.
              </p>
              <button
                onClick={handleBackToRegister}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all duration-200"
              >
                Start Registration Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <WelcomeHeader />
      
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-sky-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
            <p className="text-gray-600">
              We've sent a 6-digit code to <br />
              <span className="font-semibold text-sky-600">{pendingEmail}</span>
            </p>
          </div>

          {/* OTP Input */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
            <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
              <div className="flex justify-between mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => inputRefs.current[index] = el}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 md:w-14 md:h-14 text-center text-xl md:text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none transition-colors"
                    style={{ fontFamily: 'monospace' }}
                    disabled={loading}
                  />
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Verification Attempts Warning */}
              {verificationAttempts >= 3 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <p className="text-yellow-700 text-sm">
                      {verificationAttempts}/5 attempts used. Too many failed attempts will require a new OTP.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6 || verificationAttempts >= 5}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mb-4"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Verifying...
                  </div>
                ) : (
                  'Verify Email'
                )}
              </button>
            </form>

            {/* Timer and Resend */}
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-gray-500 text-sm">
                  Resend code in <span className="font-mono font-semibold">{formatTime(timer)}</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-sky-600 hover:text-sky-700 font-medium text-sm disabled:opacity-50 flex items-center justify-center mx-auto"
                >
                  {resendLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Resend verification code'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Back to Register */}
          <div className="text-center">
            <button
              onClick={handleBackToRegister}
              className="flex items-center justify-center mx-auto text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to registration
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OTPVerification;
