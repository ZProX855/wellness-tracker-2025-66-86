
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Header from '@/components/Header';
import RoutineBuilder from '@/components/routine/RoutineBuilder';
import RoutineList from '@/components/routine/RoutineList';
import RoutineProgress from '@/components/routine/RoutineProgress';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { Shield, ClipboardCheck } from 'lucide-react';

const RoutineTracker = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("build");

  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-softBeige to-wellness-softGreen/30">
      <Header />
      <Toaster />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-rose-100 to-rose-200 flex items-center justify-center">
                <ClipboardCheck className="h-8 w-8 text-wellness-darkGreen" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-medium text-wellness-darkGreen mb-2">
              Ultimate Daily Routine Tracker
            </h1>
            <p className="text-wellness-charcoal/70 max-w-2xl mx-auto">
              Create fully customizable routines, track your progress, and achieve your goals consistently.
            </p>
          </div>
          
          {!user ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-wellness-darkGreen/30" />
              <h2 className="text-xl font-medium text-wellness-darkGreen mb-2">Sign in to use this feature</h2>
              <p className="mb-6 text-wellness-charcoal/70">
                You need to be logged in to create and track your routines.
              </p>
              <button 
                onClick={() => navigate('/login', { state: { from: '/routine-tracker' } })}
                className="px-6 py-2 bg-wellness-mediumGreen text-white rounded-full hover:bg-wellness-darkGreen transition-colors"
              >
                Sign In
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <Tabs defaultValue="build" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 pt-4 bg-wellness-softGreen/30 border-b border-wellness-softGreen">
                  <TabsList className="bg-wellness-softBeige/50 p-1">
                    <TabsTrigger value="build" className="data-[state=active]:bg-white data-[state=active]:text-wellness-darkGreen">
                      Create Routine
                    </TabsTrigger>
                    <TabsTrigger value="routines" className="data-[state=active]:bg-white data-[state=active]:text-wellness-darkGreen">
                      My Routines
                    </TabsTrigger>
                    <TabsTrigger value="progress" className="data-[state=active]:bg-white data-[state=active]:text-wellness-darkGreen">
                      Progress Tracker
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="p-6">
                  <TabsContent value="build" className="mt-0">
                    <RoutineBuilder />
                  </TabsContent>
                  
                  <TabsContent value="routines" className="mt-0">
                    <RoutineList setActiveTab={setActiveTab} />
                  </TabsContent>
                  
                  <TabsContent value="progress" className="mt-0">
                    <RoutineProgress />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RoutineTracker;
