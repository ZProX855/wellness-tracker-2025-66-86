
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
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
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Logo />
          
          <div className="flex items-center">
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
                  <span className="hidden md:inline">{user.name}</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="py-2">
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-wellness-charcoal hover:bg-wellness-softGreen/20 hover:text-wellness-darkGreen">
                      Dashboard
                    </Link>
                    <Link to="/dashboard/profile" className="block px-4 py-2 text-sm text-wellness-charcoal hover:bg-wellness-softGreen/20 hover:text-wellness-darkGreen">
                      Profile Settings
                    </Link>
                    <button 
                      onClick={handleLogout}
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
