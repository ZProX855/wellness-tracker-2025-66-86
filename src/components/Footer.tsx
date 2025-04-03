
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowUp, Mail, Instagram, Linkedin, Twitter, GitHub, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="py-12 bg-wellness-darkGreen text-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Top Heading */}
        <div className="text-center mb-10">
          <h2 className="text-xl font-bold tracking-wider text-amber-300">THE WELLNESS JOURNEY STARTS WITH HEALTHY HABITS</h2>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
          {/* Get Started Section */}
          <div className="md:w-1/3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-wellness-softGreen rounded-sm"></div>
              <h3 className="font-semibold text-wellness-softBeige">Get Started Today</h3>
            </div>
            <p className="text-wellness-softBeige/80 mb-4">
              Wellness Tracker is your personal health companion, designed to help you achieve your wellness goals through intuitive tracking and AI-powered insights.
            </p>
            <div className="flex items-center text-wellness-softBeige/80 text-sm">
              <span>Made with</span> 
              <Heart size={14} className="mx-1 text-wellness-softGreen" fill="#68A688" /> 
              <span>and</span>
              <span className="mx-1 text-wellness-softGreen">🥗</span>
              <span>in Health Valley, California</span>
            </div>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="font-semibold text-wellness-softBeige mb-4">Features</h3>
            <ul className="space-y-2">
              <li><Link to="/food-compare" className="text-wellness-softBeige/80 hover:text-wellness-softGreen transition-colors">Food Compare</Link></li>
              <li><Link to="/bmi-calculator" className="text-wellness-softBeige/80 hover:text-wellness-softGreen transition-colors">BMI Calculator</Link></li>
              <li><Link to="/meal-recognition" className="text-wellness-softBeige/80 hover:text-wellness-softGreen transition-colors">Meal Recognition</Link></li>
              <li><Link to="/timetable-generator" className="text-wellness-softBeige/80 hover:text-wellness-softGreen transition-colors">Timetable</Link></li>
              <li><Link to="/chat-assistant" className="text-wellness-softBeige/80 hover:text-wellness-softGreen transition-colors">AI Assistant</Link></li>
            </ul>
          </div>

          {/* Community Section */}
          <div>
            <h3 className="font-semibold text-wellness-softBeige mb-4">Community</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-wellness-softBeige/80 hover:text-wellness-softGreen transition-colors">GitHub</a></li>
              <li><a href="#" className="text-wellness-softBeige/80 hover:text-wellness-softGreen transition-colors">YouTube</a></li>
              <li><a href="#" className="text-wellness-softBeige/80 hover:text-wellness-softGreen transition-colors">Forums</a></li>
              <li><a href="#" className="text-wellness-softBeige/80 hover:text-wellness-softGreen transition-colors">Success Stories</a></li>
              <li><a href="#" className="text-wellness-softBeige/80 hover:text-wellness-softGreen transition-colors">Team</a></li>
            </ul>
          </div>

          {/* Help Section */}
          <div>
            <h3 className="font-semibold text-wellness-softBeige mb-4">Help</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-wellness-softBeige/80 hover:text-wellness-softGreen transition-colors">Support</a></li>
              <li><a href="#" className="text-wellness-softBeige/80 hover:text-wellness-softGreen transition-colors">Troubleshooting</a></li>
              <li><a href="#" className="text-wellness-softBeige/80 hover:text-wellness-softGreen transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-wellness-softBeige/80 hover:text-wellness-softGreen transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-wellness-softBeige/80 hover:text-wellness-softGreen transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Links & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-wellness-softBeige/20">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Link to="/" className="flex items-center gap-2">
              <Logo className="h-8 w-auto brightness-150" />
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <a href="#" className="text-wellness-softBeige/80 hover:text-wellness-softGreen text-sm">License</a>
            <a href="#" className="text-wellness-softBeige/80 hover:text-wellness-softGreen text-sm">Terms of Service</a>
            <a href="#" className="text-wellness-softBeige/80 hover:text-wellness-softGreen text-sm">Privacy Policy</a>
            <a href="#" className="text-wellness-softBeige/80 hover:text-wellness-softGreen text-sm">Cookie Settings</a>
            <Button 
              onClick={scrollToTop} 
              size="sm" 
              variant="outline" 
              className="p-2 rounded-full hover:bg-wellness-softGreen/20 border-wellness-softGreen"
            >
              <ArrowUp size={16} className="text-wellness-softGreen" />
            </Button>
          </div>

          <div className="text-wellness-softBeige/70 text-sm mt-4 md:mt-0">
            © {new Date().getFullYear()} Wellness Tracker Inc.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
