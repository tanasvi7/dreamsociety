import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const isMobileDevice = width < MOBILE_BREAKPOINT;
      console.log('useIsMobile - window.innerWidth:', width, 'isMobile:', isMobileDevice);
      setIsMobile(isMobileDevice);
      
      // Store in localStorage for persistence across navigation
      localStorage.setItem('isMobile', isMobileDevice.toString());
    };

    // Check immediately
    checkMobile();

    // Add event listener for resize
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      checkMobile();
    };
    
    mql.addEventListener("change", onChange);
    
    // Also listen for window resize as backup
    window.addEventListener('resize', checkMobile);
    
    // Listen for route changes to re-check mobile state
    const handleRouteChange = () => {
      setTimeout(checkMobile, 100); // Small delay to ensure DOM is updated
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    // Listen for pushstate events (React Router navigation)
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(checkMobile, 100);
    };
    
    return () => {
      mql.removeEventListener("change", onChange);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('popstate', handleRouteChange);
      history.pushState = originalPushState;
    }
  }, [])

  // Also check on mount and after a short delay to handle navigation
  React.useEffect(() => {
    const checkOnMount = () => {
      const width = window.innerWidth;
      const isMobileDevice = width < MOBILE_BREAKPOINT;
      setIsMobile(isMobileDevice);
    };
    
    checkOnMount();
    
    // Check again after a short delay to handle any navigation issues
    const timeoutId = setTimeout(checkOnMount, 200);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Force re-check on every render to ensure accuracy
  React.useEffect(() => {
    const width = window.innerWidth;
    const isMobileDevice = width < MOBILE_BREAKPOINT;
    if (isMobile !== isMobileDevice) {
      console.log('useIsMobile - State mismatch detected, correcting:', isMobileDevice);
      setIsMobile(isMobileDevice);
    }
  });

  return !!isMobile
}
