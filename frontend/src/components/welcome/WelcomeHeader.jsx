import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import {
  Menu,
  Search,
  X,
  Users,
  Briefcase,
  Building,
  MapPin,
  Filter,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react';
import { useMobile } from '@/contexts/MobileContext';

import GlobalSearch from '@/components/common/GlobalSearch';

const navLinks = [
  { to: '/', label: 'Home', color: 'blue' },
  { to: '/about', label: 'About', color: 'teal' },
  { to: '/society', label: 'Society', color: 'indigo' },
  { to: '/contact', label: 'Contact', color: 'gray' },
];

const headerFont = 'Poppins, Montserrat, Inter, Plus Jakarta Sans, sans-serif';
const logoFont = 'Poppins, Orbitron, Montserrat, Inter, Plus Jakarta Sans, sans-serif';
const navFont = 'Poppins, Quicksand, Montserrat, Inter, Plus Jakarta Sans, sans-serif';

const WelcomeHeader = () => {
  const { isMobile } = useMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    console.log('WelcomeHeader - isMobile:', isMobile);
    console.log('WelcomeHeader - window.innerWidth:', window.innerWidth);
    console.log('WelcomeHeader - current location:', location.pathname);
  }, [isMobile, location.pathname]);

  React.useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    const checkMobileState = () => {
      const width = window.innerWidth;
      const shouldBeMobile = width < 768;
      console.log('WelcomeHeader - Location changed, re-checking mobile state:', shouldBeMobile);
    };
    
    checkMobileState();
    const timeoutId = setTimeout(checkMobileState, 100);
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  return (
    <>
      {/* Social bar above header */}
      <div
        className="w-full flex items-center justify-between px-4 md:px-8"
        style={{
          height: '40px',
          backgroundColor: '#f8faf8',
          fontFamily: headerFont,
          fontWeight: 'bold',
        }}
      >
        {/* Left side: Organization name */}
        <span
          className="text-gray-800 text-xs md:text-sm font-black truncate"
          style={{
            maxWidth: '70%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: '900',
          }}
          title="Dalit Resources for Education and Economics Advanced and Mobilization Society (DREAMS)"
        >
          Dalit Resources for Education and Economics Advanced and Mobilization Society
        </span>

        {/* Right side: Social icons */}
        <div className="flex items-center gap-4 text-gray-700">
          <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
            <Facebook className="w-4 h-4 hover:text-blue-600 transition-colors" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
            <Twitter className="w-4 h-4 hover:text-sky-500 transition-colors" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
            <Instagram className="w-4 h-4 hover:text-pink-500 transition-colors" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <Linkedin className="w-4 h-4 hover:text-blue-700 transition-colors" />
          </a>
        </div>
      </div>

      {/* Main Header */}
      <header
        className="w-full px-4 md:px-8 border-b border-gray-200/60 backdrop-blur-xl sticky top-0 z-50"
        style={{
          fontFamily: headerFont,
          position: 'relative',
          zIndex: 20,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
          height: '75px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <style>{`
          .nav-creative-link {
            position: relative;
            overflow: visible;
            transition: color 0.22s ease, transform 0.12s ease;
            font-weight: 500;
            letter-spacing: 0.02em;
            color: rgba(255,255,255,0.9);
          }
          .nav-creative-link:before {
            content: '';
            position: absolute;
            left: 50%;
            bottom: 6px;
            width: 0;
            height: 2px;
            background: rgba(255,255,255,0.92);
            border-radius: 2px;
            transition: width 0.28s ease, left 0.28s ease;
          }
          .nav-creative-link:hover, .nav-creative-link:focus {
            color: #ffffff !important;
            transform: translateY(-2px);
            text-decoration: none;
          }
          .nav-creative-link:hover:before, .nav-creative-link:focus:before {
            width: 80%;
            left: 10%;
          }
          .nav-creative-link.active {
            color: #ffffff !important;
            font-weight: 600;
          }
          .nav-creative-link.active:before {
            width: 100%;
            left: 0;
          }

          .logo-container {
            position: relative;
            transition: transform 0.18s ease, box-shadow 0.18s ease;
            border-radius: 8px;
            background: rgba(255,255,255,0.1);
          }
          .logo-container:hover {
            transform: translateY(-2px) scale(1.01);
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          }
          .logo-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent);
            border-radius: 8px;
            pointer-events: none;
          }

          .brand-text {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 800;
            letter-spacing: -0.02em;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: relative;
          }
          .brand-text::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, #fbbf24, #f59e0b, #d97706);
            border-radius: 1px;
            opacity: 0.8;
          }

          .professional-button {
            position: relative;
            overflow: hidden;
            transition: transform 0.14s ease, box-shadow 0.18s ease;
          }
          .professional-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 28px rgba(0,0,0,0.1);
          }

          .search-button {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            color: rgba(255,255,255,0.9);
            font-weight: 500;
            font-size: 14px;
            transition: all 0.2s ease;
            backdrop-filter: blur(10px);
          }
          .search-button:hover {
            background: rgba(255,255,255,0.15);
            border-color: rgba(255,255,255,0.3);
            color: #ffffff;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          .header-decor {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #fbbf24, #f59e0b, #d97706);
            opacity: 0.9;
          }
        `}</style>

        {/* Decorative strip */}
        <div className="header-decor" />

        {/* Global Search Overlay */}
        <GlobalSearch 
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
        />

        <div className="w-full flex flex-row items-center justify-between gap-2 md:gap-4 relative z-30"
            style={{ alignItems: 'center' }}>
          
          {/* Logo and Title */}
          <Link 
            to="/" 
            className="flex flex-row items-center gap-2 md:gap-4 lg:gap-6 min-w-0 flex-1 md:flex-none md:justify-start cursor-pointer hover:opacity-90 transition-opacity duration-200"
            style={{ alignItems: 'center' }}
          >
            {/* Logo Image */}
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ minWidth: 'fit-content' }}
            >
              <img
                src="/partners.png"
                alt="Community Logo"
                style={{
                  height: 36,
                  width: 36,
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: 6,
                }}
              />
            </div>

            <div
              className="flex flex-col leading-tight ml-1 md:ml-2 min-w-0 flex-1"
              style={{ alignItems: 'flex-start' }}
            >
              <span
                className="brand-text font-black tracking-tight truncate"
                style={{
                  fontFamily: logoFont,
                  fontSize: '24px',
                  letterSpacing: '-0.8px',
                  lineHeight: '1.05',
                  fontWeight: '800',
                }}
              >
                DREAMS
              </span>
              <span
                className="text-white/80 text-[10px] md:text-xs lg:text-sm font-medium tracking-wide leading-tight truncate"
                style={{ fontFamily: navFont, marginTop: '-2px' }}
              >
                non profit organization
              </span>
            </div>
          </Link>

          {/* Desktop Nav & Auth */}
          <div className="hidden md:flex flex-1 items-center justify-between" style={{ alignItems: 'center' }}>
            <nav className="flex-1 flex justify-center">
              <ul className="flex gap-6 md:gap-8 text-sm md:text-[15px] font-medium items-center">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      end={link.to === '/'}
                      className={({ isActive }) =>
                        `px-4 md:px-5 py-3 rounded-xl nav-creative-link transition-all duration-300 ${
                          isActive ? 'active bg-transparent font-semibold' : 'text-white/90 hover:bg-transparent'
                        }`
                      }
                      style={{ fontFamily: navFont, letterSpacing: '0.025em', background: 'transparent' }}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex gap-3 md:gap-4 min-w-fit justify-center md:justify-end">
              {/* Global Search Button - Desktop */}
              <button
                onClick={() => setSearchOpen(true)}
                className="search-button"
                title="Global Search"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
              
              <Link to="/login">
                <Button
                  className="professional-button bg-white/95 backdrop-blur-sm border border-white/20 text-[#1e3a8a] font-semibold px-5 md:px-6 py-2 rounded-lg shadow-sm hover:bg-white/100 hover:scale-102 transition-all duration-300 text-sm md:text-[15px]"
                  style={{ fontFamily: headerFont, letterSpacing: '0.025em' }}
                >
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  className="professional-button bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-5 md:px-6 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 hover:scale-102 transition-all duration-300 text-sm md:text-[15px] border-0 shadow-sm"
                  style={{ fontFamily: headerFont, letterSpacing: '0.025em' }}
                >
                  Register
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Mobile Hamburger */}
          <div className="md:hidden flex-shrink-0 flex items-center gap-2">
            {/* Global Search Button - Mobile */}
            <button
              onClick={() => setSearchOpen(true)}
              className="search-button"
              title="Global Search"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 touch-manipulation bg-white/08 backdrop-blur-sm border border-white/10 shadow-sm hover:bg-white/12 hover:shadow-md hover:scale-105 transition-all duration-300 rounded-lg" 
                  aria-label="Toggle menu"
                >
                  {menuOpen ? <X className="w-5 h-5 text-white/95" /> : <Menu className="w-5 h-5 text-white/95" />}
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="left" 
                className="p-0 w-72 max-w-[85vw] transition-all duration-300 ease-in-out bg-white"
              >
                <div className="flex flex-col gap-6 p-4 md:p-6 h-full overflow-y-auto">
                  <Link to="/" onClick={() => setMenuOpen(false)} className="flex flex-row items-center gap-3 mb-6 cursor-pointer hover:opacity-90 transition-opacity duration-200">
                    <div className="logo-container flex items-center justify-center rounded-lg border border-gray-200 shadow-sm" style={{padding:'8px',minWidth:'fit-content'}}>
                      <img
                        src="/partners.png"
                        alt="Community Logo"
                        style={{ height: 36, width: 36, objectFit: 'contain', display: 'block', borderRadius: 6 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-lg" />
                    </div>
                    <div className="flex flex-col">
                      <span className="brand-text font-bold text-base md:text-lg leading-tight text-gray-800">DREAMS</span>
                      <span className="text-gray-600 text-[10px] md:text-xs font-medium tracking-wide leading-tight" style={{fontFamily:navFont,marginTop:'-1px',maxWidth:'120px'}}>not for profit organization</span>
                    </div>
                  </Link>
                  <nav className="flex flex-col gap-3 md:gap-4 flex-1">
                    {navLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === '/'}
                        className={({ isActive }) =>
                          `px-4 py-3 rounded-lg transition-all duration-300 text-base md:text-lg font-medium touch-manipulation ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-100/90 to-cyan-100/90 text-blue-800 font-semibold shadow-md' : 'hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-cyan-50/70 hover:text-blue-800'
                          }`
                        }
                        onClick={() => setMenuOpen(false)}
                      >
                        {link.label}
                      </NavLink>
                    ))}
                  </nav>
                  <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-gray-200">
                    <Link to="/login" onClick={() => setMenuOpen(false)}>
                      <button className="professional-button w-full bg-white/95 backdrop-blur-sm border border-blue-200 text-blue-800 font-semibold rounded-lg px-4 py-2.5 hover:bg-blue-50/95 hover:text-blue-900 hover:border-blue-300 hover:scale-105 transition-all duration-300 text-sm md:text-base shadow-md touch-manipulation">
                        Log in
                      </button>
                    </Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)}>
                      <button className="professional-button w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg px-4 py-2.5 hover:from-amber-600 hover:to-orange-600 hover:scale-105 hover:shadow-md transition-all duration-300 text-sm md:text-base shadow-md touch-manipulation">
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
    </>
  );
};

export default WelcomeHeader;
