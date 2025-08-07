import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Users, FileText, AlertTriangle, Mail, Linkedin, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WelcomeHeader from './WelcomeHeader';

const Policy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white">
      {/* Header */}
      <WelcomeHeader />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          {/* Introduction */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-sky-600 mr-3" />
              <h2 className="text-2xl font-bold text-sky-800">1. Introduction</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              DREAMS (Dalit Resource for Education and Economic Advancement and Mobilisation) is a registered non-profit society located at D No. 3-14, Venkatapuram, Penugonda, West Godavari District, Andhra Pradesh, PIN 534320. This Privacy Policy outlines how we collect, use, disclose, and protect your personal data when you visit our website or interact with our Unity  platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We are committed to complying with applicable data protection laws, including the General Data Protection Regulation (GDPR) and the Information Technology Act, 2000 (India).
            </p>
          </div>

          {/* What Personal Data We Collect */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-sky-600 mr-3" />
              <h2 className="text-2xl font-bold text-sky-800">2. What Personal Data We Collect</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may collect the following types of personal data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Identification Data:</strong> Name, email address, contact number</li>
              <li><strong>Demographic Data:</strong> Caste, profession, gender, and location</li>
              <li><strong>Transaction Data:</strong> Subscription or donation details, payment confirmations</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device ID, and usage information</li>
              <li><strong>Communication Data:</strong> Any messages, feedback, or queries submitted through forms or emails</li>
            </ul>
          </div>

          {/* How We Use Your Personal Data */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-sky-600 mr-3" />
              <h2 className="text-2xl font-bold text-sky-800">3. How We Use Your Personal Data</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use your personal data for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>To process subscriptions and voluntary contributions</li>
              <li>To maintain internal records and donor databases</li>
              <li>To send confirmations, receipts, and acknowledgments</li>
              <li>To improve our website and platform functionality</li>
              <li>To comply with legal obligations (including taxation, recordkeeping, and audit compliance)</li>
              <li>To display select personal data (such as name, address, caste, and profession) to other Unity  subscribers as part of transparency and community networking features enabled on the platform</li>
            </ul>
          </div>

          {/* Legal Basis for Processing */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-sky-600 mr-3" />
              <h2 className="text-2xl font-bold text-sky-800">4. Legal Basis for Processing (GDPR)</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you are located in the European Economic Area (EEA), our legal basis for processing your data is:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Your consent (e.g., when you submit a form)</li>
              <li>Performance of a contract (e.g., processing a subscription)</li>
              <li>Legal obligation (e.g., maintaining transaction records)</li>
              <li>Legitimate interest (e.g., maintaining platform transparency and enabling subscriber visibility)</li>
            </ul>
          </div>

          {/* Disclosure of Personal Data */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-sky-800 mb-4">5. Disclosure of Personal Data</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information. However, we may share it under these circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>With trusted third-party service providers (e.g., payment gateways) under confidentiality</li>
              <li>To comply with legal or regulatory obligations</li>
              <li>With auditors or compliance professionals</li>
              <li>With other Unity  subscribers, limited to name, address, caste, profession, and other basic details, to the extent such disclosure is part of platform features designed for mutual visibility, collaboration, or social engagement</li>
            </ul>
          </div>

          {/* Data Retention */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-sky-800 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal data only as long as necessary to fulfill the purposes outlined in this policy or as required by law.
            </p>
          </div>

          {/* Your Rights */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-sky-800 mb-4">7. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you are located in India or the EEA, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Access your personal data</li>
              <li>Request correction of incorrect or incomplete data</li>
              <li>Request deletion of your data under certain conditions</li>
              <li>Withdraw consent at any time (where applicable)</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              To exercise any of these rights, contact: <a href="mailto:contact@dreamssociety.in" className="text-sky-600 hover:text-sky-800 underline">contact@dreamssociety.in</a>
            </p>
          </div>

          {/* Data Security */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-sky-600 mr-3" />
              <h2 className="text-2xl font-bold text-sky-800">8. Data Security</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your data, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>SSL encryption</li>
              <li>Access control for stored records</li>
              <li>Regular security updates</li>
            </ul>
          </div>

          {/* Cookies and Tracking */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-sky-800 mb-4">9. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed">
              Our website may use cookies to improve functionality and analyze usage. Users can control cookie settings via their browsers.
            </p>
          </div>

          {/* Children's Privacy */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-sky-800 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              We do not knowingly collect or process data of individuals under 18 years of age. Parents or guardians may contact us to request removal of such data.
            </p>
          </div>

          {/* Changes to This Policy */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-sky-800 mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy at any time. Changes will be posted with an updated "Last Updated" date.
            </p>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-sky-600 mr-3" />
              <h2 className="text-2xl font-bold text-sky-800">Contact Us</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:{' '}
              <a href="mailto:contact@dreamssociety.in" className="text-sky-600 hover:text-sky-800 font-medium">
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

export default Policy; 