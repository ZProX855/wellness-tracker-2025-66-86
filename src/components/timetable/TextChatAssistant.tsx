
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send } from 'lucide-react';

interface TextChatAssistantProps {
  isTextChatActive: boolean;
  setIsTextChatActive: (active: boolean) => void;
  onConversationComplete: () => void;
  onResponses: (question: string, answer: string) => void;
}

// Gemini API key and endpoint
const GEMINI_API_KEY = "AIzaSyC3Er0jxIvcQCjPzGpp9xYH-Lc-8TuqqJc";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const TextChatAssistant: React.FC<TextChatAssistantProps> = ({
  isTextChatActive,
  setIsTextChatActive,
  onConversationComplete,
  onResponses
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  const startTextChat = async () => {
    // Call the parent component's setIsTextChatActive to hide the timetable
    setIsTextChatActive(true);
    
    // First message from the assistant - more friendly and concise with emoji
    const initialPrompt = "👋 Hi there! I'll help create your daily schedule. Could you tell me when you usually wake up and go to sleep?";
    
    setConversationHistory([
      { role: 'assistant', content: initialPrompt }
    ]);
    
    // Add to responses for the main component
    onResponses(initialPrompt, '');
    
    toast({
      title: "Chat Started",
      description: "You can now chat with the AI assistant to create your timetable.",
    });
  };

  const endTextChat = () => {
    setIsTextChatActive(false);
    onConversationComplete();
    
    toast({
      title: "✨ Conversation Ended",
      description: "Creating your personalized timetable now...",
    });
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isWaitingForResponse) return;
    
    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    
    // Add user message to conversation
    setConversationHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Add to responses for the main component
    onResponses('', userMessage);
    
    setIsWaitingForResponse(true);
    
    try {
      // Format conversation history for Gemini
      const formattedHistory = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
      // Add the new user message
      formattedHistory.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });
      
      // Enhanced prompt for Gemini API to generate more concise, friendly responses with emojis
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are a friendly AI assistant helping create a daily timetable. 
The user has said: "${userMessage}"

Please respond in a very concise, friendly way (max 2-3 sentences). 
Include 1-2 relevant emojis.
Ask just ONE clear question at a time about their routine or preferences.
Focus on collecting practical information for their timetable.

Previous conversation: ${JSON.stringify(formattedHistory)}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
            topP: 0.8,
            topK: 40
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_ONLY_HIGH"
            }
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.candidates || !data.candidates[0] || 
          !data.candidates[0].content || !data.candidates[0].content.parts || 
          !data.candidates[0].content.parts[0]) {
        throw new Error("Invalid response format from Gemini API");
      }
      
      const assistantMessage = data.candidates[0].content.parts[0].text;
      
      // Add assistant message to conversation
      setConversationHistory(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      
      // Add to responses for the main component
      onResponses(assistantMessage, '');
      
      // Check if we've asked enough questions (at least 5 exchanges)
      if (conversationHistory.length >= 10) { // 5 questions + 5 answers
        // Ask if the user wants to continue or generate the timetable
        const followupMessage = "✅ Thanks for all this info! Ready to create your timetable? Or is there anything else you'd like to add?";
        
        setConversationHistory(prev => [...prev, { role: 'assistant', content: followupMessage }]);
        onResponses(followupMessage, '');
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      toast({
        title: "Error",
        description: "There was a problem communicating with the AI assistant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isTextChatActive) {
    return (
      <div className="flex flex-col items-center py-4">
        <div className="h-16 w-16 rounded-full bg-wellness-softGreen/30 flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-wellness-darkGreen/70" />
        </div>
        <Button 
          onClick={startTextChat}
          className="bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white"
        >
          Start Text Conversation
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 border rounded-lg bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationHistory.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-3/4 p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-wellness-darkGreen text-white rounded-tr-none' 
                  : 'bg-wellness-softGreen/20 text-wellness-darkGreen rounded-tl-none'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isWaitingForResponse && (
          <div className="flex justify-start">
            <div className="bg-wellness-softGreen/20 text-wellness-darkGreen p-3 rounded-lg rounded-tl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-wellness-darkGreen/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-wellness-darkGreen/60 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-wellness-darkGreen/60 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>
      
      <div className="border-t p-2 flex">
        <textarea 
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 p-2 focus:outline-none resize-none h-12"
          disabled={isWaitingForResponse}
        />
        <div className="flex">
          <Button 
            onClick={sendMessage} 
            size="icon"
            disabled={isWaitingForResponse || !currentMessage.trim()}
            className="ml-2 bg-wellness-darkGreen hover:bg-wellness-mediumGreen"
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button 
            onClick={endTextChat}
            variant="outline"
            className="ml-2 border-wellness-darkGreen text-wellness-darkGreen"
          >
            Generate Timetable
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TextChatAssistant;
