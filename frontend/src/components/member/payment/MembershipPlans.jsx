
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

const MembershipPlans = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPlanForQR, setSelectedPlanForQR] = useState(null);
  const [showTerms, setShowTerms] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      icon: Star,
      color: 'gray',
      description: 'Perfect for getting started',
      features: [
        'Basic profile creation',
        'Apply to 5 jobs per month',
        'Basic job search filters',
        'Community access',
        'Email support'
      ],
      limitations: [
        'Limited profile visibility',
        'No premium job alerts',
        'Basic analytics only'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: { monthly: 499, yearly: 4990 },
      icon: Crown,
      color: 'blue',
      description: 'Most popular choice for professionals',
      features: [
        'Enhanced profile visibility',
        'Unlimited job applications',
        'Advanced search filters',
        'Priority customer support',
        'Job application tracking',
        'Profile analytics',
        'Direct employer messaging',
        'Resume builder',
        'Interview preparation resources'
      ],
      limitations: [],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 999, yearly: 9990 },
      icon: Zap,
      color: 'purple',
      description: 'For teams and organizations',
      features: [
        'Everything in Premium',
        'Team collaboration tools',
        'Advanced analytics dashboard',
        'Custom branding options',
        'Dedicated account manager',
        'API access',
        'Bulk user management',
        'Custom integrations',
        'Priority job placement',
        'White-label solutions'
      ],
      limitations: [],
      popular: false
    }
  ];

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    setSelectedPlanForQR(planId);
    setShowQRModal(true);
    // Navigate to payment flow
    // navigate('/payment', { state: { plan: planId, billing: billingCycle } });
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 mb-8">
            Unlock your career potential with Dream Society
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 bg-white rounded-lg p-2 shadow-lg inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors relative ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const savings = calculateSavings(plan.price.monthly, plan.price.yearly);
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
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
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(plan.price[billingCycle])}
                        </span>
                        {plan.price[billingCycle] > 0 && (
                          <span className="text-gray-600 ml-2">
                            /{billingCycle === 'monthly' ? 'month' : 'year'}
                          </span>
                        )}
                      </div>
                      {billingCycle === 'yearly' && savings > 0 && (
                        <p className="text-green-600 text-sm mt-2">
                          Save {savings}% with yearly billing
                        </p>
                      )}
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
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                      plan.id === 'free'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {plan.id === 'free' ? 'Get Started' : 'Choose Plan'}
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

        {/* Features Comparison */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Free</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Premium</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Profile Creation', free: true, premium: true, enterprise: true },
                  { feature: 'Job Applications', free: '5/month', premium: 'Unlimited', enterprise: 'Unlimited' },
                  { feature: 'Advanced Search', free: false, premium: true, enterprise: true },
                  { feature: 'Profile Analytics', free: false, premium: true, enterprise: true },
                  { feature: 'Priority Support', free: false, premium: true, enterprise: true },
                  { feature: 'API Access', free: false, premium: false, enterprise: true },
                  { feature: 'Team Management', free: false, premium: false, enterprise: true },
                  { feature: 'Custom Branding', free: false, premium: false, enterprise: true },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-6 font-medium text-gray-900">{row.feature}</td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-400 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-700">{row.free}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-400 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-700">{row.premium}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-400 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-700">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>



        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change my plan later?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">We offer a free plan with basic features. You can also try Premium features for 7 days with any paid plan.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, debit cards, UPI, and net banking for Indian users.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-300 scale-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">
                      {selectedPlanForQR === 'free' ? 'Free Plan' : 
                       selectedPlanForQR === 'premium' ? 'Premium Plan' : 'Enterprise Plan'}
                    </h3>
                    <p className="text-blue-100 text-sm">Payment QR Code</p>
                  </div>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="text-white hover:text-blue-100 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Plan Details */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-semibold text-gray-900 ml-2 capitalize">
                        {selectedPlanForQR === 'free' ? 'Free' : 
                         selectedPlanForQR === 'premium' ? 'Premium' : 'Enterprise'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Billing:</span>
                      <span className="font-semibold text-gray-900 ml-2 capitalize">{billingCycle}</span>
                    </div>
                  </div>
                  {selectedPlanForQR !== 'free' && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <span className="text-gray-600 text-sm">Amount:</span>
                      <span className="font-bold text-gray-900 ml-2">
                        ₹{plans.find(p => p.id === selectedPlanForQR)?.price[billingCycle].toLocaleString()}
                        <span className="text-sm font-normal text-gray-600 ml-1">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* QR Code Section */}
                <div className="text-center mb-4">
                  <div className="inline-block p-3 bg-white border border-gray-200 rounded-xl shadow-md">
                    <img 
                      src="/qr.jpg" 
                      alt="Payment QR Code" 
                      className="w-40 h-40 rounded-lg"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">i</span>
                    </div>
                    <p className="text-blue-800 text-xs">
                      Scan with UPI app (Google Pay, PhonePe, Paytm) to pay securely.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadQR}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                  
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold text-sm"
                  >
                    Close
                  </button>
                </div>

                {/* Security Note */}
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500">
                    🔒 Bank-level security
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
