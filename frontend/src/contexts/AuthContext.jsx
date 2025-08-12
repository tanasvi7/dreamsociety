
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/apiService';
import profilePhotoService from '../services/profilePhotoService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Enhanced error handling utility
const handleApiError = (error, operation = 'operation') => {
  console.error(`${operation} error:`, error);
  
  let errorMessage = `${operation} failed. Please try again.`;
  let errorType = 'general';
  
  if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
    errorMessage = 'No internet connection. Please check your network and try again.';
    errorType = 'network';
  } else if (error.code === 'ECONNABORTED') {
    errorMessage = 'Request timed out. Please try again.';
    errorType = 'timeout';
  } else if (error.response) {
    const status = error.response.status;
    const errorData = error.response.data;
    
    switch (status) {
      case 400:
        errorMessage = errorData?.error || errorData?.message || 'Invalid request. Please check your input.';
        errorType = 'validation';
        break;
      case 401:
        errorMessage = 'Authentication failed. Please try again.';
        errorType = 'authentication';
        break;
      case 403:
        errorMessage = 'Access denied. Your account may be suspended.';
        errorType = 'access_denied';
        break;
      case 404:
        errorMessage = 'Service not found. Please try again later.';
        errorType = 'service_not_found';
        break;
      case 429:
        errorMessage = 'Too many requests. Please wait before trying again.';
        errorType = 'rate_limit';
        break;
      case 500:
        errorMessage = 'Server error. Please try again later.';
        errorType = 'server_error';
        break;
      case 502:
      case 503:
      case 504:
        errorMessage = 'Service temporarily unavailable. Please try again later.';
        errorType = 'service_unavailable';
        break;
      default:
        errorMessage = errorData?.error || errorData?.message || 'An unexpected error occurred.';
        errorType = 'unknown';
    }
  } else if (error.request) {
    errorMessage = 'No response from server. Please check your connection.';
    errorType = 'no_response';
  } else {
    errorMessage = error.message || 'An unexpected error occurred.';
    errorType = 'unknown';
  }
  
  return { 
    success: false, 
    error: errorMessage,
    type: errorType
  };
};

