
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, Star, ArrowRight, Linkedin, Twitter, Facebook, Globe, MessageCircle, Book, Image as LucideImage, Play, Lightbulb, Search } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Contact from './Contact';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { PanelLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import WelcomeHeader from './WelcomeHeader';
import GlobalSearch from '@/components/common/GlobalSearch';

const WelcomeScreen = () => {
  const isMobile = useIsMobile();
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <WelcomeHeader />

      {/* Global Search */}
      <GlobalSearch 
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Main Content with Sky Theme and Clouds */}
      <div className="flex flex-col h-screen">
        {/* Header remains at the top */}
        {/* Main Content fills the rest of the screen */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 flex flex-col">
            {/* Quotation Carousel Section - now directly below header */}
            <section 
              className="w-full flex items-center justify-center relative"
              style={{
                height: 'calc(100vh - 80px)', // Adjust 80px to your actual header height
                backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0.5) 100%), url("back.png")',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                boxShadow: 'none',
                border: 'none',
              }}
            >
              <Carousel
                opts={{ loop: true, align: 'center' }}
                plugins={typeof Autoplay !== 'undefined' ? [Autoplay({ delay: 6000, stopOnInteraction: false })] : []}
                className="w-[95vw] md:w-[90vw] mx-auto rounded-none overflow-visible relative z-10"
              >
                <CarouselContent>
                  {/* Quote 1 */}
                  <CarouselItem>
                    <div className="flex flex-col md:flex-row w-full h-full min-h-0 bg-transparent relative">
                      {/* Content Section */}
                      <div className="flex flex-col justify-center items-start px-4 md:px-12 py-6 md:py-10 md:w-1/2 w-full relative z-10" style={{background: 'transparent', minHeight: '100%'}}>
                        <div className="flex items-center mb-3 md:mb-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-blue-500 via-white-400 to-blue-200 shadow-lg border-2 border-white/70 mr-2 md:mr-3 animate-float-slow">
                            <Users className="w-4 h-4 md:w-5 md:h-5 lg:w-7 lg:h-7 text-white drop-shadow" />
                          </span>
                          <span className="uppercase text-xs font-bold tracking-widest text-blue-500">Unity</span>
                        </div>
                        <blockquote className="font-serif text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-blue-900 mb-4 md:mb-6 lg:mb-8 drop-shadow-lg leading-tight md:leading-snug tracking-tight">"Empowering a brighter future together"</blockquote>
                        <Link to="/register"><button className="bg-gradient-to-r from-blue-700 to-cyan-500 hover:from-blue-800 hover:to-cyan-600 text-white font-bold px-4 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3 rounded-2xl shadow-xl transition-all text-sm md:text-base lg:text-lg tracking-wide">Get Inspired</button></Link>
                      </div>
                      {/* Image Section */}
                      <div className="relative flex-1 h-full flex items-center justify-center">
                        <svg viewBox="0 0 1400 1400" width="90%" height="90%" className="w-[80%] md:w-[85%] lg:w-[90%] h-[80%] md:h-[85%] lg:h-[90%] max-w-[80%] md:max-w-[85%] lg:max-w-[90%] max-h-[80%] md:max-h-[85%] lg:max-h-[90%]" style={{maxWidth:'80%',maxHeight:'80%'}}>
                          <defs>
                            <clipPath id="carouselBlob1" clipPathUnits="objectBoundingBox">
                              <path d="M0.7,0.1 C0.9,0.2,1,0.4,0.95,0.6 C0.9,0.8,0.7,1,0.5,0.95 C0.3,0.9,0.1,0.7,0.1,0.5 C0.1,0.3,0.5,0,0.7,0.1 Z" />
                            </clipPath>
                          </defs>
                          <image
                            href="bg1.jpg"
                            width="1400"
                            height="1400"
                            clipPath="url(#carouselBlob1)"
                            preserveAspectRatio="xMidYMid slice"
                            style={{maxWidth:'80%',maxHeight:'80%'}}
                          />
                        </svg>
                      </div>
                    </div>
                  </CarouselItem>
                  {/* Quote 2 */}
                  <CarouselItem>
                    <div className="flex flex-col md:flex-row w-full h-full min-h-0 bg-transparent relative">
                      {/* Content Section */}
                      <div className="flex flex-col justify-center items-start px-4 md:px-12 py-6 md:py-10 md:w-1/2 w-full relative z-10" style={{background: 'transparent', minHeight: '100%'}}>
                        <div className="flex items-center mb-3 md:mb-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-200 shadow-lg border-2 border-white/70 mr-2 md:mr-3 animate-float-slow">
                            <Book className="w-4 h-4 md:w-5 md:h-5 lg:w-7 lg:h-7 text-white drop-shadow" />
                          </span>
                          <span className="uppercase text-xs font-bold tracking-widest text-blue-500">Knowledge</span>
                        </div>
                        <blockquote className="font-serif text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-blue-900 mb-4 md:mb-6 lg:mb-8 drop-shadow-lg leading-tight md:leading-snug tracking-tight">"Knowledge is root, Prosperity is fruit."</blockquote>
                        <Link to="/register"><button className="bg-gradient-to-r from-blue-700 to-cyan-500 hover:from-blue-800 hover:to-cyan-600 text-white font-bold px-4 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3 rounded-2xl shadow-xl transition-all text-sm md:text-base lg:text-lg tracking-wide">Start Learning</button></Link>
                      </div>
                      {/* Image Section */}
                      <div className="relative flex-1 h-full flex items-center justify-center">
                        <svg viewBox="0 0 1400 1400" width="90%" height="90%" className="w-[80%] md:w-[85%] lg:w-[90%] h-[80%] md:h-[85%] lg:h-[90%] max-w-[80%] md:max-w-[85%] lg:max-w-[90%] max-h-[80%] md:max-h-[85%] lg:max-h-[90%]" style={{maxWidth:'80%',maxHeight:'80%'}}>
                          <defs>
                            <clipPath id="carouselBlob2" clipPathUnits="objectBoundingBox">
                              <path d="M0.8,0.2 C1,0.4,0.95,0.8,0.7,0.95 C0.5,1,0.2,0.8,0.1,0.5 C0,0.2,0.3,0,0.6,0.1 C0.7,0.15,0.7,0.1,0.8,0.2 Z" />
                            </clipPath>
                          </defs>
                          <image
                            href="bg2.png"
                            width="1400"
                            height="1400"
                            clipPath="url(#carouselBlob2)"
                            preserveAspectRatio="xMidYMid slice"
                            style={{maxWidth:'80%',maxHeight:'80%'}}
                          />
                        </svg>
                      </div>
                    </div>
                  </CarouselItem>
                  {/* Quote 3 */}
                  <CarouselItem>
                    <div className="flex flex-col md:flex-row w-full h-full min-h-0 bg-transparent relative">
                      {/* Content Section */}
                      <div className="flex flex-col justify-center items-start px-4 md:px-12 py-6 md:py-10 md:w-1/2 w-full relative z-10" style={{background: 'transparent', minHeight: '100%'}}>
                        <div className="flex items-center mb-3 md:mb-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-200 shadow-lg border-2 border-white/70 mr-2 md:mr-3 animate-float-slow">
                            <Star className="w-4 h-4 md:w-5 md:h-5 lg:w-7 lg:h-7 text-white drop-shadow" />
                          </span>
                          <span className="uppercase text-xs font-bold tracking-widest text-blue-500">Success</span>
                        </div>
                        <blockquote className="font-serif text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-blue-900 mb-4 md:mb-6 lg:mb-8 drop-shadow-lg leading-tight md:leading-snug tracking-tight">"Alone we can do so little; together we can do so much."</blockquote>
                        <Link to="/register"><button className="bg-gradient-to-r from-blue-700 to-cyan-500 hover:from-blue-800 hover:to-cyan-600 text-white font-bold px-4 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3 rounded-2xl shadow-xl transition-all text-sm md:text-base lg:text-lg tracking-wide">Register the Community</button></Link>
                      </div>
                      {/* Image Section */}
                      <div className="relative flex-1 h-full flex items-center justify-center">
                        <svg viewBox="0 0 1400 1400" width="90%" height="90%" className="w-[80%] md:w-[85%] lg:w-[90%] h-[80%] md:h-[85%] lg:h-[90%] max-w-[80%] md:max-w-[85%] lg:max-w-[90%] max-h-[80%] md:max-h-[85%] lg:max-h-[90%]" style={{maxWidth:'80%',maxHeight:'80%'}}>
                          <defs>
                            <clipPath id="carouselBlob3" clipPathUnits="objectBoundingBox">
                              <path d="M0.6,0.1 C0.8,0.2,0.9,0.4,0.85,0.6 C0.8,0.8,0.6,1,0.4,0.95 C0.2,0.9,0.1,0.7,0.1,0.5 C0.1,0.3,0.3,0.1,0.5,0.1 C0.6,0.1,0.6,0.1,0.6,0.1 Z" />
                            </clipPath>
                          </defs>
                          <image
                            href="bg3.png"
                            width="1400"
                            height="1400"
                            clipPath="url(#carouselBlob3)"
                            preserveAspectRatio="xMidYMid slice"
                            style={{maxWidth:'80%',maxHeight:'80%'}}
                          />
                        </svg>
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
              </Carousel>
            </section>


            {/* Welcome to Unity  - Project Details Vertical Stepper Section */}
            <section className="w-full py-8 md:py-16 bg-[#f4f8fb] border-b border-gray-200">
              <div className="max-w-3xl mx-auto flex flex-col items-center px-4">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12 animate-gradient-reveal bg-gradient-to-r from-sky-700 via-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">Welcome to UNITY </h2>
                <div className="relative w-full flex flex-col gap-8 md:gap-12 pl-6 md:pl-8 lg:pl-16">
                  {/* Vertical Line with glow animation */}
                  <div className="absolute left-2 md:left-4 lg:left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-blue-300 to-blue-100 rounded-full animate-glow-vertical" style={{ zIndex: 0 }} />
                  {/* Step 1: Platform Overview */}
                  <div className="relative flex items-start gap-4 md:gap-6 animate-fade-slide-in" style={{ animationDelay: '0.1s' }}>
                    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 text-blue-700 flex items-center justify-center animate-bounce-in w-10 h-10 md:w-12 md:h-12 rounded-full" style={{ animationDelay: '0.2s' }}><Globe className="w-5 h-5 md:w-7 md:h-7" /></div>
                    <div>
                      <div className="font-semibold text-base md:text-lg text-gray-900 mb-1 animate-typewriter" style={{ animationDelay: '0.3s' }}>Platform Overview</div>
                      <div className="text-gray-700 text-sm md:text-base animate-content-fade-scale" style={{ animationDelay: '0.4s' }}>Unity  is a dedicated professional and social network designed to empower, connect, and support our community members in their personal and career journeys.</div>
                    </div>
                  </div>
                  {/* Step 2: Key Functionalities */}
                  <div className="relative flex items-start gap-4 md:gap-6 animate-fade-slide-in" style={{ animationDelay: '0.5s' }}>
                    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 text-blue-700 flex items-center justify-center animate-bounce-in w-10 h-10 md:w-12 md:h-12 rounded-full" style={{ animationDelay: '0.6s' }}><Book className="w-5 h-5 md:w-7 md:h-7" /></div>
                    <div>
                      <div className="font-semibold text-base md:text-lg text-gray-900 mb-1 animate-typewriter" style={{ animationDelay: '0.7s' }}>Key Functionalities</div>
                      <div className="text-gray-700 text-sm md:text-base animate-content-fade-scale" style={{ animationDelay: '0.8s' }}>Network with peers, discover job opportunities, share knowledge, and access resources. Unity  offers a safe space for collaboration, mentorship, and growth.</div>
                    </div>
                  </div>
                  {/* Step 3: Our Motive */}
                  <div className="relative flex items-start gap-4 md:gap-6 animate-fade-slide-in" style={{ animationDelay: '0.9s' }}>
                    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 text-blue-700 flex items-center justify-center animate-bounce-in w-10 h-10 md:w-12 md:h-12 rounded-full" style={{ animationDelay: '1.0s' }}><Lightbulb className="w-5 h-5 md:w-7 md:h-7" /></div>
                    <div>
                      <div className="font-semibold text-base md:text-lg text-gray-900 mb-1 animate-typewriter" style={{ animationDelay: '1.1s' }}>Our Motive</div>
                      <div className="text-gray-700 text-sm md:text-base animate-content-fade-scale" style={{ animationDelay: '1.2s' }}>Our mission is to foster unity, provide equal opportunities, and uplift every member—enabling collective progress and lasting impact for generations to come.</div>
                    </div>
                  </div>
                </div>
              </div>
              <style>{`
                .step-circle {
                  width: 48px;
                  height: 48px;
                  border-radius: 50%;
                  background: linear-gradient(135deg, #e0edfa 0%, #f8fbff 60%, #e3f0ff 100%);
                  font-size: 1.5rem;
                  box-shadow: 0 4px 16px 0 rgba(31, 38, 135, 0.10);
                  margin-right: 0.5rem;
                  z-index: 1;
                }
                @keyframes gradient-reveal {
                  0% { background-size: 200% 100%; background-position: 100% 0; opacity: 0; }
                  60% { opacity: 1; }
                  100% { background-position: 0 0; opacity: 1; }
                }
                .animate-gradient-reveal {
                  background-size: 200% 100%;
                  background-position: 100% 0;
                  animation: gradient-reveal 2s cubic-bezier(0.4,0,0.2,1) both;
                }
                @keyframes fade-slide-in {
                  0% { opacity: 0; transform: translateY(40px) scale(0.95); }
                  60% { opacity: 1; transform: translateY(-8px) scale(1.03); }
                  100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-slide-in {
                  animation: fade-slide-in 1.2s cubic-bezier(0.4,0,0.2,1) both;
                }
                @keyframes glow-vertical {
                  0%, 100% { box-shadow: 0 0 0 0 rgba(56,189,248,0.15), 0 0 0 0 rgba(59,130,246,0.10); }
                  50% { box-shadow: 0 0 16px 8px rgba(56,189,248,0.25), 0 0 32px 16px rgba(59,130,246,0.12); }
                }
                .animate-glow-vertical {
                  animation: glow-vertical 2.5s ease-in-out infinite;
                }
                @keyframes bounce-in {
                  0% { opacity: 0; transform: scale(0.3) translateY(60px); }
                  60% { opacity: 1; transform: scale(1.15) translateY(-8px); }
                  80% { transform: scale(0.95) translateY(4px); }
                  100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-bounce-in {
                  animation: bounce-in 1.1s cubic-bezier(0.68,-0.55,0.27,1.55) both;
                }
                @keyframes typewriter {
                  0% { width: 0; opacity: 0; }
                  10% { opacity: 1; }
                  100% { width: 100%; opacity: 1; }
                }
                .animate-typewriter {
                  display: inline-block;
                  overflow: hidden;
                  white-space: nowrap;
                  border-right: 2px solid #38bdf8;
                  animation: typewriter 1.2s steps(30, end) both;
                }
                @keyframes content-fade-scale {
                  0% { opacity: 0; transform: scale(0.95) translateY(24px); }
                  100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-content-fade-scale {
                  animation: content-fade-scale 1.1s cubic-bezier(0.4,0,0.2,1) both;
                }
              `}</style>
            </section>
            {/* Custom keyframes for hero animations */}
            <style>{`
@keyframes float-slow { 0% { transform: translateY(0px);} 50% { transform: translateY(-24px);} 100% { transform: translateY(0px);} }
@keyframes float-medium { 0% { transform: translateY(0px);} 50% { transform: translateY(-12px);} 100% { transform: translateY(0px);} }
@keyframes float-fast { 0% { transform: translateY(0px);} 50% { transform: translateY(-36px);} 100% { transform: translateY(0px);} }
@keyframes slide-in-left { 0% { opacity: 0; transform: translateX(-60px);} 100% { opacity: 1; transform: translateX(0);} }
@keyframes fade-in-up { 0% { opacity: 0; transform: translateY(40px);} 100% { opacity: 1; transform: translateY(0);} }
@keyframes pop-in { 0% { opacity: 0; transform: scale(0.8);} 100% { opacity: 1; transform: scale(1);} }
.animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
.animate-float-medium { animation: float-medium 4s ease-in-out infinite; }
.animate-float-fast { animation: float-fast 3s ease-in-out infinite; }
.animate-slide-in-left { animation: slide-in-left 1.2s cubic-bezier(0.4,0,0.2,1) both; }
.animate-fade-in-up { animation: fade-in-up 1.2s cubic-bezier(0.4,0,0.2,1) both; }
.animate-pop-in { animation: pop-in 0.8s cubic-bezier(0.4,0,0.2,1) both; }
@keyframes bubble-float1 { 0% { transform: translateY(0) scale(1);} 50% { transform: translateY(-18px) scale(1.08);} 100% { transform: translateY(0) scale(1);} }
@keyframes bubble-float2 { 0% { transform: translateY(0) scale(1);} 50% { transform: translateY(-10px) scale(0.95);} 100% { transform: translateY(0) scale(1);} }
@keyframes bubble-float3 { 0% { transform: translateY(0) scale(1);} 50% { transform: translateY(-30px) scale(1.12);} 100% { transform: translateY(0) scale(1);} }
@keyframes bubble-float4 { 0% { transform: translateY(0) scale(1);} 50% { transform: translateY(-8px) scale(1.05);} 100% { transform: translateY(0) scale(1);} }
.animate-bubble-float1 { animation: bubble-float1 5s ease-in-out infinite; }
.animate-bubble-float2 { animation: bubble-float2 4s ease-in-out infinite; }
.animate-bubble-float3 { animation: bubble-float3 6s ease-in-out infinite; }
.animate-bubble-float4 { animation: bubble-float4 3.5s ease-in-out infinite; }
@keyframes cloud-move { 0% { transform: translateX(0); } 100% { transform: translateX(700px); } }
@keyframes cloud-move2 { 0% { transform: translateX(0); } 100% { transform: translateX(-700px); } }
@keyframes cloud-move3 { 0% { transform: translateX(0); } 100% { transform: translateX(600px); } }
@keyframes cloud-move4 { 0% { transform: translateX(0); } 100% { transform: translateX(-600px); } }
@keyframes cloud-move5 { 0% { transform: translateX(0); } 100% { transform: translateX(500px); } }
.animate-cloud-move { animation: cloud-move 18s linear infinite; }
.animate-cloud-move2 { animation: cloud-move2 22s linear infinite; }
.animate-cloud-move3 { animation: cloud-move3 28s linear infinite; }
.animate-cloud-move4 { animation: cloud-move4 32s linear infinite; }
.animate-cloud-move5 { animation: cloud-move5 36s linear infinite; }
`}</style>

