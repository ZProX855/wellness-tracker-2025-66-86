import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { Menu, X } from 'lucide-react';
const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navItems = [{
    name: 'Home',
    path: '/'
  }, {
    name: 'AI Assistant',
    path: '/chat-assistant'
  }, {
    name: 'Food Compare',
    path: '/food-compare'
  }, {
    name: 'BMI Calculator',
    path: '/bmi-calculator'
  }, {
    name: 'Meal Recognition',
    path: '/meal-recognition'
  }, {
    name: 'Wellness Journey',
    path: '/wellness-journey'
  }];
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Logo />
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(item => {})}
          </nav>
          
          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-wellness-darkGreen md:hidden focus:outline-none">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && <div className="md:hidden h-screen bg-white/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map(item => <Link key={item.path} to={item.path} className={`px-4 py-3 text-xl transition-colors duration-300 rounded-lg ${location.pathname === item.path ? 'bg-wellness-softGreen text-wellness-darkGreen font-medium' : 'text-wellness-charcoal hover:bg-wellness-softGreen/50'}`}>
                  {item.name}
                </Link>)}
            </nav>
          </div>
        </div>}
    </header>;
};
export default Header;