
import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface VoiceAssistantStatusProps {
  isConversationActive: boolean;
  isConnecting: boolean;
  onStartConversation: () => void;
  onEndConversation: () => void;
}

const VoiceAssistantStatus: React.FC<VoiceAssistantStatusProps> = ({
  isConversationActive,
  isConnecting,
  onStartConversation,
  onEndConversation
}) => {
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
            onClick={onEndConversation}
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
            onClick={onStartConversation} 
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

export default VoiceAssistantStatus;
