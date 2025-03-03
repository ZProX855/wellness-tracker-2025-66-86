
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
  const [conversationStage, setConversationStage] = useState<'intro' | 'gathering' | 'refining' | 'finalizing'>('intro');
  const [gatheringCount, setGatheringCount] = useState(0);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  const startTextChat = async () => {
    setIsTextChatActive(true);
    
    // More conversational opening message
    const initialPrompt = "👋 Hey there! I'm excited to help create a schedule that actually works for you. What's your day typically like?";
    
    setConversationHistory([
      { role: 'assistant', content: initialPrompt }
    ]);
    
    onResponses(initialPrompt, '');
    
    toast({
      title: "Chat Started",
      description: "Let's have a conversation to build your perfect daily schedule.",
    });
  };

  const endTextChat = () => {
    setIsTextChatActive(false);
    
    // Add a friendly closing message
    const closingMessage = "Great conversation! I've got a good sense of your schedule now. Let me put something together for you. ✨";
    setConversationHistory(prev => [...prev, { role: 'assistant', content: closingMessage }]);
    onResponses(closingMessage, '');
    
    setTimeout(() => {
      onConversationComplete();
      
      toast({
        title: "✨ Creating Your Schedule",
        description: "Crafting your personalized timetable based on our chat...",
      });
    }, 1500);
  };

  const advanceConversationStage = (userMessageCount: number) => {
    if (conversationStage === 'intro' && userMessageCount >= 2) {
      setConversationStage('gathering');
    } else if (conversationStage === 'gathering' && userMessageCount >= 6) {
      setConversationStage('refining');
      // Add a summary message to confirm information
      provideSummary();
    } else if (conversationStage === 'refining' && userMessageCount >= 9) {
      setConversationStage('finalizing');
    }
    
    setGatheringCount(prevCount => prevCount + 1);
  };

  const provideSummary = async () => {
    // Prepare conversational summary
    const fullConversation = conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    
    setIsWaitingForResponse(true);
    
    try {
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
                  text: `Based on our conversation so far, provide a friendly summary of what you understand about my schedule preferences and daily routine. Format it as a casual check-in, asking if you've understood correctly. Make it conversational, not a bullet list.

Previous conversation: ${fullConversation}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 250,
            topP: 0.8,
            topK: 40
          }
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
      
      const summaryMessage = data.candidates[0].content.parts[0].text;
      
      // Add the summary to the conversation
      setConversationHistory(prev => [...prev, { role: 'assistant', content: summaryMessage }]);
      onResponses(summaryMessage, '');
      
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  const getSuggestionPrompt = (stage: string, history: string) => {
    switch(stage) {
      case 'intro':
        return `You're having a friendly conversation to help create a daily schedule. The chat just started.
                Ask a natural follow-up question about their general routine or preferences. Keep it casual and conversational.`;
      case 'gathering':
        return `Based on what they've shared about their routine, ask about a different aspect of their day 
                (meals, work, exercise, hobbies, etc.) that hasn't been discussed yet. Make your question sound like
                it naturally flows from the conversation, not like you're going through a checklist.`;
      case 'refining':
        return `Now that you have a general understanding of their day, ask about specific timing preferences, 
                priorities, or challenges they face with their current schedule. Position it as helping them improve
                their daily flow, not just collecting data.`;
      case 'finalizing':
        return `We're wrapping up the conversation. Ask if there's anything specific they'd like to focus on or 
                prioritize in their schedule, or if they have any special requirements for certain days.
                Make them feel like they have final input on their schedule.`;
      default:
        return `Continue the conversation naturally. Ask a follow-up question based on their previous response.`;
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isWaitingForResponse) return;
    
    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    
    // Add user message to conversation
    setConversationHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    onResponses('', userMessage);
    
    setIsWaitingForResponse(true);
    
    try {
      // Format conversation history for context
      const formattedHistory = conversationHistory.map(msg => 
        `${msg.role === 'assistant' ? 'AI' : 'User'}: ${msg.content}`
      ).join('\n');
      
      // Determine appropriate prompt based on conversation stage
      const stagePrompt = getSuggestionPrompt(conversationStage, formattedHistory);
      
      // Dynamic, conversational prompt for Gemini
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
                  text: `You're an AI assistant helping create a personalized daily schedule through conversation. 
The user said: "${userMessage}"

${stagePrompt}

Keep your response friendly, casual and concise (max 2-3 sentences).
Include an emoji or two to feel more personal.
Avoid sounding like you're going through a survey or questionnaire.
Previous conversation:
${formattedHistory}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 200,
            topP: 0.95,
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
      onResponses(assistantMessage, '');
      
      // Determine if we should move to the next stage
      advanceConversationStage(conversationHistory.filter(msg => msg.role === 'user').length);
      
      // If we've reached the end of the conversation flow
      if (conversationStage === 'finalizing' && gatheringCount > 4) {
        // Add final wrap-up message
        setTimeout(() => {
          const finalMessage = "I think I have all I need to create a great schedule for you! Should we go ahead and build your timetable now? 🎯";
          setConversationHistory(prev => [...prev, { role: 'assistant', content: finalMessage }]);
          onResponses(finalMessage, '');
        }, 1500);
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