{/*plans sections*/}

<section className="bg-white py-12 px-6">
  <div className="max-w-4xl mx-auto text-center">
    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12 text-sky-800 drop-shadow-lg">
      Choose Your Plan
    </h2>
    <p className="text-blue-500 mb-10 text-sky-800 drop-shadow-lg">
      Unlock your career potential with Dream Society. Join our community with our annual membership plan.
    </p>
    <div className="flex justify-center">
      
      {/* Annual Membership Plan */}
      <div className="bg-white border-2 border-blue-700 rounded-lg shadow-xl p-8 flex flex-col relative hover:shadow-2xl hover:border-blue-800 hover:scale-105 transition-all duration-300 cursor-pointer group max-w-md w-full">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-medium group-hover:from-blue-700 group-hover:to-cyan-600 transition-all duration-300 shadow-lg">
            Recommended
          </span>
        </div>
        <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-800 transition-colors duration-300">Annual Membership</h3>
        <p className="text-5xl font-bold mb-2 group-hover:text-blue-800 transition-colors duration-300">₹500</p>
        <p className="text-lg text-gray-600 mb-6">per year</p>
        
        {/* Features List */}
        <div className="text-left mb-8 space-y-3">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-gray-700">Full access to community network</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-gray-700">Job posting and application features</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-gray-700">Skill development resources</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-gray-700">Mentorship opportunities</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-gray-700">Community events and workshops</span>
          </div>
        </div>
        
        <button 
          onClick={() => {
            localStorage.setItem('selectedPlan', 'annual');
            navigate('/register');
          }}
          className="mt-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg"
        >
          Join Now - ₹500/year
        </button>
      </div>

    </div>
  </div>
