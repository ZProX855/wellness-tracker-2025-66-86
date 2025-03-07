
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, RefreshCw } from 'lucide-react';

interface ChatModeSelectorProps {
  chatMode: 'voice' | null;
  setChatMode: (mode: 'voice' | null) => void;
  isConversationActive: boolean;
  isTextChatActive: boolean;
  onStartVoiceConversation?: () => void;
}

const ChatModeSelector: React.FC<ChatModeSelectorProps> = ({
  chatMode,
  setChatMode,
  isConversationActive,
  isTextChatActive,
  onStartVoiceConversation
}) => {
  if (isConversationActive || isTextChatActive) {
    return null; // Don't show selector when a conversation is active
  }

  const handleVoiceClick = () => {
    setChatMode('voice');
    if (onStartVoiceConversation) {
      onStartVoiceConversation();
    }
  };

  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex flex-col items-center justify-center py-6">
        <div className="h-24 w-24 aspect-square rounded-full bg-wellness-softGreen/30 flex items-center justify-center mb-5">
          <Mic className="h-12 w-12 text-wellness-darkGreen/70" />
        </div>
        <Button 
          onClick={handleVoiceClick}
          className="bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white px-6 py-2.5 min-w-40"
        >
          🎙️ Start Voice Conversation
        </Button>
      </div>
    </div>
  );
};

export default ChatModeSelector;
