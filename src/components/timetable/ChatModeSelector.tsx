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
  return;
};
export default ChatModeSelector;