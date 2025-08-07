
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

  // Don't automatically load profile photo when user changes
  // Profile photo will be loaded explicitly when needed (e.g., on dashboard)

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Attempting login with credentials:', credentials);
      
      // Add timeout to the request
      const response = await api.post('/auth/login', credentials, {
        timeout: 10000 // 10 seconds timeout
      });
      
      console.log('AuthContext: Login response:', response.data);
      const { token, user: userData } = response.data;
      
      console.log('AuthContext: Storing token in localStorage');
      localStorage.setItem('token', token);
      console.log('AuthContext: Token stored, setting user:', userData);
      setUser(userData);
      console.log('AuthContext: User state updated, should trigger re-render');
      
      // Reset profile photo state after login
      setProfilePhoto({ url: null, loading: false, error: null, lastLoaded: null });
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      
      // Enhanced error handling
      let errorMessage = 'Login failed. Please try again.';
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
            errorMessage = errorData?.error || 'Invalid email or password.';
            errorType = 'validation';
            break;
          case 401:
            errorMessage = 'Invalid email or password. Please check your credentials.';
            errorType = 'credentials';
            break;
          case 403:
            errorMessage = 'Access denied. Your account may be suspended.';
            errorType = 'access_denied';
            break;
          case 404:
            errorMessage = 'Login service not found. Please try again later.';
            errorType = 'service_not_found';
            break;
          case 429:
            errorMessage = 'Too many login attempts. Please wait before trying again.';
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
            errorMessage = errorData?.error || 'An unexpected error occurred.';
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
    }
  };

  const register = async (userData) => {
    try {
      console.log('AuthContext: Starting registration process');
      const response = await api.post('/auth/register', userData);
      console.log('AuthContext: Registration response:', response.data);
      
      // Registration is successful but user is not created yet
      // Store email for OTP verification
      localStorage.setItem('pendingRegistrationEmail', userData.email);
      
      return { 
        success: true, 
        message: response.data.message,
        email: response.data.email
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const verifyOtp = async (otpData) => {
    try {
      console.log('AuthContext: Starting OTP verification');
      const response = await api.post('/auth/verify-otp', otpData);
      console.log('AuthContext: OTP verification response:', response.data);
      
      const { token, user: newUser } = response.data;
      
      // Store token and set user
      localStorage.setItem('token', token);
      setUser(newUser);
      
      // Clear pending registration
      localStorage.removeItem('pendingRegistrationEmail');
      
      return { 
        success: true, 
        user: newUser,
        token: token
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'OTP verification failed' 
      };
    }
  };

  const resendOtp = async (email) => {
    try {
      console.log('AuthContext: Resending OTP');
      const response = await api.post('/auth/resend-otp', { email });
      console.log('AuthContext: Resend OTP response:', response.data);
      
      return { 
        success: true, 
        message: response.data.message
      };
    } catch (error) {
      console.error('Resend OTP error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to resend OTP' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
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
