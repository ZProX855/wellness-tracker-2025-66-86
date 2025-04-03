
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowUp, Mail, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="py-8 relative overflow-hidden backdrop-blur-sm">
      {/* Transparent overlay */}
      <div className="absolute inset-0 bg-wellness-softBeige/30 -z-10" />
      
      <div className="container-lg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Tagline */}
          <div className="text-center md:text-left">
            <h3 className="font-medium text-wellness-darkGreen text-2xl">NutriWell</h3>
            <p className="text-sm text-wellness-charcoal/70 mt-1">Your wellness journey starts here</p>
          </div>
          
          {/* Quick Links - Minimal */}
          <div className="flex gap-6 text-sm">
            <Link to="/" className="text-wellness-charcoal hover:text-wellness-darkGreen transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className="text-wellness-charcoal hover:text-wellness-darkGreen transition-colors">
              Dashboard
            </Link>
            <a href="#about" className="text-wellness-charcoal hover:text-wellness-darkGreen transition-colors">
              About
            </a>
          </div>
          
          {/* Social & Scroll to top */}
          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center bg-wellness-softGreen hover:bg-wellness-mediumGreen/20 transition-colors">
                <Mail size={16} className="text-wellness-darkGreen" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center bg-wellness-softGreen hover:bg-wellness-mediumGreen/20 transition-colors">
                <Instagram size={16} className="text-wellness-darkGreen" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center bg-wellness-softGreen hover:bg-wellness-mediumGreen/20 transition-colors">
                <Linkedin size={16} className="text-wellness-darkGreen" />
              </a>
            </div>
            
            <Button 
              onClick={scrollToTop} 
              size="sm" 
              variant="ghost" 
              className="p-2 ml-2 rounded-full hover:bg-wellness-softGreen/50"
            >
              <ArrowUp size={18} className="text-wellness-darkGreen" />
            </Button>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-wellness-softGreen/30 flex justify-center text-xs text-wellness-charcoal/50">
          <div className="flex items-center">
            <span>Made with</span> 
            <Heart size={12} className="mx-1 text-wellness-darkGreen" fill="#68A688" /> 
            <span>© {new Date().getFullYear()} NutriWell</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
