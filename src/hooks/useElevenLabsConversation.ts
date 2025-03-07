
import { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useConversation } from '@11labs/react';

export const ELEVENLABS_AGENT_ID = "PBIwiIwBWi1HsMvF0Llj";
export const DEFAULT_ELEVENLABS_API_KEY = "sk_c12587e6581cef5f4f275b7a6d1e4acd591bee7c5a13465b";

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
