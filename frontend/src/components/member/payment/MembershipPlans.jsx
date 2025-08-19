
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import Navbar from '../../common/Navbar';
import { 
  Check, 
  X, 
  Crown, 
  Star, 
  Zap, 
  ArrowLeft,
  CreditCard,
  Download
} from 'lucide-react';
import TermsAndConditions from '../../common/TermsAndConditions';
import { subscriptionService } from '../../../services/subscriptionService';

const MembershipPlans = () => {
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPlanForQR, setSelectedPlanForQR] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [transactionNumber, setTransactionNumber] = useState('');
  const [transactionType, setTransactionType] = useState('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  const plans = [
    {
      id: 'annual',
      name: 'Annual Membership',
      price: { monthly: 500, yearly: 500 },
      icon: Crown,
      color: 'blue',
      description: 'Complete access to Dream Society community',
      features: [
        'Full profile creation and management',
        'Unlimited job applications',
        'Job posting capabilities',
        'Advanced search and filtering',
        'Profile analytics and insights',
      ],
      limitations: [],
      popular: true
    }
  ];

  const handleSelectPlan = async (planId) => {
    setSelectedPlan(planId);
    setSelectedPlanForQR(planId);
    setShowQRModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!transactionNumber.trim()) {
      alert('Please enter the transaction number');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create payment record with transaction details
      const paymentData = {
        amount: 500,
        payment_method: 'upi',
        transaction_number: transactionNumber,
        transaction_type: transactionType,
        plan_type: 'annual',
        billing_cycle: 'yearly'
      };

      const result = await subscriptionService.createPayment(paymentData);
      alert('Payment submitted successfully!');
      setShowQRModal(false);
      setTransactionNumber('');
      setTransactionType('upi');
      setPaymentId(null);
      // Optionally refresh user data or redirect
    } catch (error) {
      console.error('Error submitting payment:', error);
      alert(error.response?.data?.message || 'Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowQRModal(false);
    setTransactionNumber('');
    setTransactionType('upi');
    setPaymentId(null);
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = '/qr.jpg';
    link.download = `dream-society-${selectedPlanForQR}-plan-qr.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTermsClick = (e) => {
    e.preventDefault();
    setShowTerms(true);
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString()}`;
  };

  const calculateSavings = (monthly, yearly) => {
    if (monthly === 0) return 0;
    const monthlyCost = monthly * 12;
    const savings = ((monthlyCost - yearly) / monthlyCost) * 100;
    return Math.round(savings);
  };

  return (
    // <div className="min-h-screen bg-gray-50">
    //  <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/dashboard"
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Annual Membership</h1>
          <p className="text-xl text-gray-600 mb-8">
            Join Dream Society with our annual membership plan
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Get complete access to our community network, job opportunities, and professional development resources
          </p>
        </div>

        {/* Plans Grid */}
        <div className="flex justify-center mb-12">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const savings = calculateSavings(plan.price.monthly, plan.price.yearly);
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl max-w-md w-full ${
                  plan.popular 
                    ? 'border-blue-500 transform scale-105' 
                    : selectedPlan === plan.id 
                      ? 'border-blue-400' 
                      : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-${plan.color}-100 flex items-center justify-center`}>
                      <IconComponent className={`w-8 h-8 text-${plan.color}-600`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    
                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold text-gray-900">
                          ₹500
                        </span>
                        <span className="text-gray-600 ml-2 text-xl">
                          /year
                        </span>
                      </div>
                      <p className="text-green-600 text-sm mt-2">
                        Complete access for one full year
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start">
                        <X className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-500">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className="w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg text-lg"
                  >
                    Join Now - ₹500/year
                  </button>
                          {/* Terms and Conditions Section */}
          <div className="text-center">
                         <button
               onClick={handleTermsClick}
               className="inline-flex items-center underline text-blue-600 hover:text-blue-700 mt-5"
             >
               View Terms and Conditions
             </button>
          </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What's Included</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { feature: 'Profile Management', description: 'Complete profile creation and customization' },
              { feature: 'Job Applications', description: 'Unlimited job applications and tracking' },
              { feature: 'Job Posting', description: 'Post and manage job opportunities' },
              { feature: 'Advanced Search', description: 'Powerful search and filtering capabilities' },
              { feature: 'Community Networking', description: 'Connect with professionals and mentors' },
              { feature: 'Direct Messaging', description: 'Private messaging with community members' },
              { feature: 'Skill Development', description: 'Access to learning resources and workshops' },
              { feature: 'Mentorship Program', description: 'Connect with experienced professionals' },
              { feature: 'Community Events', description: 'Participate in workshops and events' },
              { feature: 'Profile Analytics', description: 'Track your profile performance and engagement' },
              { feature: 'Priority Support', description: 'Dedicated customer support assistance' },
              { feature: 'Resource Pool', description: 'Access to exclusive community resources' },
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">{item.feature}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What's included in the annual membership?</h3>
              <p className="text-gray-600">The annual membership includes complete access to all Dream Society features including job posting, networking, skill development resources, and community events for one full year.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I get a refund?</h3>
              <p className="text-gray-600">We offer a 30-day money-back guarantee. If you're not satisfied with your membership, you can request a full refund within 30 days of purchase.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept UPI, credit cards, debit cards, and net banking for Indian users. All payments are processed securely.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How do I access the community features?</h3>
              <p className="text-gray-600">Once your payment is confirmed, you'll receive immediate access to all community features including networking, job posting, and skill development resources.</p>
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-300 scale-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl p-3 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold">
                      Annual Membership Plan
                    </h3>
                    <p className="text-blue-100 text-xs">Payment QR Code</p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-white hover:text-blue-100 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Plan Details */}
                <div className="bg-gray-50 rounded-lg p-2 mb-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-semibold text-gray-900">
                      Annual Membership
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-gray-900">
                      ₹500
                      <span className="text-xs font-normal text-gray-600 ml-1">
                        /year
                      </span>
                    </span>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="text-center mb-3">
                  <div className="inline-block p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <img 
                      src="/qr.jpg" 
                      alt="Payment QR Code" 
                      className="w-32 h-32 rounded-lg"
                    />
                  </div>
                  {/* UPI ID */}
                  <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">UPI ID</p>
                    <p className="text-sm font-mono font-semibold text-gray-900">9030770968@sbi</p>
                  </div>
                </div>

                {/* Transaction Details Form */}
                <div className="space-y-3 mb-3">
                  {/* Transaction Type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Transaction Type
                    </label>
                    <select
                      value={transactionType}
                      onChange={(e) => setTransactionType(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                      <option value="netbanking">Net Banking</option>
                      <option value="wallet">Wallet</option>
                    </select>
                  </div>

                  {/* Transaction Number */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Transaction Number *
                    </label>
                    <input
                      type="text"
                      value={transactionNumber}
                      onChange={(e) => setTransactionNumber(e.target.value)}
                      placeholder="Enter transaction number"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mb-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">i</span>
                    </div>
                    <div className="text-blue-800 text-xs">
                      <p className="mb-1"><strong>Steps:</strong></p>
                      <ol className="list-decimal list-inside space-y-0.5 text-xs">
                        <li>Scan QR with UPI app</li>
                        <li>Complete payment</li>
                        <li>Enter transaction number</li>
                        <li>Click Complete</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadQR}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-all duration-200 font-medium text-xs shadow-sm"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </button>
                  
                  <button
                    onClick={handleSubmitPayment}
                    disabled={isSubmitting || !transactionNumber.trim()}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium text-xs shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Processing...' : 'Complete'}
                  </button>
                  
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-all duration-200 font-medium text-xs"
                  >
                    Close
                  </button>
                </div>

                {/* Security Note */}
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-500">
                    🔒 Secure payment
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Terms and Conditions Modal */}
        <TermsAndConditions 
          isOpen={showTerms} 
          onClose={() => setShowTerms(false)} 
        />
      </div>
    // </div>
  );
};

export default MembershipPlans;
