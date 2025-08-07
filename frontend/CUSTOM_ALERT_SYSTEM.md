# Custom Alert System

This project now uses a professional custom alert modal system that replaces all browser `alert()` and `confirm()` functions with a modern, styled interface.

## Features

- **Professional Design**: Modern modal with backdrop blur and smooth animations
- **Type-based Styling**: Different colors and icons for success, error, warning, and info alerts
- **Keyboard Support**: ESC key to close modals
- **Customizable**: Configurable titles, messages, and button text
- **Consistent UI**: Matches the application's design system
- **Accessibility**: Proper focus management and screen reader support

## Components

### CustomAlert Component
Located at: `src/components/common/CustomAlert.jsx`

A reusable modal component that displays alerts and confirmations.

**Props:**
- `isOpen` (boolean): Controls modal visibility
- `onClose` (function): Called when modal is closed
- `title` (string): Modal title
- `message` (string): Modal message content
- `type` (string): Alert type - 'success', 'error', 'warning', 'info'
- `showCancel` (boolean): Whether to show cancel button
- `onConfirm` (function): Called when confirm button is clicked
- `confirmText` (string): Text for confirm button
- `cancelText` (string): Text for cancel button

### useCustomAlert Hook
Located at: `src/hooks/useCustomAlert.js`

A custom hook that provides easy-to-use functions for showing alerts.

**Returns:**
- `alertState`: Current alert state object
- `showAlert(message, title, type)`: Show a basic alert
- `showSuccess(message, title)`: Show success alert
- `showError(message, title)`: Show error alert
- `showWarning(message, title)`: Show warning alert
- `showConfirm(message, onConfirm, title, confirmText, cancelText)`: Show confirmation dialog
- `closeAlert()`: Close the current alert

## Usage Examples

### Basic Alert
```jsx
import useCustomAlert from '../hooks/useCustomAlert';

const MyComponent = () => {
  const { showAlert } = useCustomAlert();
  
  const handleClick = () => {
    showAlert('This is an informational message.', 'Information');
  };
  
  return <button onClick={handleClick}>Show Alert</button>;
};
```

### Success Alert
```jsx
const { showSuccess } = useCustomAlert();

const handleSave = async () => {
  try {
    await saveData();
    showSuccess('Data saved successfully!');
  } catch (error) {
    showError('Failed to save data.');
  }
};
```

### Confirmation Dialog
```jsx
const { showConfirm } = useCustomAlert();

const handleDelete = () => {
  showConfirm(
    'Are you sure you want to delete this item?',
    () => {
      // User confirmed - perform delete action
      deleteItem();
    },
    'Confirm Delete',
    'Delete',
    'Cancel'
  );
};
```

### Complete Component Example
```jsx
import React from 'react';
import CustomAlert from '../common/CustomAlert';
import useCustomAlert from '../hooks/useCustomAlert';

const MyComponent = () => {
  const { alertState, showSuccess, showError, closeAlert } = useCustomAlert();

  const handleAction = async () => {
    try {
      await performAction();
      showSuccess('Action completed successfully!');
    } catch (error) {
      showError('Action failed. Please try again.');
    }
  };

  return (
    <div>
      <button onClick={handleAction}>Perform Action</button>
      
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
```

## Migration from Browser Alerts

### Before (Browser Alert)
```jsx
// Old way
alert('Operation completed successfully!');
if (window.confirm('Are you sure?')) {
  // Do something
}
```

### After (Custom Alert)
```jsx
// New way
showSuccess('Operation completed successfully!');
showConfirm('Are you sure?', () => {
  // Do something
});
```

## Files Updated

The following files have been updated to use the custom alert system:

1. **ProfileManagement.jsx** - Profile save/update alerts
2. **PersonalInfo.jsx** - Personal info save/delete confirmations
3. **FamilyDetails.jsx** - Family info validation and delete confirmations
4. **ProfessionalInfo.jsx** - Work/education delete confirmations
5. **PostJob.jsx** - Job posting success/error alerts
6. **AdminJobManagement.jsx** - Job delete confirmations

## Demo Component

A demo component is available at `src/components/common/AlertDemo.jsx` that showcases all alert types and features.

## Benefits

1. **Better UX**: Professional appearance instead of browser popups
2. **Consistency**: All alerts follow the same design pattern
3. **Customization**: Easy to modify styling and behavior
4. **Accessibility**: Better keyboard navigation and screen reader support
5. **Mobile Friendly**: Responsive design that works on all devices
6. **Brand Consistency**: Matches the application's visual identity 