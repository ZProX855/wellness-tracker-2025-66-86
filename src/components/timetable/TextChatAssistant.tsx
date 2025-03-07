import React, { useState, useRef } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TextChatAssistantProps {
  isTextChatActive: boolean;
  setIsTextChatActive: (active: boolean) => void;
  onConversationComplete: () => void;
  onResponses: (question: string, answer: string) => void;
  onHideInsights?: () => void; // Add optional prop for hiding insights
  onHideTimetable?: () => void; // Add optional prop for hiding timetable
}

const TextChatAssistant: React.FC<TextChatAssistantProps> = ({
  isTextChatActive,
  setIsTextChatActive,
  onConversationComplete,
  onResponses,
  onHideInsights,
  onHideTimetable
}) => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const startTextChat = () => {
    setIsTextChatActive(true);
    
    // Hide insights and timetable if handlers are provided
    if (onHideInsights) onHideInsights();
    if (onHideTimetable) onHideTimetable();
    
    // Add initial message from assistant
    const initialMessage = {
      role: 'assistant' as const,
      content: "👋 Hello! I'm your wellness assistant. I'll help create a personalized timetable for you. Let's start by discussing your daily routine. What time do you usually wake up?"
    };
    
    setMessages([initialMessage]);
    onResponses(initialMessage.content, '');
    
    toast({
      title: "💬 Text Chat Started",
      description: "You can now chat with the AI assistant to create your timetable.",
    });
  };

  const sendMessage = async () => {
    if (message.trim() === '') return;

    const userMessage = { role: 'user' as const, content: message };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    onResponses('', message);
    setMessage('');
    setIsWaitingForResponse(true);

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant' as const,
        content: "That's interesting! Please tell me more."
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      onResponses(aiResponse.content, '');
      setIsWaitingForResponse(false);
      scrollToBottom();
    }, 1500);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleEndConversation = () => {
    setIsTextChatActive(false);
    onConversationComplete();
    toast({
      title: "✨ Conversation Ended",
      description: "Creating your personalized timetable now...",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {!isTextChatActive ? (
        <div className="flex flex-col items-center py-4">
          <div className="h-16 w-16 rounded-full bg-wellness-softGreen/30 flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-wellness-darkGreen/70" />
          </div>
          <Button
            onClick={startTextChat}
            className="bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white"
          >
            💬 Start Text Conversation
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-grow p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div
                  className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-wellness-mediumGreen text-white' : 'bg-gray-100 text-gray-800'}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isWaitingForResponse && (
              <div className="text-left mb-2">
                <div className="inline-block p-2 rounded-lg bg-gray-100 text-gray-800">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full p-2 border rounded-md resize-none"
              rows={3}
            />
            <div className="flex justify-between items-center mt-2">
              <Button onClick={sendMessage} className="bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
              <Button variant="destructive" onClick={handleEndConversation}>
                End Conversation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextChatAssistant;
