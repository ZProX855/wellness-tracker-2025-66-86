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
  return <div className="mb-8">
      
      
      {isConversationActive ? <div className="flex flex-col items-center py-6 px-4">
          <div className="h-20 w-20 aspect-square rounded-full bg-wellness-softGreen/50 flex items-center justify-center mb-5 animate-pulse">
            <Mic className="h-10 w-10 text-wellness-darkGreen" />
          </div>
          <p className="text-wellness-darkGreen font-medium mb-3 text-lg">
            🎙️ Assistant is listening...
          </p>
          <p className="text-sm text-wellness-charcoal mb-5">
            Speak clearly to answer the questions
          </p>
          <Button variant="destructive" onClick={onEndConversation} className="flex items-center px-6 py-2.5">
            <MicOff className="h-4 w-4 mr-2" />
            End Conversation
          </Button>
        </div> : <div className="flex flex-col items-center py-6 px-4">
          <div className="h-20 w-20 aspect-square rounded-full bg-wellness-softGreen/30 flex items-center justify-center mb-5">
            <Mic className="h-10 w-10 text-wellness-darkGreen/70" />
          </div>
          <Button onClick={onStartConversation} disabled={isConnecting} className="bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white px-6 py-2.5 min-w-40">
            {isConnecting ? 'Connecting...' : '🎙️ Start Voice Conversation'}
          </Button>
        </div>}
    </div>;
};
export default VoiceAssistantStatus;