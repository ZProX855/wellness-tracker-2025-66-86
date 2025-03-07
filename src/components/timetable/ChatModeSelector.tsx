
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic } from 'lucide-react';

interface ChatModeSelectorProps {
  chatMode: 'voice' | null;
  setChatMode: (mode: 'voice' | null) => void;
  isConversationActive: boolean;
  isTextChatActive: boolean;
}

const ChatModeSelector: React.FC<ChatModeSelectorProps> = ({
  chatMode,
  setChatMode,
  isConversationActive,
  isTextChatActive
}) => {
  if (isConversationActive || isTextChatActive) {
    return null; // Don't show selector when a conversation is active
  }
  
  return (
    <div className="mb-8 animate-fade-in">
      <h3 className="text-base font-medium text-wellness-darkGreen mb-4">Start Your Timetable Creation</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant={chatMode === 'voice' ? 'default' : 'outline'}
          className={`w-full sm:w-auto py-6 hover-scale transition-all ${chatMode === 'voice' 
            ? 'bg-gradient-to-r from-wellness-darkGreen to-wellness-mediumGreen text-white shadow-md' 
            : 'border-wellness-darkGreen text-wellness-darkGreen hover:bg-wellness-softGreen/20'}`}
          onClick={() => setChatMode('voice')}
        >
          <Mic className="h-5 w-5 mr-3" />
          Voice Assistant
        </Button>
      </div>
    </div>
  );
};

export default ChatModeSelector;