// Retry utility function
const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState({
    url: null,
    loading: false,
    error: null,
    lastLoaded: null
  });

  // Load profile photo
  const loadProfilePhoto = useCallback(async (forceRefresh = false) => {
    if (!user) return;

    // Check if we should skip loading (not forced and recently loaded)
    if (!forceRefresh && profilePhoto.lastLoaded) {
      const timeSinceLastLoad = Date.now() - profilePhoto.lastLoaded;
      if (timeSinceLastLoad < 5 * 60 * 1000) { // 5 minutes
        return;
      }
    }

    try {
      setProfilePhoto(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await profilePhotoService.getProfilePhoto();
      
      if (response.success) {
        setProfilePhoto({
          url: response.data.photoUrl || null,
          loading: false,
          error: null,
          lastLoaded: Date.now()
        });
      } else {
        setProfilePhoto({
          url: null,
          loading: false,
          error: response.message || 'Failed to load profile photo',
          lastLoaded: null
        });
      }
    } catch (error) {
      console.error('Error loading profile photo:', error);
      setProfilePhoto({
        url: null,
        loading: false,
        error: error.message || 'Failed to load profile photo',
        lastLoaded: null
      });
    }
  }, [user]);

  // Update profile photo URL
  const updateProfilePhoto = useCallback((newUrl) => {
    setProfilePhoto({
      url: newUrl,
      loading: false,
      error: null,
      lastLoaded: Date.now()
    });
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('AuthContext: Checking token:', token ? 'Token exists' : 'No token found');
        if (token) {
          console.log('AuthContext: Making /auth/me request with token');
          const response = await api.get('/auth/me');
          console.log('AuthContext: /auth/me response:', response.data);
          setUser(response.data.user);
          
          // Also fetch subscription status if user exists
          if (response.data.user) {
            try {
              const subscriptionResponse = await api.get('/users/subscription/status');
              setUser(prevUser => ({
                ...prevUser,
                is_subscribed: subscriptionResponse.data.is_subscribed
              }));
            } catch (error) {
              console.error('Error fetching subscription status:', error);
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Monitor user state changes
  useEffect(() => {
    console.log('AuthContext: User state changed:', user ? { id: user.id, role: user.role } : null);
  }, [user]);

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Attempting login with credentials:', credentials);
      
      const response = await retryOperation(async () => {
        return await api.post('/auth/login', credentials, {
          timeout: 15000 // 15 seconds timeout
        });
      });
      
      console.log('AuthContext: Login response:', response.data);
      const { token, user: userData } = response.data;
      
      console.log('AuthContext: Storing token in localStorage');
      localStorage.setItem('token', token);
      console.log('AuthContext: Token stored, setting user:', userData);
      setUser(userData);
      console.log('AuthContext: User state updated, should trigger re-render');
      
      // Fetch subscription status after login
      try {
        const subscriptionResponse = await api.get('/users/subscription/status');
        setUser(prevUser => ({
          ...prevUser,
          is_subscribed: subscriptionResponse.data.is_subscribed
        }));
      } catch (error) {
        console.error('Error fetching subscription status after login:', error);
      }
      
      // Reset profile photo state after login
      setProfilePhoto({ url: null, loading: false, error: null, lastLoaded: null });
      
      return { success: true, user: userData };
    } catch (error) {
      return handleApiError(error, 'Login');
    }
  };

  const register = async (userData) => {
    try {
      console.log('AuthContext: Starting registration process');
      
      const response = await retryOperation(async () => {
        return await api.post('/auth/register', userData, {
          timeout: 20000 // 20 seconds timeout for registration
        });
      });
      
      console.log('AuthContext: Registration response:', response.data);
      
      // Registration is successful but user is not created yet
      // Store email for OTP verification
      localStorage.setItem('pendingRegistrationEmail', userData.email);
      
      // Store registration timestamp for session management
      localStorage.setItem('registrationTimestamp', Date.now().toString());
      
      return { 
        success: true, 
        message: response.data.message,
        email: response.data.email
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Clear pending registration on error
      localStorage.removeItem('pendingRegistrationEmail');
      localStorage.removeItem('registrationTimestamp');
      
      // Handle specific backend error messages
      let errorMessage = 'Registration failed. Please try again.';
      let errorType = 'general';
      
      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        
        // Map backend error messages to user-friendly messages
        if (backendMessage.includes('Email address is already registered')) {
          errorMessage = 'Email address is already registered. Please try a different email address.';
          errorType = 'email_exists';
        } else if (backendMessage.includes('Phone number is already registered')) {
          errorMessage = 'Phone number is already registered. Please try a different phone number.';
          errorType = 'phone_exists';
        } else if (backendMessage.includes('Email and phone number are already registered')) {
          errorMessage = 'Email and phone number are already registered. Please use different credentials.';
          errorType = 'both_exist';
        } else if (backendMessage.includes('Registration already in progress')) {
          errorMessage = 'Registration already in progress for this email. Please check your email for OTP or try again in a few minutes.';
          errorType = 'registration_in_progress';
        } else {
          errorMessage = backendMessage;
        }
      } else {
        // Use generic error handling for network/technical issues
        const genericError = handleApiError(error, 'Registration');
        errorMessage = genericError.error;
        errorType = genericError.type;
      }
      
      return { 
        success: false, 
        error: errorMessage,
        type: errorType
      };
    }
  };

  const verifyOtp = async (otpData) => {
    try {
      console.log('AuthContext: Starting OTP verification');
      
      // Check if registration session is still valid (30 minutes)
      const registrationTimestamp = localStorage.getItem('registrationTimestamp');
      if (registrationTimestamp) {
        const sessionAge = Date.now() - parseInt(registrationTimestamp);
        const maxSessionAge = 30 * 60 * 1000; // 30 minutes
        
        if (sessionAge > maxSessionAge) {
          // Clear expired session
          localStorage.removeItem('pendingRegistrationEmail');
          localStorage.removeItem('registrationTimestamp');
          return {
            success: false,
            error: 'Registration session expired. Please start registration again.',
            type: 'session_expired'
          };
        }
      }
      
      const response = await retryOperation(async () => {
        return await api.post('/auth/verify-otp', otpData, {
          timeout: 15000 // 15 seconds timeout
        });
      });
      
      console.log('AuthContext: OTP verification response:', response.data);
      
      const { token, user: newUser } = response.data;
      
      // Store token and set user
      localStorage.setItem('token', token);
      setUser(newUser);
      
      // Clear pending registration data
      localStorage.removeItem('pendingRegistrationEmail');
      localStorage.removeItem('registrationTimestamp');
      
      return { 
        success: true, 
        user: newUser,
        token: token
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      
      // Handle specific OTP errors
      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        
        if (backendMessage.includes('OTP not found') || backendMessage.includes('expired')) {
          return {
            success: false,
            error: 'OTP has expired. Please request a new one.',
            type: 'otp_expired'
          };
        } else if (backendMessage.includes('Invalid OTP')) {
          return {
            success: false,
            error: 'Invalid OTP. Please check and try again.',
            type: 'invalid_otp'
          };
        } else if (backendMessage.includes('Maximum verification attempts exceeded')) {
          return {
            success: false,
            error: 'Too many failed attempts. Please request a new OTP.',
            type: 'max_attempts_exceeded'
          };
        } else {
          return {
            success: false,
            error: backendMessage,
            type: 'otp_error'
          };
        }
      }
      
      // Handle network and other errors
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.',
          type: 'network_error'
        };
      }
      
      return handleApiError(error, 'OTP verification');
    }
  };

  const resendOtp = async (email) => {
    try {
      console.log('AuthContext: Resending OTP');
      
      const response = await retryOperation(async () => {
        return await api.post('/auth/resend-otp', { email }, {
          timeout: 15000 // 15 seconds timeout
        });
      });
      
      console.log('AuthContext: Resend OTP response:', response.data);
      
      return { 
        success: true, 
        message: response.data.message
      };
    } catch (error) {
      console.error('Resend OTP error:', error);
      
      // Handle specific resend errors
      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        
        if (backendMessage.includes('No pending registration')) {
          return {
            success: false,
            error: 'No pending registration found. Please start registration again.',
            type: 'no_pending_registration'
          };
        } else if (backendMessage.includes('session expired')) {
          return {
            success: false,
            error: 'Registration session expired. Please register again.',
            type: 'session_expired'
          };
        } else if (backendMessage.includes('Maximum verification attempts exceeded')) {
          return {
            success: false,
            error: 'Too many failed attempts. Please request a new OTP.',
            type: 'max_attempts_exceeded'
          };
        } else {
          return {
            success: false,
            error: backendMessage,
            type: 'resend_error'
          };
        }
      }
      
      // Handle network errors
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.',
          type: 'network_error'
        };
      }
      
      return handleApiError(error, 'Resend OTP');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('pendingRegistrationEmail');
    localStorage.removeItem('registrationTimestamp');
    setUser(null);
    setProfilePhoto({ url: null, loading: false, error: null, lastLoaded: null });
  };

  const updateUser = useCallback((userUpdates) => {
    setUser(prevUser => {
      if (!prevUser) return userUpdates;
      return { ...prevUser, ...userUpdates };
    });
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
    profilePhoto,
    loadProfilePhoto,
    updateProfilePhoto,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
