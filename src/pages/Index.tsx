
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
  const [forceRender, setForceRender] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    // Force re-render if canvas isn't detected
    const renderInterval = setInterval(() => {
      if (!document.querySelector('canvas.p5Canvas')) {
        console.log("No canvas found, forcing re-render");
        setForceRender(prev => prev + 1);
      }
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(renderInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen text-wellness-dark relative overflow-hidden">
      <CyberBackground 
        scrollY={scrollY} 
        key={`cyber-bg-${isVisible ? 'visible' : 'hidden'}-${forceRender}`}
      />
      
      <div className="relative z-10">
        <Header />
        
        <main className="pt-24 pb-16">
          <HeroSection scrollY={scrollY} />
          <ToolsSection />
          <BenefitsSection />
          <CallToAction />
        </main>
        
        <footer className="border-t border-wellness-softGreen/30 bg-white/80 backdrop-blur-sm">
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
