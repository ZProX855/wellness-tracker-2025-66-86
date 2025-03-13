
import { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useConversation } from '@11labs/react';

export const ELEVENLABS_AGENT_ID = "4srXLR6LLqArrQDZQoMx";
export const DEFAULT_ELEVENLABS_API_KEY = "sk_0f0525864a09c214f5b93c6c45e3f6f819c4eacf7061749a";

interface UseElevenLabsConversationProps {
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
}

export const useElevenLabsConversation = ({ onMessage, onError }: UseElevenLabsConversationProps = {}) => {
  const { toast } = useToast();

  useEffect(() => {
    window.localStorage.setItem('xi-api-key', DEFAULT_ELEVENLABS_API_KEY);
  }, []);

  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Message received:", message);
      
      if (onMessage) {
        onMessage(message);
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      toast({
        title: "Error",
        description: "There was a problem with the conversation. Please try again.",
        variant: "destructive"
      });
      
      if (onError) {
        onError(error);
      }
    }
  });

  return conversation;
};