</section>


            {/* Preview Section - Jobs & Network */}
            {/* Features Section - Modern Cards */}
            <section className="w-full px-4 md:px-0 bg-[#fff] relative py-8 md:py-16">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12 text-sky-800 drop-shadow-lg">Why Join the platform?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 max-w-6xl mx-auto z-20 relative">
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-sky-100 flex flex-col items-center group hover:scale-105 hover:shadow-2xl transition-transform duration-300">
                  <Globe className="w-10 h-10 md:w-14 md:h-14 text-sky-400 mb-3 md:mb-4 drop-shadow-xl group-hover:scale-110 transition-transform duration-200" />
                  <h3 className="text-lg md:text-xl font-semibold mb-2 text-sky-800 text-center">Social Networking</h3>
                  <p className="text-sky-700 text-center text-sm md:text-base">Connect, follow, and message members. Build your professional and personal network in a safe, vibrant space.</p>
                </div>
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-sky-100 flex flex-col items-center group hover:scale-105 hover:shadow-2xl transition-transform duration-300">
                  <MessageCircle className="w-10 h-10 md:w-14 md:h-14 text-blue-400 mb-3 md:mb-4 drop-shadow-xl group-hover:scale-110 transition-transform duration-200" />
                  <h3 className="text-lg md:text-xl font-semibold mb-2 text-sky-800 text-center">Community Feed</h3>
                  <p className="text-sky-700 text-center text-sm md:text-base">Share updates, post questions, and engage with trending topics. Your voice matters in our interactive feed.</p>
                </div>
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-sky-100 flex flex-col items-center group hover:scale-105 hover:shadow-2xl transition-transform duration-300">
                  <Briefcase className="w-10 h-10 md:w-14 md:h-14 text-blue-500 mb-3 md:mb-4 drop-shadow-xl group-hover:scale-110 transition-transform duration-200" />
                  <h3 className="text-lg md:text-xl font-semibold mb-2 text-sky-800 text-center">Job Postings</h3>
                  <p className="text-sky-700 text-center text-sm md:text-base">Discover curated job opportunities, apply directly, and get noticed by top employers in your field.</p>
                </div>
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-sky-100 flex flex-col items-center group hover:scale-105 hover:shadow-2xl transition-transform duration-300">
                  <Star className="w-10 h-10 md:w-14 md:h-14 text-purple-400 mb-3 md:mb-4 drop-shadow-xl group-hover:scale-110 transition-transform duration-200" />
                  <h3 className="text-lg md:text-xl font-semibold mb-2 text-sky-800 text-center">Skill Growth</h3>
                  <p className="text-sky-700 text-center text-sm md:text-base">Access resources, events, and mentorship to help you grow your skills and career.</p>
                </div>
              </div>
            </section>
            


            <section className="w-full bg-[#d2edf6] py-6 md:py-8 px-4">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-center items-center md:items-start gap-6 md:gap-8 lg:gap-16">
                {/* Resource Pool */}
                <div className="flex flex-col items-center text-center flex-1 min-w-[150px] md:min-w-[180px] animate-card-float-pro">
                  <Book className="w-10 h-10 md:w-12 md:h-12 mb-2 text-black animate-icon-pulse-pro" />
                  <span className="font-bold text-base md:text-lg lg:text-xl mb-1 text-black">Resource Pool</span>
                  <span className="text-gray-700 text-xs md:text-sm lg:text-base">Access tools and support for your growth.</span>
                </div>
                {/* Our Activities */}
                <div className="flex flex-col items-center text-center flex-1 min-w-[150px] md:min-w-[180px] animate-card-float-pro2">
                  <span className="relative mb-2 flex items-center justify-center">
                    <LucideImage className="w-10 h-10 md:w-12 md:h-12 text-black animate-icon-pulse-pro" />
                    <Play className="w-5 h-5 md:w-6 md:h-6 text-black absolute right-0 bottom-0 bg-white rounded-full p-1 border border-gray-300 animate-icon-pulse-pro" />
                  </span>
                  <span className="font-bold text-base md:text-lg lg:text-xl mb-1 text-black">Our Activities</span>
                  <span className="text-gray-700 text-xs md:text-sm lg:text-base">Discover how we make a difference.</span>
                </div>
                {/* Inspiration */}
                <div className="flex flex-col items-center text-center flex-1 min-w-[150px] md:min-w-[180px] animate-card-float-pro3">
                  <Lightbulb className="w-10 h-10 md:w-12 md:h-12 mb-2 text-black animate-icon-pulse-pro" />
                  <span className="font-bold text-base md:text-lg lg:text-xl mb-1 text-black">Inspiration</span>
                  <span className="text-gray-700 text-xs md:text-sm lg:text-base">Ignite your passion for community service.</span>
                </div>
              </div>
              <style>{`
                @keyframes card-float-pro {
                  0% { transform: translateY(0); }
                  50% { transform: translateY(-8px); }
                  100% { transform: translateY(0); }
                }
                .animate-card-float-pro {
                  animation: card-float-pro 8s ease-in-out infinite;
                }
                .animate-card-float-pro2 {
                  animation: card-float-pro 9s ease-in-out infinite;
                  animation-delay: 2s;
                }
                .animate-card-float-pro3 {
                  animation: card-float-pro 10s ease-in-out infinite;
                  animation-delay: 4s;
                }
                @keyframes icon-pulse-pro {
                  0%,100% { transform: scale(1); }
                  50% { transform: scale(1.05); }
                }
                .animate-icon-pulse-pro {
                  animation: icon-pulse-pro 7s ease-in-out infinite;
                }
              `}</style>
            </section>
            {/* How It Works Section - Clean Modern Style */}
            <section className="w-full px-4 md:px-0 bg-white animate-fade-in-up pt-8 md:pt-12 pb-8 md:pb-12" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-10 text-sky-800 drop-shadow-lg">How It Works</h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 max-w-5xl mx-auto">
                <div className="flex flex-col items-center">
                  <div className="bg-sky-300 text-white rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-2xl md:text-3xl font-bold border-4 border-white/30 shadow-2xl mb-3 md:mb-4 animate-float">1</div>
                  <h3 className="text-base md:text-lg font-semibold mb-2 text-sky-800 text-center">Create Your Profile</h3>
                  <p className="text-sky-700 text-center text-sm md:text-base">Sign up and build a profile that showcases your skills and experience.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-blue-300 text-white rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-2xl md:text-3xl font-bold border-4 border-white/30 shadow-2xl mb-3 md:mb-4 animate-float">2</div>
                  <h3 className="text-base md:text-lg font-semibold mb-2 text-sky-800 text-center">Engage in the Community</h3>
                  <p className="text-sky-700 text-center text-sm md:text-base">Share updates, join discussions, and connect with others in the live feed.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-sky-400 text-white rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-2xl md:text-3xl font-bold border-4 border-white/30 shadow-2xl mb-3 md:mb-4 animate-float">3</div>
                  <h3 className="text-base md:text-lg font-semibold mb-2 text-sky-800 text-center">Find Opportunities</h3>
                  <p className="text-sky-700 text-center text-sm md:text-base">Apply to jobs and get noticed by top employers in your field.</p>
                </div>
              </div>
              <div className="flex justify-center mt-8 md:mt-10">
              <Link to="/register"><Button size="lg" className="bg-gradient-to-r from-sky-400 via-blue-400 to-sky-600 text-white shadow-xl px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold animate-gradient-x">Register Now</Button></Link>
              </div>
            </section>
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
          </main>
        </div>
      </div>
      <style>{`
/* Removed all animation keyframes and animation classes */
`}</style>
    </>
  );
};

export default WelcomeScreen;
