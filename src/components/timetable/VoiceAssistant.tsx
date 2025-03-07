import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from '@11labs/react';

// ElevenLabs Agent ID and API key
const ELEVENLABS_AGENT_ID = "PBIwiIwBWi1HsMvF0Llj";
const DEFAULT_ELEVENLABS_API_KEY = "sk_c12587e6581cef5f4f275b7a6d1e4acd591bee7c5a13465b";

interface VoiceAssistantProps {
  isConversationActive: boolean;
  setIsConversationActive: (active: boolean) => void;
  onConversationComplete: () => void;
  onResponses: (question: string, answer: string) => void;
  onSetConversationId: (id: string) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  isConversationActive,
  setIsConversationActive,
  onConversationComplete,
  onResponses,
  onSetConversationId
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLocalSpeechRecognitionActive, setIsLocalSpeechRecognitionActive] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const latestTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        
        setTranscript(prev => [...prev, latestTranscript]);
        console.log("Local speech recognition transcript:", latestTranscript);
        
        const updatedTranscript = [...transcript, latestTranscript];
        localStorage.setItem('lastConversationTranscript', JSON.stringify(updatedTranscript));
        
        window.dispatchEvent(new CustomEvent('speechTranscript', { 
          detail: { transcript: latestTranscript } 
        }));
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };
    } else {
      console.warn("Speech Recognition API is not supported in this browser");
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcript]);

  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Message received:", message);
      
      if (message.type === 'agent' && message.content) {
        let formattedQuestion = message.content;
        
        if (!formattedQuestion.includes('👋') && !formattedQuestion.includes('😊')) {
          if (formattedQuestion.toLowerCase().includes('hello') || 
              formattedQuestion.toLowerCase().includes('hi') || 
              formattedQuestion.toLowerCase().includes('welcome')) {
            formattedQuestion = `👋 ${formattedQuestion}`;
          }
          else if (formattedQuestion.toLowerCase().includes('thank')) {
            formattedQuestion = `😊 ${formattedQuestion}`;
          }
        }
        
        onResponses(formattedQuestion, '');
        
        setTranscript(prev => {
          const updatedTranscript = [...prev, `Agent: ${formattedQuestion}`];
          localStorage.setItem('lastConversationTranscript', JSON.stringify(updatedTranscript));
          return updatedTranscript;
        });
      } else if (message.type === 'user_message' && message.content) {
        onResponses('', message.content);
        
        setTranscript(prev => {
          const updatedTranscript = [...prev, `User: ${message.content}`];
          localStorage.setItem('lastConversationTranscript', JSON.stringify(updatedTranscript));
          return updatedTranscript;
        });
      } else if (message.type === 'end_of_conversation') {
        setIsConversationActive(false);
        
        localStorage.setItem('lastConversationTranscript', JSON.stringify(transcript));
        
        window.dispatchEvent(new CustomEvent('conversationTranscript', { 
          detail: { transcript: transcript } 
        }));
        
        onConversationComplete();
        
        if (isLocalSpeechRecognitionActive) {
          stopLocalSpeechRecognition();
        }
        
        toast({
          title: "✨ Conversation Completed!",
          description: "Creating your personalized timetable now...",
        });
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      toast({
        title: "Error",
        description: "There was a problem with the conversation. Please try again.",
        variant: "destructive"
      });
      setIsConversationActive(false);
      
      if (isLocalSpeechRecognitionActive) {
        stopLocalSpeechRecognition();
      }
    }
  });

  useEffect(() => {
    window.localStorage.setItem('xi-api-key', DEFAULT_ELEVENLABS_API_KEY);
  }, []);

  const startLocalSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsLocalSpeechRecognitionActive(true);
        console.log("Local speech recognition started");
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    }
  };

  const stopLocalSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsLocalSpeechRecognitionActive(false);
        console.log("Local speech recognition stopped");
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
  };

  const startConversation = async () => {
    try {
      setIsConnecting(true);
      
      setIsConversationActive(true);
      
      const savedTranscript = localStorage.getItem('lastConversationTranscript');
      if (savedTranscript) {
        console.log("Found saved transcript, but starting fresh for this session");
      }
      
      setTranscript([]);
      localStorage.setItem('currentSessionTranscript', JSON.stringify([]));
      
      const conversationId = await conversation.startSession({
        agentId: ELEVENLABS_AGENT_ID
      });
      
      onSetConversationId(conversationId);
      console.log("Conversation started with ID:", conversationId);
      
      startLocalSpeechRecognition();
      
      toast({
        title: "🎙️ Conversation Started",
        description: "The AI assistant is listening. Please speak clearly.",
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to the voice service. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
      setIsConversationActive(false);
      
      localStorage.setItem('lastConversationTranscript', JSON.stringify(transcript));
      
      window.dispatchEvent(new CustomEvent('conversationTranscript', { 
        detail: { transcript: transcript } 
      }));
      
      if (isLocalSpeechRecognitionActive) {
        stopLocalSpeechRecognition();
      }
      
      toast({
        title: "✨ Conversation Ended",
        description: "Creating your personalized timetable now...",
      });
      
      onConversationComplete();
    } catch (error) {
      console.error("Error ending conversation:", error);
      toast({
        title: "Error",
        description: "There was a problem ending the conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="mb-6">
      <p className="text-sm text-wellness-charcoal mb-2">
        👋 Let's create your personal timetable! I'll ask about your daily routine and preferences.
      </p>
      
      {isConversationActive ? (
        <div className="flex flex-col items-center py-4">
          <div className="h-16 w-16 rounded-full bg-wellness-softGreen/50 flex items-center justify-center mb-4 animate-pulse">
            <Mic className="h-8 w-8 text-wellness-darkGreen" />
          </div>
          <p className="text-wellness-darkGreen font-medium mb-2">
            🎙️ Assistant is listening...
          </p>
          <p className="text-sm text-wellness-charcoal mb-4">
            Speak clearly to answer the questions
          </p>
          <Button 
            variant="destructive" 
            onClick={endConversation}
            className="flex items-center"
          >
            <MicOff className="h-4 w-4 mr-2" />
            End Conversation
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center py-4">
          <div className="h-16 w-16 rounded-full bg-wellness-softGreen/30 flex items-center justify-center mb-4">
            <Mic className="h-8 w-8 text-wellness-darkGreen/70" />
          </div>
          <Button 
            onClick={startConversation} 
            disabled={isConnecting}
            className="bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white"
          >
            {isConnecting ? 'Connecting...' : '🎙️ Start Voice Conversation'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
