
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Github, Twitter, Linkedin, ExternalLink, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Chat Assistant', path: '/chat-assistant' },
    { name: 'BMI Calculator', path: '/bmi-calculator' },
    { name: 'Food Compare', path: '/food-compare' },
  ];

  const toolLinks = [
    { name: 'Meal Recognition', path: '/meal-recognition' },
    { name: 'Sleep Tracker', path: '/sleep-tracker' },
    { name: 'Timetable Generator', path: '/timetable-generator' },
    { name: 'AI Psychologist', path: '/ai-psychologist' },
  ];

  return (
    <footer className="w-full bg-white/80 backdrop-blur-sm border-t border-wellness-softGreen/30 pt-12 pb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About column */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-xl font-medium text-wellness-darkGreen">About Us</h3>
            <p className="text-sm text-wellness-charcoal/80">
              We provide personalized wellness solutions powered by AI to help you achieve your health and wellness goals.
            </p>
            <div className="flex items-center space-x-4">
              <Button size="icon" variant="ghost" className="rounded-full hover:bg-wellness-softGreen/20">
                <Twitter className="h-5 w-5 text-wellness-darkGreen" />
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full hover:bg-wellness-softGreen/20">
                <Linkedin className="h-5 w-5 text-wellness-darkGreen" />
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full hover:bg-wellness-softGreen/20">
                <Github className="h-5 w-5 text-wellness-darkGreen" />
              </Button>
            </div>
          </div>

          {/* Quick Links column */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-xl font-medium text-wellness-darkGreen">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-sm text-wellness-charcoal/80 hover:text-wellness-darkGreen transition-colors duration-200 flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools column */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-xl font-medium text-wellness-darkGreen">Our Tools</h3>
            <ul className="space-y-2">
              {toolLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-sm text-wellness-charcoal/80 hover:text-wellness-darkGreen transition-colors duration-200 flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter column */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-xl font-medium text-wellness-darkGreen">Get In Touch</h3>
            <p className="text-sm text-wellness-charcoal/80">
              Have questions or feedback? Reach out to us!
            </p>
            <Link to="/chat-assistant">
              <Button variant="outline" className="w-full bg-wellness-softGreen/20 border-wellness-mediumGreen hover:bg-wellness-softGreen">
                <Mail className="mr-2 h-4 w-4" />
                Contact Us
              </Button>
            </Link>
            <Button 
              onClick={scrollToTop} 
              variant="ghost" 
              className="mt-4 w-full flex items-center justify-center hover:bg-wellness-softGreen/20 text-wellness-darkGreen"
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Back to top
            </Button>
          </div>
        </div>
        
        <Separator className="my-6 bg-wellness-softGreen/30" />
        
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-wellness-charcoal/60">
          <div className="flex items-center">
            <span className="text-sm">© {new Date().getFullYear()} Wellness AI. All rights reserved.</span>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <span className="flex items-center">
              Made with <Heart className="h-4 w-4 mx-1 text-red-400" /> for a healthier life
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
