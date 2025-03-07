
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/home/HeroSection';
import ToolsSection from '../components/home/ToolsSection';
import BenefitsSection from '../components/home/BenefitsSection';
import CallToAction from '../components/home/CallToAction';
import CyberBackground from '../components/home/CyberBackground';

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    const handleScroll = () => {
      setScrollY(window.scrollY);
      // Debug scroll position
      console.log("Scroll position:", window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Trigger initial scroll handler to set initial value
    handleScroll();
    
    console.log("Index component mounted");
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Force a render of the background component
  useEffect(() => {
    console.log("Forcing background render with scrollY:", scrollY);
  }, [scrollY]);

  return (
    <div className="min-h-screen text-wellness-dark relative overflow-x-hidden">
      {/* The CyberBackground is rendered with a key to force re-render when needed */}
      <CyberBackground scrollY={scrollY} key={`cyber-bg-${isVisible ? 'visible' : 'hidden'}`} />
      
      <div className="relative z-10">
        <Header />
        
        <main className="pt-24 pb-16 py-0">
          <HeroSection scrollY={scrollY} />
          <ToolsSection />
          <BenefitsSection />
          <CallToAction />
        </main>
        
        <footer className="border-t border-wellness-softGreen/30 my-0 py-0 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <p className="text-center text-wellness-charcoal/70">
              © {new Date().getFullYear()} WellnessHub. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
