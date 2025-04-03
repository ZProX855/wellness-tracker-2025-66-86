
import React, { useEffect, useState, useRef } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/home/HeroSection';
import ToolsSection from '../components/home/ToolsSection';
import BenefitsSection from '../components/home/BenefitsSection';
import CallToAction from '../components/home/CallToAction';
import CyberBackground from '../components/home/CyberBackground';
import Footer from '../components/Footer';

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [forceRender, setForceRender] = useState(0);
  const backgroundContainerRef = useRef<HTMLDivElement>(null);

  // Use effect for initial animations and scroll handling
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Effect to check if canvas exists and force re-renders if needed
  useEffect(() => {
    // Check if canvas element exists after component mount
    let checkInterval = setInterval(() => {
      const canvas = document.getElementById('defaultCanvas0');
      if (!canvas) {
        console.log('Canvas not found, forcing re-render');
        setForceRender(prev => prev + 1);
      } else {
        console.log('Canvas found, clearing interval');
        clearInterval(checkInterval);
      }
    }, 2000);

    // Clear interval after 5 checks (10 seconds) to avoid infinite re-renders
    setTimeout(() => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    }, 10000);

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, []);

  return (
    <div className="min-h-screen text-wellness-dark relative">
      <div ref={backgroundContainerRef} className="background-container">
        <CyberBackground key={`cyber-background-${forceRender}`} />
      </div>
      
      <div className="relative z-10">
        <Header />
        
        <main className="pt-24 pb-0">
          <HeroSection scrollY={scrollY} />
          <ToolsSection />
          <BenefitsSection />
          <CallToAction />
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Index;
