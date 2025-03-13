import React, { useState, useRef, useEffect } from 'react';
import { Send, User, MessagesSquare, Smile, Coffee, Zap, Brain } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  text: string;
  isUser: boolean;
  isFormatted?: boolean;
}

// Helper function to make the AI responses more conversational and human-like
const formatAIResponse = (text: string) => {
  // Keep the response as is without adding fancy formatting to make it more conversational
  return text;
};

const AITherapistChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "Hi there 👋 I'm your AI therapist. How are you feeling today?", 
      isUser: false 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionTopics = [
    { text: "I've been feeling anxious lately", icon: <Smile className="h-4 w-4" /> },
    { text: "I'm having trouble sleeping", icon: <Coffee className="h-4 w-4" /> },
    { text: "Feeling overwhelmed at work", icon: <Zap className="h-4 w-4" /> },
    { text: "Need help with stress management", icon: <Brain className="h-4 w-4" /> },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getTherapistResponse = async (userMessage: string): Promise<string> => {
    try {
      const GEMINI_API_KEY = "AIzaSyBMpc3Th2BmVVxUnIe-J0nQ-gknXtJEJTk";
      const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
      
      const systemPrompt = `
        You are a professional, empathetic AI therapist having a conversation with a user. 
        Respond in a natural, conversational way like a real human therapist would respond.
        
        Important guidelines:
        - Keep responses short (1-3 sentences) and conversational, like a real text chat.
        - Speak naturally using contractions (I'm, you're, it's).
        - Use occasional emojis sparingly where appropriate.
        - Ask thoughtful follow-up questions to encourage the user to open up.
        - Show genuine empathy and validation of feelings.
        - Avoid long explanations or clinical language.
        - Reflect what you hear the user saying.
        - Be non-judgmental and supportive.
        
        The user's message is: "${userMessage}"
      `;
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            topP: 0.95,
            topK: 40
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from Gemini API');
      }
      
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I'm having trouble understanding right now. Could you try expressing that differently?";
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      return "I'm having trouble connecting right now. Can we try again in a moment?";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);
    
    try {
      const response = await getTherapistResponse(userMessage);
      setMessages(prev => [...prev, { 
        text: response, 
        isUser: false,
        isFormatted: true
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        text: "I'm sorry, I couldn't process that right now. How about we try again?", 
        isUser: false 
      }]);
      toast.error("Couldn't get a response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white bg-opacity-80 backdrop-blur-sm shadow-sm rounded-2xl border border-wellness-softGreen/30 overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 bg-wellness-softGreen border-b border-wellness-softGreen/30">
        <h2 className="text-xl font-medium text-wellness-darkGreen flex items-center gap-2">
          <span className="text-indigo-500">🧠</span> AI Therapist Chat
        </h2>
        <p className="text-sm text-wellness-charcoal">Powered by Gemini 2.0 Flash</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div 
              className={`max-w-[85%] p-3 rounded-2xl ${
                message.isUser 
                  ? 'bg-wellness-darkGreen text-white rounded-tr-none' 
                  : 'bg-wellness-softGreen/50 text-wellness-charcoal rounded-tl-none'
              }`}
            >
              {message.isFormatted ? (
                <div className="whitespace-pre-line">{formatAIResponse(message.text)}</div>
              ) : (
                <div className="whitespace-pre-line">{message.text}</div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-slide-up">
            <div className="max-w-[85%] p-3 rounded-2xl bg-wellness-softGreen/50 text-wellness-charcoal rounded-tl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-wellness-darkGreen rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-wellness-darkGreen rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                <div className="w-2 h-2 bg-wellness-darkGreen rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="px-4 py-2 bg-white border-t border-wellness-softGreen/30">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {suggestionTopics.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion.text)}
              className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-sm bg-wellness-softGreen/50 hover:bg-wellness-softGreen text-wellness-darkGreen rounded-full transition-colors duration-300"
            >
              {suggestion.icon}
              {suggestion.text}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-white border-t border-wellness-softGreen/20">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type how you're feeling..."
            className="flex-1 input-field rounded-full text-wellness-charcoal"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`p-3 rounded-full ${
              isLoading || !input.trim() 
                ? 'bg-wellness-mediumGreen/50 cursor-not-allowed' 
                : 'bg-wellness-darkGreen hover:bg-wellness-darkGreen/90'
            } text-white transition-colors duration-300`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITherapistChat;
