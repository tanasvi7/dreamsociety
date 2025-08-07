
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Shield, 
  Check,
  Loader,
  AlertCircle
} from 'lucide-react';

const PaymentFlow = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    upiId: '',
    bankAccount: '',
    ifscCode: ''
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Mock plan data - would come from route params or context
  const selectedPlan = {
    name: 'Premium',
    price: 499,
    billing: 'monthly',
    features: [
      'Enhanced profile visibility',
      'Unlimited job applications',
      'Advanced search filters',
      'Priority customer support'
    ]
  };

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, RuPay'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: Smartphone,
      description: 'Google Pay, PhonePe, Paytm'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: Building2,
      description: 'All major banks supported'
    }
  ];

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (paymentMethod === 'card') {
      if (!paymentData.cardNumber || paymentData.cardNumber.length < 16) {
        newErrors.cardNumber = 'Please enter a valid card number';
      }
      if (!paymentData.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required';
      }
      if (!paymentData.cvv || paymentData.cvv.length < 3) {
        newErrors.cvv = 'Please enter a valid CVV';
      }
      if (!paymentData.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      }
    } else if (paymentMethod === 'upi') {
      if (!paymentData.upiId || !paymentData.upiId.includes('@')) {
        newErrors.upiId = 'Please enter a valid UPI ID';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      // Navigate to success page
      navigate('/dashboard', { state: { paymentSuccess: true } });
    }, 3000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/membership"
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Plans
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Payment</h1>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 border-2 rounded-lg transition-colors ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <method.icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-medium text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handlePayment}>
                {paymentMethod === 'card' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={paymentData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      {errors.cardNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={paymentData.expiryDate}
                          onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                        {errors.expiryDate && (
                          <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={paymentData.cvv}
                          onChange={(e) => handleInputChange('cvv', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.cvv ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="123"
                          maxLength={4}
                        />
                        {errors.cvv && (
                          <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={paymentData.cardholderName}
                        onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.cardholderName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="John Doe"
                      />
                      {errors.cardholderName && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
                      )}
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={paymentData.upiId}
                      onChange={(e) => handleInputChange('upiId', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.upiId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="yourname@paytm"
                    />
                    {errors.upiId && (
                      <p className="mt-1 text-sm text-red-600">{errors.upiId}</p>
                    )}
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Your Bank
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Choose your bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="kotak">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {/* Security Notice */}
                <div className="bg-blue-50 rounded-lg p-4 mt-6">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900">Secure Payment</h3>
                      <p className="text-sm text-blue-800 mt-1">
                        Your payment information is encrypted and secure. We use industry-standard SSL encryption.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    `Pay ₹${selectedPlan.price}`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedPlan.name} Plan</h3>
                    <p className="text-sm text-gray-600">
                      Billed {selectedPlan.billing}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900">₹{selectedPlan.price}</span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center font-semibold text-gray-900">
                    <span>Total</span>
                    <span>₹{selectedPlan.price}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">What's included:</h4>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 mt-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-900">Money-back Guarantee</h3>
                      <p className="text-sm text-yellow-800 mt-1">
                        Not satisfied? Get a full refund within 30 days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFlow;
