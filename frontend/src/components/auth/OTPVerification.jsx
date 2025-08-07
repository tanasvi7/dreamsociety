
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Loader, Shield, Mail } from 'lucide-react';
import WelcomeHeader from '../welcome/WelcomeHeader';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  // Get pending registration email from localStorage
  const pendingEmail = localStorage.getItem('pendingRegistrationEmail');

  useEffect(() => {
    // Redirect if no pending registration
    if (!pendingEmail) {
      navigate('/register');
      return;
    }
    
    // Set initial timer (10 minutes)
    setTimer(10 * 60); // 10 minutes in seconds
  }, [pendingEmail, navigate]);

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

    setLoading(true);
    setError('');

    try {
      const result = await verifyOtp({ email: pendingEmail, otp: otpValue });
      
      if (result.success) {
        console.log('OTP verification successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0].focus();
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');

    try {
      await resendOtp(pendingEmail);
      setTimer(10 * 60); // Reset timer to 10 minutes
      setCanResend(false);
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
                  />
                ))}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
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
                  disabled={loading}
                  className="text-sky-600 hover:text-sky-700 font-medium text-sm disabled:opacity-50"
                >
                  Resend verification code
                </button>
              )}
            </div>
          </div>

          {/* Back to Register */}
          <div className="text-center">
            <button
              onClick={() => navigate('/register')}
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
