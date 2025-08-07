import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Menu, Search, X, Users, Briefcase, Building, MapPin, Filter } from 'lucide-react';
import { useMobile } from '@/contexts/MobileContext';

import GlobalSearch from '@/components/common/GlobalSearch';

const navLinks = [
  { to: '/', label: 'Home', color: 'blue' },
  { to: '/about', label: 'About', color: 'teal' },
  { to: '/society', label: 'Society', color: 'indigo' },
  { to: '/contact', label: 'Contact', color: 'gray' },
];

const headerFont = 'Montserrat, Inter, Plus Jakarta Sans, sans-serif';
// Update font stacks for logo/title and nav links
const logoFont = 'Orbitron, Montserrat, Inter, Plus Jakarta Sans, sans-serif';
const navFont = 'Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif';

const WelcomeHeader = () => {
  const { isMobile } = useMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('WelcomeHeader - isMobile:', isMobile);
    console.log('WelcomeHeader - window.innerWidth:', window.innerWidth);
    console.log('WelcomeHeader - current location:', location.pathname);
  }, [isMobile, location.pathname]);

  // Close menu when location changes
  React.useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Force re-check mobile state on location change
  React.useEffect(() => {
    const checkMobileState = () => {
      const width = window.innerWidth;
      const shouldBeMobile = width < 768;
      console.log('WelcomeHeader - Location changed, re-checking mobile state:', shouldBeMobile);
    };
    
    // Check immediately
    checkMobileState();
    
    // Check again after a short delay
    const timeoutId = setTimeout(checkMobileState, 100);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);



  return (
    <header
      className="w-full px-4 md:px-8 py-4 border-b border-gray-200/60 backdrop-blur-xl bg-white/90 sticky top-0 z-50"
      style={{
        fontFamily: headerFont,
        position: 'relative',
        zIndex: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
      }}
    >
             {/* Professional Nav link animation styles */}
       <style>{`
         .nav-creative-link {
           position: relative;
           overflow: hidden;
           transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
           font-weight: 600;
           letter-spacing: 0.025em;
         }
         .nav-creative-link:before {
           content: '';
           position: absolute;
           left: 50%;
           bottom: -0.3em;
           width: 0;
           height: 2px;
           background: linear-gradient(90deg, #1e40af 0%, #2563eb 25%, #06b6d4 75%, #0891b2 100%);
           border-radius: 1px;
           transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
           box-shadow: 0 0 8px rgba(37, 99, 235, 0.4);
         }
         .nav-creative-link:hover, .nav-creative-link:focus {
           color: #1e40af !important;
           transform: translateY(-2px);
           text-shadow: 0 1px 3px rgba(30, 64, 175, 0.15);
         }
         .nav-creative-link:hover:before, .nav-creative-link:focus:before {
           width: 85%;
           left: 7.5%;
           box-shadow: 0 0 12px rgba(37, 99, 235, 0.5);
         }
         .nav-creative-link.active {
           color: #1e40af !important;
           font-weight: 700;
           text-shadow: 0 1px 3px rgba(30, 64, 175, 0.2);
         }
         .nav-creative-link.active:before {
           width: 100%;
           left: 0;
           background: linear-gradient(90deg, #1e40af 0%, #2563eb 25%, #06b6d4 75%, #0891b2 100%);
           box-shadow: 0 0 16px rgba(37, 99, 235, 0.6);
         }
         
         .logo-container {
           position: relative;
           transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
           background: linear-gradient(135deg, #1e40af 0%, #2563eb 25%, #06b6d4 75%, #0891b2 100%);
         }
         .logo-container:hover {
           transform: scale(1.02) translateY(-1px);
           box-shadow: 0 12px 32px rgba(37, 99, 235, 0.3);
         }
         .logo-container::before {
           content: '';
           position: absolute;
           inset: -3px;
           background: linear-gradient(45deg, #1e40af, #2563eb, #06b6d4, #0891b2, #1e40af);
           border-radius: 18px;
           opacity: 0;
           transition: opacity 0.5s ease;
           z-index: -1;
           background-size: 200% 200%;
           animation: gradientShift 3s ease infinite;
         }
         .logo-container:hover::before {
           opacity: 0.8;
         }
         
         @keyframes gradientShift {
           0%, 100% { background-position: 0% 50%; }
           50% { background-position: 100% 50%; }
         }
         
         .brand-text {
           background: linear-gradient(135deg, #1e40af 0%, #2563eb 25%, #06b6d4 75%, #0891b2 100%);
           -webkit-background-clip: text;
           -webkit-text-fill-color: transparent;
           background-clip: text;
           background-size: 200% 200%;
           animation: shimmer 4s ease-in-out infinite;
           font-weight: 800;
         }
         
         @keyframes shimmer {
           0%, 100% { background-position: 0% 50%; }
           50% { background-position: 100% 50%; }
         }
         
         .header-glow {
           position: absolute;
           top: 0;
           left: 0;
           right: 0;
           height: 2px;
           background: linear-gradient(90deg, transparent, #1e40af, #2563eb, #06b6d4, #0891b2, transparent);
           opacity: 0.9;
           animation: glow 3s ease-in-out infinite alternate;
         }
         
         @keyframes glow {
           from { opacity: 0.6; }
           to { opacity: 1; }
         }
         
         .professional-button {
           position: relative;
           overflow: hidden;
           transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
         }
         .professional-button::before {
           content: '';
           position: absolute;
           top: 0;
           left: -100%;
           width: 100%;
           height: 100%;
           background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
           transition: left 0.6s ease;
         }
         .professional-button:hover::before {
           left: 100%;
         }
       `}</style>
      
             {/* Professional decorative elements */}
       <div className="header-glow" />
       <div className="absolute inset-0 bg-gradient-to-r from-blue-50/40 via-transparent to-cyan-50/40" />
       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/50 to-transparent" />
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.03),transparent_50%)]" />
             {/* Global Search Overlay */}
      <GlobalSearch 
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
      <div className="w-full flex flex-row items-center justify-between gap-2 md:gap-4 relative z-30">
                 {/* Professional Logo and Title */}
         <div className="flex flex-row items-center gap-2 md:gap-4 lg:gap-6 min-w-0 flex-1 md:flex-none md:justify-start">
           <div className="logo-container flex items-center justify-center rounded-xl border-2 border-blue-200/60 shadow-2xl flex-shrink-0" style={{padding:'8px 12px',minWidth:'fit-content'}}>
             <span 
               className="font-black text-white text-sm md:text-base lg:text-lg xl:text-xl tracking-wider relative z-10 whitespace-nowrap"
               style={{
                 fontFamily: logoFont,
                 textShadow: '0 2px 6px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.4)',
                 letterSpacing: '0.1em',
                 filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))'
               }}
             >
               DREAMS
             </span>
             <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-xl" />
           </div>
                     <div className="flex flex-col leading-tight ml-1 md:ml-2 min-w-0 flex-1">
             <span className="brand-text font-extrabold text-lg md:text-xl lg:text-2xl xl:text-3xl tracking-tight truncate" style={{fontFamily:logoFont,letterSpacing:'-0.8px',lineHeight:'1.05',textTransform:'uppercase'}}>UNITY Nest</span>
             <span className="text-gray-600 text-[10px] md:text-xs lg:text-sm font-medium tracking-wide leading-tight truncate" style={{fontFamily:navFont,marginTop:'-2px'}}>(non profit organization)</span>
           </div>
        </div>
        {/* Desktop Nav & Auth */}
        <div className="hidden md:flex flex-1 items-center justify-between">
          <nav className="flex-1 flex justify-center">
            <ul className="flex gap-8 md:gap-10 text-sm md:text-base font-medium items-center">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `px-5 md:px-6 py-3 rounded-xl nav-creative-link transition-all duration-300 ${
                        isActive ? 'active bg-gradient-to-r from-blue-100/90 to-cyan-100/90 font-bold shadow-xl' : 'text-gray-800 hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-cyan-50/70'
                      }`
                    }
                    style={{ fontFamily: navFont, fontWeight: 600, letterSpacing: '0.025em', background: 'transparent', fontSize: '1rem' }}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex gap-4 md:gap-5 min-w-fit justify-center md:justify-end">
            {/* Global Search Button - Desktop */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
              title="Global Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <Link to="/login">
              <Button
                className="professional-button bg-white/95 backdrop-blur-sm border-2 border-blue-200/70 text-blue-800 font-semibold px-6 md:px-8 py-3 rounded-xl shadow-xl hover:bg-blue-50/95 hover:text-blue-900 hover:border-blue-300 hover:scale-105 hover:shadow-2xl transition-all duration-300 text-sm md:text-base"
                style={{ fontFamily: headerFont, letterSpacing: '0.025em' }}
              >
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button
                className="professional-button bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white font-bold px-6 md:px-8 py-3 rounded-xl hover:from-blue-800 hover:via-blue-700 hover:to-cyan-700 hover:scale-105 hover:shadow-2xl transition-all duration-300 text-sm md:text-base border-0 shadow-xl"
                style={{ fontFamily: headerFont, letterSpacing: '0.025em' }}
              >
                Register
              </Button>
            </Link>
          </div>
        </div>
        
                 {/* Mobile Hamburger - CSS-based fallback */}
         <div className="md:hidden flex-shrink-0 flex items-center gap-2">
           {/* Global Search Button - Mobile */}
           <button
             onClick={() => setSearchOpen(true)}
             className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
             title="Global Search"
           >
             <Search className="w-5 h-5" />
           </button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
                               <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 touch-manipulation bg-white/90 backdrop-blur-sm border border-gray-200/70 shadow-lg hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-xl" 
                  aria-label="Toggle menu"
                >
                  {menuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
                </Button>
             </SheetTrigger>
            <SheetContent 
              side="left" 
              className="p-0 w-80 max-w-[85vw] transition-all duration-300 ease-in-out bg-gradient-to-b from-white to-blue-50/40"
            >
              <div className="flex flex-col gap-6 p-4 md:p-6 h-full overflow-y-auto">
                <div className="flex flex-row items-center gap-3 mb-6">
                  <div className="logo-container flex items-center justify-center rounded-lg border-2 border-blue-200/60 shadow-xl" style={{padding:'8px 12px',minWidth:'fit-content'}}>
                    <span 
                      className="font-black text-white text-sm md:text-base tracking-wider relative z-10 whitespace-nowrap"
                      style={{
                        fontFamily: logoFont,
                        textShadow: '0 1px 4px rgba(0,0,0,0.5), 0 0 12px rgba(255,255,255,0.4)',
                        letterSpacing: '0.08em',
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'
                      }}
                    >
                      DREAMS
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-lg" />
                  </div>
                                     <div className="flex flex-col">
                     <span className="brand-text font-extrabold text-base md:text-lg leading-tight">UNITY</span>
                     <span className="text-gray-600 text-[10px] md:text-xs font-medium tracking-wide leading-tight" style={{fontFamily:navFont,marginTop:'-1px',maxWidth:'120px'}}>not for profit and non political organisation</span>
                   </div>
                </div>
                <nav className="flex flex-col gap-3 md:gap-4 flex-1">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/'}
                      className={({ isActive }) =>
                        `px-5 py-3 rounded-xl transition-all duration-300 text-base md:text-lg font-medium touch-manipulation ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-100/90 to-cyan-100/90 text-blue-800 font-bold shadow-lg' : 'hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-cyan-50/70 hover:text-blue-800'
                        }`
                      }
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </nav>
                <div className="flex flex-col gap-4 mt-auto pt-6 border-t border-gray-200">
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <button className="professional-button w-full bg-white/95 backdrop-blur-sm border-2 border-blue-200/70 text-blue-800 font-semibold rounded-xl px-5 py-3 hover:bg-blue-50/95 hover:text-blue-900 hover:border-blue-300 hover:scale-105 transition-all duration-300 text-sm md:text-base shadow-lg touch-manipulation">
                      Log in
                    </button>
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}>
                    <button className="professional-button w-full bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white font-bold rounded-xl px-5 py-3 hover:from-blue-800 hover:via-blue-700 hover:to-cyan-700 hover:scale-105 hover:shadow-xl transition-all duration-300 text-sm md:text-base shadow-lg touch-manipulation">
                      Register
                    </button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default WelcomeHeader; 