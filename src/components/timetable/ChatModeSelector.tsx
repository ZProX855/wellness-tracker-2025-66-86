
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
    <div className="mb-6 animate-fade-in">
      <h3 className="text-sm font-medium text-wellness-darkGreen mb-3">Choose Conversation Mode</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant={chatMode === 'voice' ? 'default' : 'outline'}
          className={`hover-scale transition-all ${chatMode === 'voice' 
            ? 'bg-gradient-to-r from-wellness-darkGreen to-wellness-mediumGreen text-white shadow-md' 
            : 'border-wellness-darkGreen text-wellness-darkGreen hover:bg-wellness-softGreen/20'}`}
          onClick={() => setChatMode('voice')}
        >
          <Mic className="h-4 w-4 mr-2" />
          Voice Assistant
        </Button>
      </div>
    </div>
  );
};

export default ChatModeSelector;
