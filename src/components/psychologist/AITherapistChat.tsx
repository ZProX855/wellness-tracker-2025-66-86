
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, MessageSquare, Mic, MicOff, Settings2, VolumeX, Volume2, PanelBottomClose } from 'lucide-react';
import { ConversationMessage, TherapistPersonality } from '@/types/psychologist';
import { useElevenLabsConversation } from '@/hooks/useElevenLabsConversation';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import TherapistSelector from './TherapistSelector';
import MoodTracker from './MoodTracker';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceStatus from './VoiceStatus';
import { useToast } from '@/hooks/use-toast';

const AITherapistChat: React.FC = () => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistPersonality>({
    id: '1',
    name: 'Dr. Sarah',
    style: 'supportive',
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah voice ID
    description: 'Warm, empathetic, and supportive. Dr. Sarah creates a safe space for sharing.',
    introMessage: "Hi there, I'm Dr. Sarah. How are you feeling today? I'm here to listen and support you."
  });
  const [isSoundOn, setIsSoundOn] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize ElevenLabs conversation
  const conversation = useElevenLabsConversation({
    onMessage: (message) => {
      if (message.type === 'assistant_response') {
        addMessage('assistant', message.content);
      }
    },
    onError: (error) => {
      toast({
        title: 'Conversation Error',
        description: 'There was an issue with the voice conversation. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Initialize speech recognition
  const { isActive, transcript, startRecognition, stopRecognition } = useSpeechRecognition({
    onTranscript: (text) => {
      if (text.trim()) {
        setInput(text.trim());
      }
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add initial message from therapist
  useEffect(() => {
    if (messages.length === 0) {
      addMessage('assistant', selectedTherapist.introMessage);
    }
  }, [selectedTherapist]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: ConversationMessage = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    addMessage('user', input);
    
    try {
      // Send to ElevenLabs
      await conversation.sendTextInput(input);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    }
    
    setInput('');
  };

  const toggleVoiceInput = () => {
    if (isActive) {
      stopRecognition();
    } else {
      startRecognition();
      toast({
        title: 'Voice Input Activated',
        description: 'Speak clearly and I\'ll transcribe your message.',
      });
    }
  };

  const toggleSound = () => {
    setIsSoundOn(!isSoundOn);
    if (isSoundOn) {
      conversation.setVolume({ volume: 0 });
      toast({
        title: 'Sound Off',
        description: 'Voice responses are now muted.'
      });
    } else {
      conversation.setVolume({ volume: 1 });
      toast({
        title: 'Sound On',
        description: 'Voice responses are now audible.'
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Start conversation with ElevenLabs when component mounts
  useEffect(() => {
    const startConvo = async () => {
      try {
        const ELEVENLABS_AGENT_ID = "PBIwiIwBWi1HsMvF0Llj"; // Default agent
        await conversation.startSession({ 
          agentId: ELEVENLABS_AGENT_ID,
          overrides: {
            tts: {
              voiceId: selectedTherapist.voiceId
            }
          }
        });
        toast({
          title: "Connected",
          description: "Your AI therapist is ready to talk."
        });
      } catch (error) {
        console.error("Failed to start conversation:", error);
        toast({
          title: "Connection Error",
          description: "Could not connect to the AI therapist. Please try again.",
          variant: "destructive"
        });
      }
    };

    startConvo();

    return () => {
      conversation.endSession();
    };
  }, [selectedTherapist]);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
      <Tabs defaultValue="chat" className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSound}
              title={isSoundOn ? "Mute" : "Unmute"}
            >
              {isSoundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowMoodTracker(!showMoodTracker)}
              title="Track Mood"
            >
              <PanelBottomClose className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <TabsContent value="chat" className="flex-1 flex flex-col space-y-4 h-full">
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="mb-4">
                  <CardContent className="pt-6">
                    <TherapistSelector 
                      selectedTherapist={selectedTherapist}
                      onSelect={setSelectedTherapist}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {showMoodTracker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="mb-4">
                  <CardContent className="pt-6">
                    <MoodTracker />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="flex-1 overflow-y-auto pt-6 pb-4 px-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-xl px-4 py-2 ${
                        message.role === 'assistant' 
                          ? 'bg-wellness-softGreen/20 text-wellness-darkGreen' 
                          : 'bg-wellness-darkGreen text-white'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            
            <div className="p-4 border-t border-wellness-softGreen/30">
              <div className="flex gap-2">
                <Button
                  variant={isActive ? "default" : "outline"}
                  size="icon"
                  onClick={toggleVoiceInput}
                  className={isActive ? "bg-wellness-darkGreen" : ""}
                >
                  {isActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message here..."
                  className="flex-1 min-h-[50px] max-h-[150px] resize-none"
                />
                
                <Button onClick={handleSendMessage}>
                  Send
                </Button>
              </div>
              
              {conversation.isSpeaking && <VoiceStatus />}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights" className="flex-1">
          <Card className="h-full overflow-y-auto">
            <CardContent className="pt-6">
              <h3 className="text-xl font-medium text-wellness-darkGreen mb-4">Insights & Progress</h3>
              <p className="text-wellness-charcoal/70 mb-6">
                Continue your conversations to generate personalized insights and mental wellness trends.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium text-wellness-darkGreen mb-2">Mood Tracking</h4>
                    <p className="text-sm text-wellness-charcoal/70">
                      Your mood trends will appear here as you use the application.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium text-wellness-darkGreen mb-2">Common Themes</h4>
                    <p className="text-sm text-wellness-charcoal/70">
                      Topics and themes from your conversations will be analyzed and displayed here.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium text-wellness-darkGreen mb-2">Coping Strategies</h4>
                    <p className="text-sm text-wellness-charcoal/70">
                      Personalized coping strategies will be suggested based on your conversations.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium text-wellness-darkGreen mb-2">Progress Timeline</h4>
                    <p className="text-sm text-wellness-charcoal/70">
                      Your mental wellness journey will be visualized here over time.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AITherapistChat;
