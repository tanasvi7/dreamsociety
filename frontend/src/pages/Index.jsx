
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import WelcomeScreen from '../components/welcome/WelcomeScreen';

const Index = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <WelcomeScreen />
      </div>
    </AuthProvider>
  );
};

export default Index;
