
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const navItems = [
    {
      name: 'Home',
      path: '/'
    }, 
    {
      name: 'AI Assistant',
      path: '/ai-assistant'
    }, 
    {
      name: 'Food Compare',
      path: '/nutrition/compare'
    }, 
    {
      name: 'BMI Calculator',
      path: '/tools/bmi-calculator'
    }, 
    {
      name: 'Meal Analyzer',
      path: '/nutrition/meal-analyzer'
    }, 
    {
      name: 'Wellness Journey',
      path: '/wellness-journey'
    },
    {
      name: 'Sleep Tracker',
      path: '/tracker/sleep'
    }
  ];
  
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
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Logo />
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.path 
                    ? 'text-wellness-darkGreen' 
                    : 'text-wellness-charcoal hover:text-wellness-darkGreen'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-sm font-medium text-wellness-darkGreen">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full border-2 border-wellness-softGreen"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-wellness-softGreen flex items-center justify-center text-wellness-darkGreen">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span>{user.name}</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="py-2">
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-wellness-charcoal hover:bg-wellness-softGreen/20 hover:text-wellness-darkGreen">
                      Dashboard
                    </Link>
                    <Link to="/profile/settings" className="block px-4 py-2 text-sm text-wellness-charcoal hover:bg-wellness-softGreen/20 hover:text-wellness-darkGreen">
                      Profile Settings
                    </Link>
                    <button 
                      onClick={() => logout()}
                      className="block w-full text-left px-4 py-2 text-sm text-wellness-charcoal hover:bg-wellness-softGreen/20 hover:text-wellness-darkGreen"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center bg-wellness-softGreen hover:bg-wellness-mediumGreen text-wellness-darkGreen px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            {user && (
              <Link to="/dashboard" className="mr-4">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full border-2 border-wellness-softGreen"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-wellness-softGreen flex items-center justify-center text-wellness-darkGreen">
                    {user.name.charAt(0)}
                  </div>
                )}
              </Link>
            )}
            
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-wellness-darkGreen focus:outline-none">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden h-screen bg-white/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map(item => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`px-4 py-3 text-xl transition-colors duration-300 rounded-lg ${
                    location.pathname === item.path 
                      ? 'bg-wellness-softGreen text-wellness-darkGreen font-medium' 
                      : 'text-wellness-charcoal hover:bg-wellness-softGreen/50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="px-4 py-3 text-xl transition-colors duration-300 rounded-lg text-wellness-charcoal hover:bg-wellness-softGreen/50"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/profile/settings" 
                    className="px-4 py-3 text-xl transition-colors duration-300 rounded-lg text-wellness-charcoal hover:bg-wellness-softGreen/50"
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="px-4 py-3 text-xl transition-colors duration-300 rounded-lg text-wellness-charcoal hover:bg-wellness-softGreen/50 text-left"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="px-4 py-3 text-xl transition-colors duration-300 rounded-lg bg-wellness-softGreen text-wellness-darkGreen font-medium"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
