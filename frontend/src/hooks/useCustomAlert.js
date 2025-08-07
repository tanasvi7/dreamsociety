import { useState, useCallback } from 'react';

const useCustomAlert = () => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    showCancel: false,
    onConfirm: null,
    confirmText: 'OK',
    cancelText: 'Cancel'
  });

  const showAlert = useCallback((message, title = 'Information', type = 'info') => {
    setAlertState({
      isOpen: true,
      title,
      message,
      type,
      showCancel: false,
      onConfirm: null,
      confirmText: 'OK',
      cancelText: 'Cancel'
    });
  }, []);

  const showSuccess = useCallback((message, title = 'Success') => {
    showAlert(message, title, 'success');
  }, [showAlert]);

  const showError = useCallback((message, title = 'Error') => {
    showAlert(message, title, 'error');
  }, [showAlert]);

  const showWarning = useCallback((message, title = 'Warning') => {
    showAlert(message, title, 'warning');
  }, [showAlert]);

  const showConfirm = useCallback((message, onConfirm, title = 'Confirm Action', confirmText = 'Confirm', cancelText = 'Cancel') => {
    setAlertState({
      isOpen: true,
      title,
      message,
      type: 'warning',
      showCancel: true,
      onConfirm,
      confirmText,
      cancelText
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    alertState,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showConfirm,
    closeAlert
  };
};

export default useCustomAlert; 