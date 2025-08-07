import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const Captcha = ({ onValidationChange }) => {
  const [captcha, setCaptcha] = useState({ code: '', answer: '' });
  const [userAnswer, setUserAnswer] = useState('');
  const [isValid, setIsValid] = useState(false);

  const generateCaptcha = () => {
    // Generate a random 6-character alphanumeric code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    setCaptcha({ code, answer: code });
    setUserAnswer('');
    setIsValid(false);
    onValidationChange(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleAnswerChange = (e) => {
    const value = e.target.value.toUpperCase();
    setUserAnswer(value);
    
    const valid = value.trim() !== '' && value === captcha.answer;
    setIsValid(valid);
    onValidationChange(valid);
  };

  const handleRefresh = () => {
    generateCaptcha();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Security Verification
      </label>
             <div className="flex items-center space-x-3">
         <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 font-mono text-lg text-center tracking-wider">
           {captcha.code}
         </div>
         <button
           type="button"
           onClick={handleRefresh}
           className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
           title="Refresh captcha"
         >
           <RefreshCw className="w-5 h-5" />
         </button>
       </div>
       <input
         type="text"
         value={userAnswer}
         onChange={handleAnswerChange}
         maxLength={6}
         className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors uppercase tracking-wider ${
           userAnswer.trim() !== '' 
             ? (isValid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
             : 'border-gray-300'
         }`}
         placeholder="Enter the code above"
       />
      {userAnswer.trim() !== '' && !isValid && (
        <p className="text-sm text-red-600">Incorrect answer. Please try again.</p>
      )}
      {isValid && (
        <p className="text-sm text-green-600">✓ Verification successful</p>
      )}
    </div>
  );
};

export default Captcha; 