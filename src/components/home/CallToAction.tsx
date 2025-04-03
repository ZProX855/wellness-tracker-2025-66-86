import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
const CallToAction: React.FC = () => {
  const navigate = useNavigate();
  return <section className="px-4 text-center relative overflow-hidden sm:px-0 py-0 my-[58px]">
      <div style={{
      backgroundImage: "url('/lovable-uploads/0f3b37c0-5eca-43f3-9f19-60f760335d8d.png')",
      backgroundSize: "30%",
      backgroundPosition: "center",
      filter: "blur(60px)"
    }} className="absolute inset-0 z-0 opacity-20 bg-[#fcfbf4] py-0 my-[69px]"></div>
      
      
    </section>;
};
export default CallToAction;