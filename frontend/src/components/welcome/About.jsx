import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Linkedin, Twitter, Facebook } from 'lucide-react';
import Contact from './Contact';
import WelcomeHeader from './WelcomeHeader';

const About = () => {
  return (
    <>
      <WelcomeHeader />
      {/* Purpose and Aspirations Section */}

      {/* Main Content - About Section */}
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 md:py-8" style={{background: 'linear-gradient(135deg, #e0f2fe 0%, #f3fdf7 100%)', minHeight: '70vh', position: 'relative'}}>
          <main className="w-full max-w-5xl mx-auto flex flex-col items-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-sky-800 mb-2 drop-shadow-lg animate-title-pop text-center px-4" style={{letterSpacing: '1.5px'}}>About UNITY </h1>
            <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 mb-4 md:mb-6 animate-divider-fadein w-full max-w-4xl px-4">
              <span className="h-1 w-16 md:w-32 lg:w-56 rounded-full bg-gradient-to-r from-sky-400 via-green-300 to-blue-400 animate-divider-glow"></span>
              <span className="text-sm md:text-base lg:text-lg font-medium text-sky-700 tracking-wide flex-1 text-center px-2">Empowering Through Connection, Opportunity & Growth</span>
              <span className="h-1 w-16 md:w-32 lg:w-56 rounded-full bg-gradient-to-l from-sky-400 via-green-300 to-blue-400 animate-divider-glow"></span>
            </div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 mb-8 md:mb-10 animate-fade-in w-full text-center px-4" style={{maxWidth: '1000px', fontWeight: 500, letterSpacing: '0.2px'}}>UNITY  (Dalit Resources for Education and Economics Advanced and Mobilization Society) is dedicated to empowering individuals and families through <span className="font-bold text-blue-600">connection</span>, <span className="font-bold text-green-600">opportunity</span>, and <span className="font-bold text-sky-600">growth</span>.</p>
            <div className="relative w-full flex justify-center px-4">
              <div className="glass-card-timeline animate-card-fadein expanded-width w-full max-w-4xl">
                {/* Timeline/Stepper */}
                <div className="timeline-vertical">
                  {/* Step 1: Connection */}
                  <div className="timeline-step">
                    <div className="timeline-icon timeline-icon-connection">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <radialGradient id="conn-grad" cx="50%" cy="50%" r="70%">
                            <stop offset="0%" stopColor="#38bdf8"/>
                            <stop offset="100%" stopColor="#0ea5e9"/>
                          </radialGradient>
                        </defs>
                        <circle cx="24" cy="24" r="20" fill="url(#conn-grad)" opacity="0.18"/>
                        <circle cx="24" cy="24" r="14" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="2.5"/>
                        <path d="M16 24a8 8 0 0 1 16 0" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round"/>
                        <circle cx="24" cy="24" r="3.5" fill="#0ea5e9"/>
                      </svg>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">Build a vibrant, supportive community where everyone belongs.</div>
                    </div>
                  </div>
                  {/* Stepper Line */}
                  <div className="timeline-line"></div>
                  {/* Step 2: Opportunity */}
                  <div className="timeline-step">
                    <div className="timeline-icon timeline-icon-opportunity">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="opp-grad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#4ade80"/>
                            <stop offset="100%" stopColor="#22c55e"/>
                          </linearGradient>
                        </defs>
                        <rect x="8" y="8" width="32" height="32" rx="12" fill="#bbf7d0" stroke="url(#opp-grad)" strokeWidth="2.5"/>
                        <path d="M24 16v12l8 5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"/>
                        <circle cx="24" cy="24" r="3.5" fill="#22c55e"/>
                      </svg>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">Foster lifelong learning, career advancement, and personal growth.</div>
                    </div>
                  </div>
                  <div className="timeline-line"></div>
                  {/* Step 3: Growth */}
                  <div className="timeline-step">
                    <div className="timeline-icon timeline-icon-growth">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <radialGradient id="grow-grad" cx="50%" cy="50%" r="70%">
                            <stop offset="0%" stopColor="#bae6fd"/>
                            <stop offset="100%" stopColor="#0ea5e9"/>
                          </radialGradient>
                        </defs>
                        <ellipse cx="24" cy="36" rx="16" ry="6" fill="url(#grow-grad)"/>
                        <path d="M24 36V14" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round"/>
                        <circle cx="24" cy="10" r="6" fill="#0ea5e9" stroke="#0369a1" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">Inspire members to dream big and achieve more—together.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        {/* Our History Section */}

        {/* Vision Section */}
        <section className="w-full flex justify-center py-6 md:py-8 vision-section" style={{ background: '#fff', minHeight: 'auto', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div className="flex flex-col md:flex-row items-center justify-center animate-fade-slideup px-4" style={{ width: '95vw', maxWidth: '1200px', minHeight: 'auto', borderRadius: '8px', height: 'auto' }}>
            {/* Left: Illustration (50%) */}
            <div className="flex items-center justify-center relative w-full md:w-1/2 mb-6 md:mb-0" style={{ minHeight: '300px', padding: '16px', height: 'auto' }}>
              {/* Decorative Gradient Ring */}
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '280px', height: '280px', zIndex: 0, borderRadius: '50%', background: 'radial-gradient(circle, #a7f3d0 0%, #bae6fd 60%, transparent 100%)', filter: 'blur(8px)', opacity: 0.5 }}></div>
              <img src="/vision.png" alt="Vision Illustration" className="animate-float" style={{ width: '100%', maxWidth: '400px', height: 'auto', maxHeight: '300px', objectFit: 'contain', position: 'relative', zIndex: 1 }} />
            </div>
            {/* Right: Vision Card (50%) */}
            <div className="flex items-center w-full md:w-1/2" style={{ minHeight: '160px', position: 'relative', height: 'auto' }}>
              <div style={{ background: '#eaf8ee', borderRadius: '12px', padding: '24px 24px 20px 60px', minHeight: '140px', width: '100%', display: 'flex', alignItems: 'center', position: 'relative', boxShadow: '0 4px 24px 0 rgba(56,96,106,0.08)', border: '1.5px solid #d2e9db', fontFamily: 'Inter, Segoe UI, Arial, sans-serif', height: 'auto' }}>
                {/* Hexagon Icon - overlaps left edge (Vision) */}
                <div style={{ position: 'absolute', left: '-50px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
                  <div style={{ width: '72px', height: '72px', background: '#fff', clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px 0 rgba(56,96,106,0.10)', border: '2px solid #eaf8ee' }}>
                    <img src="/opportunity.png" alt="Vision Icon" style={{ width: '54px', height: '54px', objectFit: 'contain', display: 'block' }} />
                  </div>
                </div>
                {/* Vision Text */}
                <div className="text-left" style={{ paddingLeft: '24px', width: '100%' }}>
                  <div className="text-xl md:text-2xl font-extrabold" style={{ color: '#38606a', letterSpacing: '0.5px', marginBottom: '8px', fontFamily: 'inherit' }}>OUR VISION</div>
                  <div className="text-sm md:text-base font-medium" style={{ color: '#222', lineHeight: '1.6', maxWidth: '420px', fontFamily: 'inherit' }}>
                  To build a unified and inclusive support system that empowers marginalized communities through collective effort, shared responsibility, and sustainable development, fostering dignity, opportunity, and equality for all.                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Mission Section */}
        <section className="w-full flex justify-center py-6 md:py-8 mission-section" style={{ background: '#fff', minHeight: 'auto', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div className="flex flex-col md:flex-row items-center justify-center animate-fade-slideup px-4" style={{ width: '95vw', maxWidth: '1200px', minHeight: 'auto', borderRadius: '8px', height: 'auto' }}>
            {/* Left: Mission Card (50%) */}
            <div className="flex items-center w-full md:w-1/2 mb-6 md:mb-0" style={{ minHeight: '160px', position: 'relative', height: 'auto' }}>
              <div style={{ background: '#eaf8ee', borderRadius: '12px', padding: '24px 60px 20px 24px', minHeight: '140px', width: '100%', display: 'flex', alignItems: 'center', position: 'relative', boxShadow: '0 4px 24px 0 rgba(56,96,106,0.08)', border: '1.5px solid #d2e9db', fontFamily: 'Inter, Segoe UI, Arial, sans-serif', height: 'auto' }}>
                {/* Hexagon Icon - overlaps right edge (Mission) */}
                <div style={{ position: 'absolute', right: '-50px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
                  <div style={{ width: '72px', height: '72px', background: '#fff', clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px 0 rgba(56,96,106,0.10)', border: '2px solid #eaf8ee' }}>
                    <img src="/target.png" alt="Mission Icon" style={{ width: '54px', height: '54px', objectFit: 'contain', display: 'block' }} />
                  </div>
                </div>
                {/* Mission Text */}
                <div className="text-left" style={{ paddingRight: '24px', width: '100%' }}>
                  <div className="text-xl md:text-2xl font-extrabold" style={{ color: '#38606a', letterSpacing: '0.5px', marginBottom: '8px', fontFamily: 'inherit' }}>OUR MISSION</div>
                  <div className="text-sm md:text-base font-medium" style={{ color: '#222', lineHeight: '1.6', maxWidth: '420px', fontFamily: 'inherit' }}>
                  we strive to strengthen the foundational ecosystem that enables broader community upliftment, data-driven outreach, and social empowerment.  Aimed at channeling subscriptions and voluntary contributions towards the structured development of administrative infrastructure, digital platforms, and operational support.
</div>
                </div>
              </div>
            </div>
            {/* Right: Illustration (50%) */}
            <div className="flex items-center justify-center relative w-full md:w-1/2" style={{ minHeight: '300px', padding: '16px', height: 'auto' }}>
              {/* Decorative Gradient Ring */}
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '280px', height: '280px', zIndex: 0, borderRadius: '50%', background: 'radial-gradient(circle, #a7f3d0 0%, #bae6fd 60%, transparent 100%)', filter: 'blur(8px)', opacity: 0.5 }}></div>
              <img src="/mission.png" alt="Mission Illustration" className="animate-float" style={{ width: '100%', maxWidth: '400px', height: 'auto', maxHeight: '300px', objectFit: 'contain', position: 'relative', zIndex: 1 }} />
            </div>
          </div>
        </section>

        {/* Combined History & About Section */}
        <section className="w-full flex justify-center py-8 md:py-12 px-4" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%)', minHeight: 'auto', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div className="flex flex-col md:flex-row items-center justify-center animate-fade-slideup" style={{ width: '95vw', maxWidth: '1200px', minHeight: 'auto', borderRadius: '12px', height: 'auto', background: 'rgba(255,255,255,0.8)', boxShadow: '0 8px 32px 0 rgba(56,96,106,0.12)', padding: '24px 0' }}>
            {/* Left: Text Content */}
            <div className="flex flex-col items-start justify-center px-4 md:px-8 w-full md:w-2/3" style={{ minHeight: 'auto' }}>
              <div className="text-2xl md:text-3xl font-extrabold mb-4" style={{ color: '#1e40af', letterSpacing: '0.5px', fontFamily: 'inherit' }}>Our History</div>
                              <div className="text-sm md:text-base lg:text-lg font-medium" style={{ color: '#374151', lineHeight: '1.7', maxWidth: '650px', fontFamily: 'inherit', textAlign: 'left' }}>
                  <p className="mb-3">
                    <strong>DREAMS (Dalit Resource for Education and Economic Advancement and Mobilisation) is a registered non-profit society</strong> that began with a vision to create a comprehensive platform for marginalized communities to connect, learn, and grow together.
                  </p>
                  <p className="mb-3">
                    Our Unity  platform serves as a comprehensive ecosystem for community empowerment, providing educational resources, economic advancement through job portals, community mobilization, and transparent data sharing for mutual growth.
                  </p>
                  <p className="mb-3">
                    <strong>Data Protection & Privacy:</strong> We collect and process personal data (identification, demographic, transaction, and communication data) to provide our services, maintain records, and enable community networking. We implement SSL encryption, access controls, and comply with GDPR and IT Act, 2000 (India).
                  </p>
                  <p className="mb-3">
                    <strong>Your Rights:</strong> You have the right to access, correct, or delete your data, withdraw consent, and lodge complaints. Contact us at <strong>dreams.society2025@gmail.com</strong> for any privacy-related concerns.
                  </p>
                </div>
            </div>
            {/* Right: Decorative Element */}
            <div className="flex items-center justify-center relative w-full md:w-1/3 mt-6 md:mt-0" style={{ minHeight: '200px', padding: '20px' }}>
              {/* Decorative Gradient Ring */}
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '180px', height: '180px', zIndex: 0, borderRadius: '50%', background: 'radial-gradient(circle, #dbeafe 0%, #dcfce7 60%, transparent 100%)', filter: 'blur(10px)', opacity: 0.6 }}></div>
              {/* Icon or Symbol */}
              <div style={{ position: 'relative', zIndex: 1, width: '120px', height: '120px', background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px 0 rgba(59,130,246,0.3)' }}>
                <svg width="48" height="48" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="35" fill="white" opacity="0.9"/>
                  <path d="M25 40a15 15 0 0 1 30 0" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="40" cy="40" r="6" fill="#3b82f6"/>
                  <path d="M40 25v30" stroke="#10b981" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M25 40h30" stroke="#10b981" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>
        </section>
        {/* Footer */}
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
      <style>{`
        .glass-card-timeline {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.18);
          max-width: 800px;
          width: 100%;
        }
        .expanded-width {
          width: 100%;
          max-width: 800px;
        }
        .timeline-vertical {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .timeline-step {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          position: relative;
        }
        .timeline-icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          box-shadow: 0 4px 16px 0 rgba(31, 38, 135, 0.10);
          position: relative;
          z-index: 2;
        }
        .timeline-content {
          flex: 1;
          padding-top: 8px;
        }
        .timeline-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.5;
        }
        .timeline-line {
          position: absolute;
          left: 24px;
          top: 48px;
          bottom: -24px;
          width: 2px;
          background: linear-gradient(to bottom, #e0f2fe, #bae6fd);
          z-index: 1;
        }
        .timeline-step:last-child .timeline-line {
          display: none;
        }
        @keyframes title-pop {
          0% { opacity: 0; transform: translateY(-20px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-title-pop {
          animation: title-pop 1s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes divider-fadein {
          0% { opacity: 0; transform: scaleX(0); }
          100% { opacity: 1; transform: scaleX(1); }
        }
        .animate-divider-fadein {
          animation: divider-fadein 1.2s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes divider-glow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .animate-divider-glow {
          animation: divider-glow 2s ease-in-out infinite;
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes card-fadein {
          0% { opacity: 0; transform: translateY(40px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-card-fadein {
          animation: card-fadein 1.5s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes fade-slideup {
          0% { opacity: 0; transform: translateY(60px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slideup {
          animation: fade-slideup 1.2s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default About; 