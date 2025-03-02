import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from '@11labs/react';

// ElevenLabs Agent ID and API key
const ELEVENLABS_AGENT_ID = "LF5rdFTcFtmNyiCIzjc5";
const DEFAULT_ELEVENLABS_API_KEY = "sk_36070a7f0b1022f8908a1794fce6a0ce19f6668f365740d0";

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

  // Initialize the Web Speech API
  useEffect(() => {
    // Check if SpeechRecognition is available
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
  }, []);

  // Initialize ElevenLabs conversation hook with modified message handler for friendlier responses
  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Message received:", message);
      
      if (message.type === 'agent' && message.content) {
        // This is a question from the agent - store the original question
        // Check if the message is too verbose and trim it if needed
        let formattedQuestion = message.content;
        
        // Optionally, we could add emoji to the question here if desired
        if (!formattedQuestion.includes('👋') && !formattedQuestion.includes('😊')) {
          // Add emoji for greeting messages
          if (formattedQuestion.toLowerCase().includes('hello') || 
              formattedQuestion.toLowerCase().includes('hi') || 
              formattedQuestion.toLowerCase().includes('welcome')) {
            formattedQuestion = `👋 ${formattedQuestion}`;
          }
          // Add emoji for thank you messages
          else if (formattedQuestion.toLowerCase().includes('thank')) {
            formattedQuestion = `😊 ${formattedQuestion}`;
          }
        }
        
        onResponses(formattedQuestion, '');
      } else if (message.type === 'user_message' && message.content) {
        // Update the response with the user's answer
        onResponses('', message.content);
      } else if (message.type === 'end_of_conversation') {
        // Conversation has ended
        setIsConversationActive(false);
        onConversationComplete();
        
        // Stop local speech recognition if it's active
        if (isLocalSpeechRecognitionActive) {
          stopLocalSpeechRecognition();
        }
        
        // Show a friendly toast notification
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
      
      // Stop local speech recognition if it's active
      if (isLocalSpeechRecognitionActive) {
        stopLocalSpeechRecognition();
      }
    }
  });

  // Set API key for ElevenLabs
  useEffect(() => {
    window.localStorage.setItem('xi-api-key', DEFAULT_ELEVENLABS_API_KEY);
  }, []);

  // Start local speech recognition
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

  // Stop local speech recognition
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

  // Start conversation
  const startConversation = async () => {
    try {
      setIsConnecting(true);
      
      // Start the conversation session with the ElevenLabs agent
      const conversationId = await conversation.startSession({
        agentId: ELEVENLABS_AGENT_ID
      });
      
      // Save the conversation ID
      onSetConversationId(conversationId);
      console.log("Conversation started with ID:", conversationId);
      
      setIsConversationActive(true);
      
      // Start local speech recognition for backup
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

  // End conversation
  const endConversation = async () => {
    try {
      await conversation.endSession();
      setIsConversationActive(false);
      
      // Stop local speech recognition
      if (isLocalSpeechRecognitionActive) {
        stopLocalSpeechRecognition();
      }
      
      // Show toast to indicate timetable generation is in progress
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
