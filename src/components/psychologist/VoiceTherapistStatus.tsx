
import React from 'react';
import { Mic, MicOff, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface VoiceTherapistStatusProps {
  isConversationActive: boolean;
  isConnecting: boolean;
  onStartConversation: () => void;
  onEndConversation: () => void;
}

const VoiceTherapistStatus: React.FC<VoiceTherapistStatusProps> = ({
  isConversationActive,
  isConnecting,
  onStartConversation,
  onEndConversation
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      {isConversationActive ? (
        <div className="flex flex-col items-center py-6 px-4">
          <div className="h-20 w-20 aspect-square rounded-full bg-indigo-100 flex items-center justify-center mb-5 animate-pulse">
            <Mic className="h-10 w-10 text-indigo-700" />
          </div>
          <p className="text-wellness-darkGreen font-medium mb-3 text-lg">
            🎙️ AI Therapist is listening...
          </p>
          <p className="text-sm text-wellness-charcoal mb-5">
            Speak naturally as if you were talking to a friend
          </p>
          <Button variant="destructive" onClick={onEndConversation} className="flex items-center px-6 py-2.5">
            <MicOff className="h-4 w-4 mr-2" />
            End Conversation
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center py-6 px-4">
          <div className="h-20 w-20 aspect-square rounded-full bg-indigo-100/50 flex items-center justify-center mb-5">
            <Mic className="h-10 w-10 text-indigo-700/70" />
          </div>
          <p className="text-wellness-charcoal mb-5 text-center max-w-md px-0">
            Start a conversation with an AI therapist to discuss your feelings, thoughts, or concerns in a safe, private space.
          </p>
          <Button 
            onClick={onStartConversation} 
            disabled={isConnecting} 
            className="bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white px-6 py-2.5 min-w-40"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>🎙️ Start Voice Therapy</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VoiceTherapistStatus;
