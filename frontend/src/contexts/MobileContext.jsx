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
      setIsMobile(prevMobile => {
        // Only update state if the value actually changed
        if (prevMobile !== mobile) {
          return mobile;
        }
        return prevMobile;
      });
    };

    // Check immediately
    checkMobile();

    // Debounced resize handler to prevent excessive calls
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 150);
    };

    // Debounced route change handler
    let routeTimeout;
    const handleRouteChange = () => {
      clearTimeout(routeTimeout);
      routeTimeout = setTimeout(checkMobile, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('popstate', handleRouteChange);

    // Override pushState to detect navigation
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      handleRouteChange();
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('popstate', handleRouteChange);
      history.pushState = originalPushState;
      clearTimeout(resizeTimeout);
      clearTimeout(routeTimeout);
    };
  }, []);

  return (
    <MobileContext.Provider value={{ isMobile, setIsMobile }}>
      {children}
    </MobileContext.Provider>
  );
}; 