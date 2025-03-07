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
  return <div className="mb-8 animate-fade-in">
      
    </div>;
};
export default ChatModeSelector;