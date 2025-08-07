import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Building, Shield, AlertTriangle, Scale, Mail, Info, Linkedin, Twitter, Facebook } from 'lucide-react';
import WelcomeHeader from './WelcomeHeader';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white">
      {/* Header */}
      <WelcomeHeader />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          {/* Organizational Identity */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Building className="w-6 h-6 text-sky-600 mr-3" />
              <h2 className="text-2xl font-bold text-sky-800">1. Organizational Identity</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              DREAMS (Dalit Resource for Education and Economic Advancement and Mobilisation) is a registered non-profit society with the objective of promoting social and economic empowerment.
            </p>
            <div className="bg-sky-50 rounded-lg p-4 border border-sky-200">
              <p className="text-gray-700 font-medium">
                <strong>Registration No.:</strong> 125/2025
              </p>
              <p className="text-gray-700 font-medium">
                <strong>Official Address:</strong> D No. 3-14, Venkatapuram, Penugonda, West Godavari District, Andhra Pradesh, PIN 534320.
              </p>
            </div>
          </div>

          {/* Platform Role */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Info className="w-6 h-6 text-sky-600 mr-3" />
              <h2 className="text-2xl font-bold text-sky-800">2. Platform Role - Unity </h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Unity  is solely a facilitative platform that supports DREAMS Society's administrative goals. It enables the collection of subscriptions and voluntary contributions from individuals and organizations who wish to support the Society's stated mission.
            </p>
          </div>

          {/* Purpose of Contributions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-sky-800 mb-4">3. Purpose of Contributions</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All funds received via Unity  are deposited into a dedicated bank account and used only for the Society's legitimate purposes, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Office infrastructure and administration</li>
              <li>IT platform development and maintenance</li>
              <li>Data storage and compliance</li>
              <li>Other expenses necessary to fulfill the Society's mission</li>
            </ul>
          </div>

          {/* Clarification on Membership */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-sky-800 mb-4">4. Clarification on Membership</h2>
            <p className="text-gray-700 leading-relaxed">
              Subscriptions and contributions made through Unity  do not constitute payment for membership or confer any governance or voting rights within the DREAMS Society. Membership is governed separately under the Society's bylaws and internal rules.
            </p>
          </div>

          {/* No Refund Policy */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-sky-600 mr-3" />
              <h2 className="text-2xl font-bold text-sky-800">5. No Refund Policy</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              All contributions are final and non-refundable. Donors and subscribers agree that contributions are made voluntarily and with the understanding that DREAMS will use funds at its discretion within the stated objectives.
            </p>
          </div>

          {/* Legal Separation of Activities */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-sky-800 mb-4">6. Legal Separation of Activities</h2>
            <p className="text-gray-700 leading-relaxed">
              Any programs, events, or initiatives not directly related to Unity  or the operational maintenance of the Society will be conducted through separately established legal entities (e.g., Special Purpose Vehicles). These entities will operate independently with distinct accounting and compliance obligations.
            </p>
          </div>

          {/* No Solicitation or Investment Intent */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-sky-800 mb-4">7. No Solicitation or Investment Intent</h2>
            <p className="text-gray-700 leading-relaxed">
              DREAMS Society does not solicit funds for investment or profit-making purposes. No return, dividend, or financial benefit is promised or implied. Contributors acknowledge that their payments are purely for charitable or support purposes.
            </p>
          </div>

          {/* Limitation of Liability */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-sky-600 mr-3" />
              <h2 className="text-2xl font-bold text-sky-800">8. Limitation of Liability</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To the fullest extent permitted by law, DREAMS Society and its affiliated personnel, officers, and volunteers shall not be liable for any indirect, incidental, consequential, or punitive damages arising out of or in connection with the use of funds contributed via Unity .
            </p>
          </div>

          {/* Compliance and Audit */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-sky-800 mb-4">9. Compliance and Audit</h2>
            <p className="text-gray-700 leading-relaxed">
              DREAMS Society adheres to applicable state and central laws governing non-profit organizations. Regular internal audits and financial reviews are conducted to ensure lawful and transparent fund utilization.
            </p>
          </div>

          {/* Dispute Resolution and Jurisdiction */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Scale className="w-6 h-6 text-sky-600 mr-3" />
              <h2 className="text-2xl font-bold text-sky-800">10. Dispute Resolution and Jurisdiction</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Any legal disputes arising in relation to subscriptions or the Unity  platform will be subject to the exclusive jurisdiction of the courts located in West Godavari District, Andhra Pradesh, India.
            </p>
          </div>

          {/* Changes to Terms */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-sky-800 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              DREAMS Society reserves the right to update or amend these terms at any time without prior notice. The most current version will be posted on the Society's website or the Unity  platform.
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 mr-3" />
              <h3 className="text-lg font-semibold text-amber-800">Important Notice</h3>
            </div>
            <p className="text-amber-700 leading-relaxed">
              These terms and conditions constitute a disclaimer on the collection of subscriptions. By using the Unity  platform and making contributions, you acknowledge that you have read, understood, and agree to be bound by these terms.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-sky-50 rounded-lg p-6 border border-sky-200 mt-8">
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-sky-600 mr-3" />
              <h3 className="text-lg font-semibold text-sky-800">Contact Us</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at:{' '}
              <a href="mailto:contact@dreamssociety.in" className="text-sky-600 hover:text-sky-800 underline font-medium">
                contact@dreamssociety.in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer - Premium Style */}
      <footer className="w-full bg-gradient-to-r from-sky-200 via-blue-100 to-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center py-6 md:py-8">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <div className="text-base md:text-lg font-bold text-sky-800">UNITY </div>
              <p className="text-xs md:text-sm text-sky-600">&copy; {new Date().getFullYear()} All Rights Reserved.</p>
            </div>
            
            {/* Navigation Links */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-4 md:mb-0">
              <div className="flex gap-4 md:gap-6">
                <Link to="/policy" className="text-sky-600 hover:text-sky-800 transition-colors text-sm md:text-base font-medium">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-sky-600 hover:text-sky-800 transition-colors text-sm md:text-base font-medium">
                  Terms & Conditions
                </Link>
              </div>
            </div>
            
            <div className="flex gap-4 md:gap-6">
              <a href="#" className="text-sky-500 hover:text-sky-700 transition-colors"><Linkedin className="w-5 h-5 md:w-6 md:h-6" /></a>
              <a href="#" className="text-sky-500 hover:text-sky-700 transition-colors"><Twitter className="w-5 h-5 md:w-6 md:h-6" /></a>
              <a href="#" className="text-sky-500 hover:text-sky-700 transition-colors"><Facebook className="w-5 h-5 md:w-6 md:h-6" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsAndConditions; 