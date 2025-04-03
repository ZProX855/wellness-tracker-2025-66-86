import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
const CallToAction: React.FC = () => {
  const navigate = useNavigate();
  return <section className="px-4 py-16 sm:py-24 text-center relative overflow-hidden sm:px-6 lg:px-8">
      {/* Background gradient blur effect */}
      <div style={{
      backgroundImage: "url('/lovable-uploads/0f3b37c0-5eca-43f3-9f19-60f760335d8d.png')",
      backgroundSize: "40%",
      backgroundPosition: "center",
      filter: "blur(60px)"
    }} className="absolute inset-0 z-0 opacity-20 bg-[#fcfbf4]" aria-hidden="true" />
      
      
    </section>;
};
export default CallToAction;