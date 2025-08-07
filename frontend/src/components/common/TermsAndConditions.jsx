import React from 'react';
import { X } from 'lucide-react';

const TermsAndConditions = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
            Terms and Conditions
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="prose prose-lg max-w-none" style={{fontFamily: 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}>
            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Disclaimer on Collection of Subscriptions</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-2">1. Organizational Identity</h4>
                  <p className="text-sm leading-relaxed">
                    DREAMS (Dalit Resource for Education and Economic Advancement and Mobilisation) is a
                    registered non-profit society with the objective of promoting social and economic empowerment.
                    Registration No. 125/2025. Official address:
                    D No. 3-14, Venkatapuram, Penugonda, West Godavari District, Andhra Pradesh, PIN 534320.
                  </p>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-2">2. Platform Role - Unity Nest</h4>
                  <p className="text-sm leading-relaxed">
                    Unity Nest is solely a facilitative platform that supports DREAMS Society's administrative goals. It
                    enables the collection of subscriptions and voluntary contributions from individuals and
                    organizations who wish to support the Society's stated mission.
                  </p>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-2">3. Purpose of Contributions</h4>
                  <p className="text-sm leading-relaxed mb-2">
                    All funds received via Unity Nest are deposited into a dedicated bank account and used only for the
                    Society's legitimate purposes, including:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                    <li>Office infrastructure and administration</li>
                    <li>IT platform development and maintenance</li>
                    <li>Data storage and compliance</li>
                    <li>Other expenses necessary to fulfill the Society's mission</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-2">4. Clarification on Membership</h4>
                  <p className="text-sm leading-relaxed">
                    Subscriptions and contributions made through Unity Nest do not constitute payment for membership
                    or confer any governance or voting rights within the DREAMS Society. Membership is governed
                    separately under the Society's bylaws and internal rules.
                  </p>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-2">5. No Refund Policy</h4>
                  <p className="text-sm leading-relaxed">
                    All contributions are final and non-refundable. Donors and subscribers agree that contributions are
                    made voluntarily and with the understanding that DREAMS will use funds at its discretion within the
                    stated objectives.
                  </p>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-2">6. Legal Separation of Activities</h4>
                  <p className="text-sm leading-relaxed">
                    Any programs, events, or initiatives not directly related to Unity Nest or the operational maintenance
                    of the Society will be conducted through separately established legal entities (e.g., Special Purpose
                    Vehicles). These entities will operate independently with distinct accounting and compliance
                    obligations.
                  </p>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-2">7. No Solicitation or Investment Intent</h4>
                  <p className="text-sm leading-relaxed">
                    DREAMS Society does not solicit funds for investment or profit-making purposes. No return,
                    dividend, or financial benefit is promised or implied. Contributors acknowledge that their payments
                    are purely for charitable or support purposes.
                  </p>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-2">8. Limitation of Liability</h4>
                  <p className="text-sm leading-relaxed">
                    To the fullest extent permitted by law, DREAMS Society and its affiliated personnel, officers, and
                    volunteers shall not be liable for any indirect, incidental, consequential, or punitive damages arising
                    out of or in connection with the use of funds contributed via Unity Nest.
                  </p>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-2">9. Compliance and Audit</h4>
                  <p className="text-sm leading-relaxed">
                    DREAMS Society adheres to applicable state and central laws governing non-profit organizations.
                    Regular internal audits and financial reviews are conducted to ensure lawful and transparent fund
                    utilization.
                  </p>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-2">10. Dispute Resolution and Jurisdiction</h4>
                  <p className="text-sm leading-relaxed">
                    Any legal disputes arising in relation to subscriptions or the Unity Nest platform will be subject to the
                    exclusive jurisdiction of the courts located in West Godavari District, Andhra Pradesh, India.
                  </p>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-2">11. Changes to Terms</h4>
                  <p className="text-sm leading-relaxed">
                    DREAMS Society reserves the right to update or amend these terms at any time without prior notice.
                    The most current version will be posted on the Society's website or the Unity Nest platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            style={{fontFamily: 'Montserrat, Inter, Plus Jakarta Sans, sans-serif'}}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions; 