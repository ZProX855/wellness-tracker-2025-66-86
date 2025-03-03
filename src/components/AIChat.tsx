
import React, { useState, useRef, useEffect } from 'react';
import { Send, Dumbbell, Coffee, Heart, Leaf, Apple } from 'lucide-react';
import { getChatResponse } from '../services/api';
import { toast } from 'sonner';

// Enhanced helper function to format AI responses with bullet points and styling
const formatAIResponse = (text: string) => {
  // First, detect if the text has a greeting/intro and separate it
  const hasGreeting = text.match(/^(Hi|Hello|Hey|Greetings).*?!/i);
  let greeting = '';
  let mainContent = text;
  
  if (hasGreeting) {
    const greetingEndIndex = text.indexOf('\n', hasGreeting[0].length);
    if (greetingEndIndex !== -1) {
      greeting = text.substring(0, greetingEndIndex);
      mainContent = text.substring(greetingEndIndex);
    }
  }

  // Format the main content with enhanced styling
  const formattedContent = mainContent
    // Convert markdown-style bullet points to HTML with emoji
    .replace(/\*\s(.*?)(?=\n\*|\n\n|$)/g, '<li class="bullet-point">$1</li>')
    // Convert markdown bold to strong tags
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert regular bold format
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    // Convert section headers (lines ending with colon)
    .replace(/(^|\n)([^:\n]+):(\s*)(\n|$)/g, '$1<div class="section-header">$2:</div>$4')
    // Convert numbered lists (1. 2. 3. etc)
    .replace(/(\d+)\.\s(.*?)(?=\n\d+\.|\n\n|$)/g, '<li class="numbered">$1. $2</li>')
    // Handle specific formatting for protein recommendations (based on image example)
    .replace(/([\d\.]+)\s*grams\s*(per|of)\s*(protein|kilogram)(?:\s*of\s*body\s*weight)?/gi, 
             '<span class="highlight">$1 grams $2 $3</span>')
    // Wrap any standalone emojis at start of lines with emphasis
    .replace(/(^|\n)([\p{Emoji}]+)(\s)/gu, '$1<span class="emoji">$2</span>$3');

  // Wrap bullet points in a ul if there are any
  let finalContent = formattedContent;
  if (formattedContent.includes('<li class="bullet-point">')) {
    finalContent = formattedContent
      .replace(/(<li class="bullet-point">.*?<\/li>)+/g, '<ul class="response-list">$&</ul>');
  }

  // Wrap numbered lists in an ol if there are any
  if (finalContent.includes('<li class="numbered">')) {
    finalContent = finalContent
      .replace(/(<li class="numbered">.*?<\/li>)+/g, '<ol class="numbered-list">$&</ol>');
  }

  // Combine greeting (if any) with formatted content
  return greeting ? `<div class="greeting">${greeting}</div>${finalContent}` : finalContent;
};

const AIChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ text: string; isUser: boolean; isFormatted?: boolean }[]>([
    { 
      text: "👋 Hi! I'm your AI nutrition assistant. How can I help today?", 
      isUser: false 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionTopics = [
    { text: "How much protein do I need daily?", icon: <Dumbbell className="h-4 w-4" /> },
    { text: "What foods help reduce inflammation?", icon: <Leaf className="h-4 w-4" /> },
    { text: "Healthiest breakfast options?", icon: <Apple className="h-4 w-4" /> },
    { text: "Tips for heart-healthy eating", icon: <Heart className="h-4 w-4" /> },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);
    
    try {
      const response = await getChatResponse(userMessage);
      // Fix the error property check
      if (response && typeof response === 'object' && 'error' in response && response.error) {
        console.error("Chat API error:", response.error);
        setMessages(prev => [...prev, { 
          text: "🙁 Sorry, I couldn't process that right now. Could you try again?", 
          isUser: false 
        }]);
        toast.error("Couldn't get a response. Please try again.");
      } else {
        setMessages(prev => [...prev, { 
          text: response.text, 
          isUser: false,
          isFormatted: true
        }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        text: "🙁 Sorry, I couldn't process that right now. Could you try again?", 
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
          <span className="text-red-500">🍎</span> AI Nutrition Assistant
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
                <div 
                  className="chat-formatted-text" 
                  dangerouslySetInnerHTML={{ __html: formatAIResponse(message.text) }}
                />
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
            placeholder="Ask about nutrition..."
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

export default AIChat;
