
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useElevenLabsConversation, ELEVENLABS_AGENT_ID } from '@/hooks/useElevenLabsConversation';
import { saveTranscript, loadTranscript, dispatchTranscriptEvent } from '@/utils/transcriptUtils';
import VoiceAssistantStatus from './VoiceAssistantStatus';

interface VoiceAssistantProps {
  isConversationActive: boolean;
  setIsConversationActive: (active: boolean) => void;
  onConversationComplete: () => void;
  onResponses: (question: string, answer: string) => void;
  onSetConversationId: (id: string) => void;
  onHideInsights: () => void;
  onHideTimetable: () => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  isConversationActive,
  setIsConversationActive,
  onConversationComplete,
  onResponses,
  onSetConversationId,
  onHideInsights,
  onHideTimetable
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const { toast } = useToast();

  const { 
    isActive: isLocalSpeechRecognitionActive,
    transcript: recognitionTranscript,
    startRecognition: startLocalSpeechRecognition,
    stopRecognition: stopLocalSpeechRecognition
  } = useSpeechRecognition();

  // Set up transcript state when recognition transcript changes
  useEffect(() => {
    if (recognitionTranscript.length > 0) {
      setTranscript(recognitionTranscript);
    }
  }, [recognitionTranscript]);

  const handleMessage = (message: any) => {
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
        saveTranscript(updatedTranscript);
        return updatedTranscript;
      });
    } else if (message.type === 'user_message' && message.content) {
      onResponses('', message.content);
      
      setTranscript(prev => {
        const updatedTranscript = [...prev, `User: ${message.content}`];
        saveTranscript(updatedTranscript);
        return updatedTranscript;
      });
    } else if (message.type === 'end_of_conversation') {
      setIsConversationActive(false);
      
      // Save final transcript to localStorage
      saveTranscript(transcript);
      
      // Dispatch event for other components
      dispatchTranscriptEvent(transcript);
      
      onConversationComplete();
      
      if (isLocalSpeechRecognitionActive) {
        stopLocalSpeechRecognition();
      }
      
      toast({
        title: "✨ Conversation Completed!",
        description: "Creating your personalized timetable now...",
      });
    }
  };
  
  const handleError = (error: any) => {
    setIsConversationActive(false);
    
    if (isLocalSpeechRecognitionActive) {
      stopLocalSpeechRecognition();
    }
  };

  const conversation = useElevenLabsConversation({
    onMessage: handleMessage,
    onError: handleError
  });

  useEffect(() => {
    try {
      const savedTranscript = loadTranscript();
      if (savedTranscript.length > 0) {
        console.log("Loading saved transcript on mount:", savedTranscript);
        setTranscript(savedTranscript);
      }
    } catch (error) {
      console.error("Error loading saved transcript:", error);
    }
  }, []);

  const startConversation = async () => {
    try {
      setIsConnecting(true);
      
      setIsConversationActive(true);
      
      // Hide insights when conversation starts
      onHideInsights();
      
      // Hide timetable when conversation starts
      onHideTimetable();
      
      // Check for existing transcript
      try {
        const savedTranscript = loadTranscript();
        if (savedTranscript.length > 0) {
          console.log("Found saved transcript, but starting fresh for this session");
        }
      } catch (error) {
        console.error("Error checking saved transcript:", error);
      }
      
      // Start fresh transcript for this session
      setTranscript([]);
      try {
        localStorage.setItem('currentSessionTranscript', JSON.stringify([]));
        console.log("Initialized fresh transcript for new session");
      } catch (error) {
        console.error("Error initializing transcript:", error);
      }
      
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
      
      // Save final transcript to localStorage
      saveTranscript(transcript);
      
      // Dispatch event for other components
      dispatchTranscriptEvent(transcript);
      
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
    <VoiceAssistantStatus 
      isConversationActive={isConversationActive}
      isConnecting={isConnecting}
      onStartConversation={startConversation}
      onEndConversation={endConversation}
    />
  );
};

export default VoiceAssistant;
