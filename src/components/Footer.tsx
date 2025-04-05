import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowUp, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  return <footer className="py-12 text-wellness-charcoal relative overflow-hidden bg-transparent">
      <div className="container mx-auto px-4">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Section */}
          <div className="px-[20px] mx-[6px]">
            <Logo className="h-8 w-auto mb-4" />
            <p className="text-wellness-charcoal mb-4 text-sm leading-relaxed">
              Your personal health companion designed to help you achieve wellness goals through intuitive tracking and AI-powered insights.
            </p>
            <div className="flex items-center text-wellness-charcoal/80 text-sm">
              <span>Made with</span> 
              <Heart size={14} className="mx-1 text-wellness-mediumGreen" fill="#8FC0A9" /> 
              <span>by Scientists &amp; Coaches</span>
            </div>
          </div>

          {/* Features Section */}
          <div className="px-[103px]">
            <h3 className="font-semibold text-wellness-darkGreen mb-4 text-lg">Features</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/food-compare" className="text-wellness-charcoal hover:text-wellness-darkGreen transition-colors">Food Compare</Link></li>
              <li><Link to="/bmi-calculator" className="text-wellness-charcoal hover:text-wellness-darkGreen transition-colors">BMI Calculator</Link></li>
              <li><Link to="/meal-recognition" className="text-wellness-charcoal hover:text-wellness-darkGreen transition-colors">Meal Recognition</Link></li>
              <li><Link to="/chat-assistant" className="text-wellness-charcoal hover:text-wellness-darkGreen transition-colors">AI Assistant</Link></li>
            </ul>
          </div>

          {/* Community Section */}
          <div className="px-[52px]">
            <h3 className="font-semibold text-wellness-darkGreen mb-4 text-lg">Community</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-wellness-charcoal hover:text-wellness-darkGreen transition-colors">GitHub</a></li>
              <li><a href="#" className="text-wellness-charcoal hover:text-wellness-darkGreen transition-colors">Success Stories</a></li>
              <li><a href="#" className="text-wellness-charcoal hover:text-wellness-darkGreen transition-colors">Team</a></li>
              <li><a href="#" className="text-wellness-charcoal hover:text-wellness-darkGreen transition-colors">Forums</a></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="font-semibold text-wellness-darkGreen mb-4 text-lg">Contact & Help</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-wellness-mediumGreen" />
                <a href="mailto:wellnesstracker@gmail.com" className="text-wellness-charcoal hover:text-wellness-darkGreen transition-colors">
                  wellnesstracker@gmail.com
                </a>
              </li>
              <li><a href="#" className="text-wellness-charcoal hover:text-wellness-darkGreen transition-colors">Support</a></li>
              <li><a href="#" className="text-wellness-charcoal hover:text-wellness-darkGreen transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-wellness-charcoal hover:text-wellness-darkGreen transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Back to Top */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-wellness-darkGreen/10 px-0">
          <div className="text-wellness-charcoal/70 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Wellness Tracker Inc. All rights reserved.
          </div>
          
          <Button onClick={scrollToTop} size="sm" variant="outline" className="p-2 rounded-full hover:bg-wellness-mediumGreen/20 border-wellness-mediumGreen">
            <ArrowUp size={16} className="text-wellness-darkGreen" />
          </Button>
        </div>
      </div>
    </footer>;
};
export default Footer;