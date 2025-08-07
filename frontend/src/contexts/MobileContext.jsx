import React, { createContext, useContext, useState, useEffect } from 'react';

const MobileContext = createContext();

export const useMobile = () => {
  const context = useContext(MobileContext);
  if (!context) {
    throw new Error('useMobile must be used within a MobileProvider');
  }
  return context;
};

export const MobileProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      console.log('MobileContext - window.innerWidth:', width, 'isMobile:', mobile);
      setIsMobile(mobile);
    };

    // Check immediately
    checkMobile();

    // Add event listeners
    const handleResize = () => {
      checkMobile();
    };

    const handleRouteChange = () => {
      setTimeout(checkMobile, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('popstate', handleRouteChange);

    // Override pushState to detect navigation
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(checkMobile, 100);
    };

    // Check periodically to ensure accuracy
    const intervalId = setInterval(checkMobile, 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('popstate', handleRouteChange);
      history.pushState = originalPushState;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <MobileContext.Provider value={{ isMobile, setIsMobile }}>
      {children}
    </MobileContext.Provider>
  );
}; 