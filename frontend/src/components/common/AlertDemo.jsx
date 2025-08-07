import React from 'react';
import { Button } from '../ui/button';
import CustomAlert from './CustomAlert';
import useCustomAlert from '../../hooks/useCustomAlert';

const AlertDemo = () => {
  const { alertState, showAlert, showSuccess, showError, showWarning, showConfirm, closeAlert } = useCustomAlert();

  const handleShowInfo = () => {
    showAlert('This is an informational message.', 'Information');
  };

  const handleShowSuccess = () => {
    showSuccess('Operation completed successfully!');
  };

  const handleShowError = () => {
    showError('Something went wrong. Please try again.');
  };

  const handleShowWarning = () => {
    showWarning('Please review your input before proceeding.');
  };

  const handleShowConfirm = () => {
    showConfirm(
      'Are you sure you want to perform this action? This cannot be undone.',
      () => {
        console.log('User confirmed the action');
        showSuccess('Action confirmed and completed!');
      },
      'Confirm Action',
      'Proceed',
      'Cancel'
    );
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Custom Alert System Demo</h2>
      <p className="text-gray-600 mb-8">
        This demonstrates the professional custom alert modal system that replaces browser alerts.
        All alerts are now styled consistently with the application's design.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button onClick={handleShowInfo} variant="outline" className="h-12">
          Show Info Alert
        </Button>
        
        <Button onClick={handleShowSuccess} className="h-12 bg-green-600 hover:bg-green-700">
          Show Success Alert
        </Button>
        
        <Button onClick={handleShowError} className="h-12 bg-red-600 hover:bg-red-700">
          Show Error Alert
        </Button>
        
        <Button onClick={handleShowWarning} className="h-12 bg-yellow-600 hover:bg-yellow-700">
          Show Warning Alert
        </Button>
        
        <Button onClick={handleShowConfirm} className="h-12 bg-blue-600 hover:bg-blue-700 md:col-span-2">
          Show Confirmation Dialog
        </Button>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Features:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Professional styling with icons and color coding</li>
          <li>• Keyboard support (ESC to close)</li>
          <li>• Backdrop blur and click-to-close</li>
          <li>• Customizable titles and button text</li>
          <li>• Consistent with application design</li>
          <li>• Replaces all browser alert() and confirm() calls</li>
        </ul>
      </div>

      {/* Custom Alert Modal */}
      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        showCancel={alertState.showCancel}
        onConfirm={alertState.onConfirm}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
      />
    </div>
  );
};

export default AlertDemo; 