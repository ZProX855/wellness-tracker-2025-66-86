
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useElevenLabsConversation } from './useElevenLabsTherapist';
import VoiceTherapistStatus from './VoiceTherapistStatus';

interface VoiceTherapistProps {}

const VoiceTherapist: React.FC<VoiceTherapistProps> = () => {
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [transcript, setTranscript] = useState<string[]>([]);
  const { toast: hookToast } = useToast();

  // Initialize the conversation with ElevenLabs
  const conversation = useElevenLabsConversation({
    onMessage: (message) => {
      console.log("Message received from ElevenLabs:", message);
      
      if (message.type === 'agent' && message.content) {
        setTranscript(prev => {
          const updatedTranscript = [...prev, `Therapist: ${message.content}`];
          try {
            localStorage.setItem('lastTherapyConversation', JSON.stringify(updatedTranscript));
          } catch (error) {
            console.error("Error saving transcript:", error);
          }
          return updatedTranscript;
        });
      } else if (message.type === 'user_message' && message.content) {
        setTranscript(prev => {
          const updatedTranscript = [...prev, `You: ${message.content}`];
          try {
            localStorage.setItem('lastTherapyConversation', JSON.stringify(updatedTranscript));
          } catch (error) {
            console.error("Error saving transcript:", error);
          }
          return updatedTranscript;
        });
      } else if (message.type === 'end_of_conversation') {
        setIsConversationActive(false);
        toast.success("Conversation ended", {
          description: "Your therapy session has ended."
        });
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      setIsConversationActive(false);
      hookToast({
        title: "Connection Error",
        description: "There was a problem with the therapy session. Please try again.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    // Try to load the previous conversation
    try {
      const savedTranscript = localStorage.getItem('lastTherapyConversation');
      if (savedTranscript) {
        const parsed = JSON.parse(savedTranscript);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTranscript(parsed);
        }
      }
    } catch (error) {
      console.error("Error loading saved transcript:", error);
    }
  }, []);

  const startConversation = async () => {
    try {
      setIsConnecting(true);
      setIsConversationActive(true);
      
      // Configure ElevenLabs to use API key and start the session
      window.localStorage.setItem('xi-api-key', "sk_0f0525864a09c214f5b93c6c45e3f6f819c4eacf7061749a");
      
      const id = await conversation.startSession({
        agentId: "4srXLR6LLqArrQDZQoMx"
      });
      
      setConversationId(id);
      console.log("Conversation started with ID:", id);
      
      toast.success("Conversation Started", {
        description: "Your AI therapist is now listening. Speak clearly to have a conversation."
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      hookToast({
        title: "Connection Failed",
        description: "Could not connect to the voice service. Please try again later.",
        variant: "destructive"
      });
      setIsConversationActive(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
      setIsConversationActive(false);
      
      toast.success("Conversation Ended", {
        description: "Your therapy session has ended."
      });
    } catch (error) {
      console.error("Error ending conversation:", error);
      hookToast({
        title: "Error",
        description: "There was a problem ending the conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white bg-opacity-80 backdrop-blur-sm shadow-sm rounded-2xl border border-wellness-softGreen/30 overflow-hidden flex flex-col">
      <div className="p-4 bg-wellness-softGreen border-b border-wellness-softGreen/30">
        <h2 className="text-xl font-medium text-wellness-darkGreen flex items-center gap-2">
          <span className="text-indigo-500">🧠</span> AI Voice Therapist
        </h2>
        <p className="text-sm text-wellness-charcoal">Powered by ElevenLabs AI</p>
      </div>
      
      <div className="p-6 flex flex-col items-center justify-center">
        <VoiceTherapistStatus 
          isConversationActive={isConversationActive}
          isConnecting={isConnecting}
          onStartConversation={startConversation}
          onEndConversation={endConversation}
        />
        
        {transcript.length > 0 && (
          <div className="w-full mt-6 border-t border-wellness-softGreen/30 pt-4">
            <h3 className="text-wellness-darkGreen font-medium mb-2">Conversation Transcript</h3>
            <div className="max-h-[300px] overflow-y-auto p-3 bg-wellness-softGreen/10 rounded-lg">
              {transcript.map((line, idx) => (
                <div 
                  key={idx} 
                  className={`mb-2 ${line.startsWith('You:') ? 'text-wellness-darkGreen' : 'text-wellness-mediumGreen'}`}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceTherapist;
