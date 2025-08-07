/**
 * Utility functions for handling redirect context after login/registration
 */

export const REDIRECT_CONTEXT_KEYS = {
  SEARCH: 'searchRedirectContext',
  PREVIEW: 'previewRedirectContext',
  PENDING_SEARCH: 'pendingSearchContext',
  PENDING_PREVIEW: 'pendingPreviewContext'
};

/**
 * Store search context for redirect after login
 */
export const storeSearchContext = (searchTerm, selectedResult) => {
  const context = {
    searchTerm,
    selectedResult,
    timestamp: Date.now()
  };
  localStorage.setItem(REDIRECT_CONTEXT_KEYS.SEARCH, JSON.stringify(context));
};

/**
 * Store preview context for redirect after login
 */
export const storePreviewContext = (section) => {
  const context = {
    section,
    timestamp: Date.now()
  };
  localStorage.setItem(REDIRECT_CONTEXT_KEYS.PREVIEW, JSON.stringify(context));
};

/**
 * Get and validate redirect context
 */
export const getRedirectContext = () => {
  const searchContext = localStorage.getItem(REDIRECT_CONTEXT_KEYS.SEARCH);
  const previewContext = localStorage.getItem(REDIRECT_CONTEXT_KEYS.PREVIEW);
  
  if (searchContext) {
    try {
      const context = JSON.parse(searchContext);
      const contextAge = Date.now() - context.timestamp;
      
      // Only use context if it's less than 5 minutes old
      if (contextAge < 5 * 60 * 1000) {
        return { type: 'search', context };
      } else {
        localStorage.removeItem(REDIRECT_CONTEXT_KEYS.SEARCH);
      }
    } catch (error) {
      console.error('Error parsing search context:', error);
      localStorage.removeItem(REDIRECT_CONTEXT_KEYS.SEARCH);
    }
  }
  
  if (previewContext) {
    try {
      const context = JSON.parse(previewContext);
      const contextAge = Date.now() - context.timestamp;
      
      // Only use context if it's less than 5 minutes old
      if (contextAge < 5 * 60 * 1000) {
        return { type: 'preview', context };
      } else {
        localStorage.removeItem(REDIRECT_CONTEXT_KEYS.PREVIEW);
      }
    } catch (error) {
      console.error('Error parsing preview context:', error);
      localStorage.removeItem(REDIRECT_CONTEXT_KEYS.PREVIEW);
    }
  }
  
  return null;
};

/**
 * Get pending redirect context (after login/registration)
 */
export const getPendingRedirectContext = () => {
  const pendingSearchContext = localStorage.getItem(REDIRECT_CONTEXT_KEYS.PENDING_SEARCH);
  const pendingPreviewContext = localStorage.getItem(REDIRECT_CONTEXT_KEYS.PENDING_PREVIEW);
  
  if (pendingSearchContext) {
    try {
      const context = JSON.parse(pendingSearchContext);
      return { type: 'search', context };
    } catch (error) {
      console.error('Error parsing pending search context:', error);
      localStorage.removeItem(REDIRECT_CONTEXT_KEYS.PENDING_SEARCH);
    }
  }
  
  if (pendingPreviewContext) {
    try {
      const context = JSON.parse(pendingPreviewContext);
      return { type: 'preview', context };
    } catch (error) {
      console.error('Error parsing pending preview context:', error);
      localStorage.removeItem(REDIRECT_CONTEXT_KEYS.PENDING_PREVIEW);
    }
  }
  
  return null;
};

/**
 * Clear all redirect contexts
 */
export const clearRedirectContexts = () => {
  Object.values(REDIRECT_CONTEXT_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

/**
 * Get the appropriate navigation path based on context
 */
export const getNavigationPath = (context) => {
  if (!context) return '/dashboard';
  
  if (context.type === 'search' && context.context.selectedResult) {
    switch (context.context.selectedResult.type) {
      case 'job':
        return `/jobs/${context.context.selectedResult.id}`;
      case 'member':
        return `/network/${context.context.selectedResult.id}`;
      case 'company':
        return `/company/${context.context.selectedResult.id}`;
      case 'resource':
        return `/resources/${context.context.selectedResult.id}`;
      default:
        return '/dashboard';
    }
  } else if (context.type === 'preview') {
    switch (context.context.section) {
      case 'jobs':
        return '/jobs';
      case 'network':
        return '/network';
      default:
        return '/dashboard';
    }
  }
  
  return '/dashboard';
};

/**
 * Get user-friendly message for redirect
 */
export const getRedirectMessage = (context) => {
  if (!context) return null;
  
  if (context.type === 'search' && context.context.selectedResult) {
    const result = context.context.selectedResult;
    return `Welcome back! Taking you to ${result.name || result.title}...`;
  } else if (context.type === 'preview') {
    const section = context.context.section;
    return `Welcome! Taking you to ${section === 'jobs' ? 'job opportunities' : 'professional network'}...`;
  }
  
  return 'Welcome back!';
}; 