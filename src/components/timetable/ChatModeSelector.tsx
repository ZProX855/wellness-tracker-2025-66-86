
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MessageSquare } from 'lucide-react';

interface ChatModeSelectorProps {
  chatMode: 'voice' | 'text' | null;
  setChatMode: (mode: 'voice' | 'text' | null) => void;
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
    <div className="mb-6">
      <h3 className="text-sm font-medium text-wellness-darkGreen mb-3">Choose Conversation Mode</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant={chatMode === 'voice' ? 'default' : 'outline'}
          className={chatMode === 'voice' 
            ? 'bg-wellness-darkGreen text-white' 
            : 'border-wellness-darkGreen text-wellness-darkGreen'}
          onClick={() => setChatMode('voice')}
        >
          <Mic className="h-4 w-4 mr-2" />
          Voice Assistant
        </Button>
        <Button 
          variant={chatMode === 'text' ? 'default' : 'outline'}
          className={chatMode === 'text' 
            ? 'bg-wellness-darkGreen text-white' 
            : 'border-wellness-darkGreen text-wellness-darkGreen'}
          onClick={() => setChatMode('text')}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Text Chat
        </Button>
      </div>
    </div>
  );
};

export default ChatModeSelector;
