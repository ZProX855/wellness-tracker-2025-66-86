
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
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen text-wellness-dark relative">
      <CyberBackground />
      
      <div className="relative z-10">
        <Header />
        
        <main className="pt-24 pb-16 py-0">
          <HeroSection scrollY={scrollY} />
          <ToolsSection />
          <BenefitsSection />
          <CallToAction />
        </main>
        
        <footer className="border-t border-wellness-softGreen/30 my-0 py-0 bg-white/80 backdrop-blur-sm">
          
        </footer>
      </div>
    </div>
  );
};

export default Index;
