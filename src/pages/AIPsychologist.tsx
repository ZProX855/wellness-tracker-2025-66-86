
import React, { useState } from 'react';
import Header from '../components/Header';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AITherapistChat from '../components/psychologist/AITherapistChat';
import VoiceTherapist from '../components/psychologist/VoiceTherapist';

const AIPsychologist: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("chat");

  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-softBeige to-wellness-softGreen/30">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-wellness-darkGreen hover:text-wellness-mediumGreen transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-medium text-wellness-darkGreen mt-4 mb-2">AI Psychologist</h1>
            <p className="text-wellness-charcoal">Talk to our AI therapist about mental wellness, emotions, and personal growth.</p>
          </div>
          
          <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="chat" className="text-base">Chat Mode</TabsTrigger>
              <TabsTrigger value="voice" className="text-base">Voice Mode</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="mt-0">
              <AITherapistChat />
            </TabsContent>
            
            <TabsContent value="voice" className="mt-0">
              <VoiceTherapist />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AIPsychologist;
