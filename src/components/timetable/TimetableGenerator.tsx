
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Gemini API key and endpoint
const GEMINI_API_KEY = "AIzaSyC3Er0jxIvcQCjPzGpp9xYH-Lc-8TuqqJc";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

interface TimetableGeneratorProps {
  conversationData: any;
  localConversation: {question: string, answer: string}[];
  responses: {question: string, answer: string}[];
  transcript: string[];
  setTimetable: (timetable: TimetableEntry[]) => void;
  setShowTimetable: (show: boolean) => void;
  timetable: TimetableEntry[];
  currentConversationId: string | null;
}

interface TimetableEntry {
  time: string;
  activity: string;
  category: 'routine' | 'work' | 'meal' | 'exercise' | 'leisure' | 'learning' | 'rest';
  description?: string;
  completed?: boolean;
  important?: boolean;
}

const TimetableGeneratorComponent: React.FC<TimetableGeneratorProps> = ({
  conversationData,
  localConversation,
  responses,
  transcript,
  setTimetable,
  setShowTimetable,
  timetable,
  currentConversationId
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const fetchConversationDataAndGenerateTimetable = async () => {
    if (!currentConversationId) {
      console.error("No conversation ID available");
      toast({
        title: "No Voice Data",
        description: "No voice conversation data available. Try using the text chat instead.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    toast({
      title: "🔍 Processing Voice Data",
      description: "Please wait while we generate your timetable from your voice conversation...",
    });
    
    try {
      // Fetch conversation history from ElevenLabs
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/${currentConversationId}/history`, {
        method: 'GET',
        headers: {
          'xi-api-key': "sk_c12587e6581cef5f4f275b7a6d1e4acd591bee7c5a13465b"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch conversation data: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Conversation data from ElevenLabs:", data);
      
      // Only use the voice conversation data for generation
      await generateTimetableFromElevenLabsData(data);
      
    } catch (error) {
      console.error("Error fetching conversation data:", error);
      toast({
        title: "❌ Voice Data Error",
        description: "Could not retrieve voice conversation data. Using local speech transcript instead.",
        variant: "destructive"
      });
      
      // Try to generate with local transcript data as fallback
      if (transcript && transcript.length > 0) {
        generateTimetableFromLocalTranscript();
      } else {
        // If no transcript, try text conversation
        generateTimetableFromLocalConversation();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTimetableFromLocalTranscript = async () => {
    if (!transcript || transcript.length === 0) {
      toast({
        title: "❌ No Speech Data",
        description: "No speech transcript available. Try using the text chat instead.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setShowTimetable(true);
    
    try {
      // Format the transcript for the AI
      const transcriptText = transcript.join('\n');
      
      const prompt = `Based on the following user speech transcript, generate a structured and balanced daily timetable. Format it with time slots and activities, ensuring it's well-balanced with work, meals, exercise, leisure, and rest.
      
      User Speech Transcript:
      ${transcriptText}
      
      Important: Return ONLY a nicely formatted timetable as plain text with the format "hh:mm AM/PM - Activity" on each line, and categorize each activity as one of these: routine, work, meal, exercise, leisure, learning, rest.`;
      
      console.log("Sending request to Gemini API with prompt from local transcript:", prompt);
      
      // Call Gemini API
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log("Gemini API response:", responseData);
      
      if (!responseData || !responseData.candidates || !responseData.candidates[0] || 
          !responseData.candidates[0].content || !responseData.candidates[0].content.parts || 
          !responseData.candidates[0].content.parts[0]) {
        throw new Error("Invalid response format from Gemini API");
      }
      
      const timetableText = responseData.candidates[0].content.parts[0].text;
      console.log("Timetable text from Gemini:", timetableText);
      
      // Parse the timetable text into structured data
      const parsedTimetable = parseTimetableText(timetableText);
      
      if (parsedTimetable.length === 0) {
        throw new Error("Could not parse any timetable entries from the response");
      }
      
      setTimetable(parsedTimetable);
      
      toast({
        title: "✅ Timetable Generated",
        description: "Your personalized timetable has been created based on your speech transcript!",
      });
    } catch (error) {
      console.error("Error generating timetable from local transcript:", error);
      
      // Create a fallback timetable if generation fails
      handleGenerationError();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTimetableFromElevenLabsData = async (data: any) => {
    if (!data || !data.history || data.history.length === 0) {
      console.error("No valid ElevenLabs conversation data available");
      toast({
        title: "❌ Empty Voice Data",
        description: "No voice conversation data found. Please have a conversation first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setShowTimetable(true);
    
    try {
      // Format the conversation history from ElevenLabs
      const conversationHistory = data.history.map((item: any) => {
        if (item.role === 'assistant') {
          return `Question: ${item.text}`;
        } else if (item.role === 'user') {
          return `Answer: ${item.text}`;
        }
        return "";
      }).filter(Boolean).join('\n\n');
      
      const prompt = `Based on the following user responses, generate a structured and balanced daily timetable for the user. Format it with time slots and activities, ensuring it's well-balanced with work, meals, exercise, leisure, and rest.
      
      User Responses:
      ${conversationHistory}
      
      Important: Return ONLY a nicely formatted timetable as plain text with the format "hh:mm AM/PM - Activity" on each line, and categorize each activity as one of these: routine, work, meal, exercise, leisure, learning, rest.`;
      
      console.log("Sending request to Gemini API with prompt from ElevenLabs data:", prompt);
      
      // Call Gemini API
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log("Gemini API response:", responseData);
      
      if (!responseData || !responseData.candidates || !responseData.candidates[0] || 
          !responseData.candidates[0].content || !responseData.candidates[0].content.parts || 
          !responseData.candidates[0].content.parts[0]) {
        throw new Error("Invalid response format from Gemini API");
      }
      
      const timetableText = responseData.candidates[0].content.parts[0].text;
      console.log("Timetable text from Gemini:", timetableText);
      
      // Parse the timetable text into structured data
      const parsedTimetable = parseTimetableText(timetableText);
      
      if (parsedTimetable.length === 0) {
        throw new Error("Could not parse any timetable entries from the response");
      }
      
      setTimetable(parsedTimetable);
      
      toast({
        title: "✅ Timetable Generated",
        description: "Your personalized timetable has been created based on your voice conversation!",
      });
    } catch (error) {
      console.error("Error generating timetable from ElevenLabs data:", error);
      
      // Create a fallback timetable if generation fails
      handleGenerationError();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTimetableFromLocalConversation = async () => {
    if (localConversation.length === 0 && transcript.length === 0) {
      toast({
        title: "❌ No Text Conversation",
        description: "Please have a text conversation with the AI assistant first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setShowTimetable(false);
    
    toast({
      title: "🔍 Processing Text Data",
      description: "Please wait while we generate your timetable from your text conversation...",
    });
    
    // Use only the local text conversation to generate a timetable
    let conversationText = "";
    
    if (localConversation.length > 0) {
      // Use the structured conversation from text chat
      conversationText = localConversation.map(r => 
        `Question: ${r.question}\nAnswer: ${r.answer}`
      ).join('\n\n');
      
      console.log("Generating timetable from text conversation:", conversationText);
    } else {
      toast({
        title: "❌ No Text Data",
        description: "No text conversation data available. Please chat with the assistant first.",
        variant: "destructive"
      });
      setIsGenerating(false);
      return;
    }
    
    try {
      const prompt = `Based on the following conversation, generate a structured and balanced daily timetable. Format it with time slots and activities, ensuring it's well-balanced with work, meals, exercise, leisure, and rest.
      
      Conversation:
      ${conversationText}
      
      Important: Return ONLY a nicely formatted timetable as plain text with the format "hh:mm AM/PM - Activity" on each line, and categorize each activity as one of these: routine, work, meal, exercise, leisure, learning, rest.`;
      
      console.log("Sending request to Gemini API with prompt:", prompt);
      
      // Call Gemini API
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Gemini API response:", data);
      
      if (!data || !data.candidates || !data.candidates[0] || 
          !data.candidates[0].content || !data.candidates[0].content.parts || 
          !data.candidates[0].content.parts[0]) {
        throw new Error("Invalid response format from Gemini API");
      }
      
      const timetableText = data.candidates[0].content.parts[0].text;
      console.log("Timetable text from Gemini:", timetableText);
      
      // Parse the timetable text into structured data
      const parsedTimetable = parseTimetableText(timetableText);
      
      if (parsedTimetable.length === 0) {
        throw new Error("Could not parse any timetable entries from the response");
      }
      
      setTimetable(parsedTimetable);
      setShowTimetable(true);
      
      toast({
        title: "✅ Timetable Generated",
        description: "Your personalized timetable has been created based on your text conversation!",
      });
    } catch (error) {
      console.error("Error generating timetable from text conversation:", error);
      handleGenerationError();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerationError = () => {
    // Create a fallback timetable if generation fails
    if (timetable.length === 0) {
      const fallbackTimetable = createFallbackTimetable();
      setTimetable(fallbackTimetable);
      setShowTimetable(true);
      
      toast({
        title: "⚠️ Sample Timetable Created",
        description: "We've created a sample timetable for you. You can customize it to your needs.",
      });
    } else {
      toast({
        title: "❌ Generation Failed",
        description: "There was a problem generating your timetable. Using your previous timetable.",
        variant: "destructive"
      });
      setShowTimetable(true);
    }
  };

  const generateTimetable = async () => {
    // Check if we have any conversation data at all
    if (localConversation.length === 0 && responses.length === 0 && transcript.length === 0 && !currentConversationId) {
      toast({
        title: "❌ No Conversation Data",
        description: "Please have a conversation with the AI assistant first.",
        variant: "destructive"
      });
      return;
    }
    
    // Determine which data source to use based on available data
    if (currentConversationId) {
      // We have a voice conversation ID, try to use ElevenLabs data
      fetchConversationDataAndGenerateTimetable();
    } else if (transcript.length > 0) {
      // We have local speech transcript data
      generateTimetableFromLocalTranscript();
    } else if (localConversation.length > 0) {
      // We have local text conversation data
      generateTimetableFromLocalConversation();
    } else {
      // Fallback to any available data
      toast({
        title: "ℹ️ Using Available Data",
        description: "Generating timetable from available conversation data.",
      });
      generateTimetableFromLocalConversation();
    }
  };

  const parseTimetableText = (text: string): TimetableEntry[] => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const entries: TimetableEntry[] = [];
    
    const timeRegex = /(\d{1,2}:\d{2}\s*(?:AM|PM))/i;
    const categoryRegex = /(routine|work|meal|exercise|leisure|learning|rest)/i;
    
    for (const line of lines) {
      // Skip headers or non-timetable lines
      if (!timeRegex.test(line)) continue;
      
      const timeMatch = line.match(timeRegex);
      if (!timeMatch) continue;
      
      const time = timeMatch[1];
      let activityText = line.substring(line.indexOf('-') + 1).trim();
      
      // Try to extract category from the line if it's explicitly mentioned
      let category: TimetableEntry['category'] = 'routine';
      const categoryMatch = line.match(categoryRegex);
      
      if (categoryMatch) {
        category = categoryMatch[1].toLowerCase() as TimetableEntry['category'];
        // Remove the category from the activity text if it was in brackets or parentheses
        activityText = activityText.replace(/\[(routine|work|meal|exercise|leisure|learning|rest)\]/i, '').trim();
        activityText = activityText.replace(/\((routine|work|meal|exercise|leisure|learning|rest)\)/i, '').trim();
        activityText = activityText.replace(/- (routine|work|meal|exercise|leisure|learning|rest)$/i, '').trim();
      } else {
        // Try to infer the category from keywords
        const lowerActivity = activityText.toLowerCase();
        if (lowerActivity.includes('wake') || lowerActivity.includes('sleep') || lowerActivity.includes('routine') || lowerActivity.includes('preparation')) {
          category = 'routine';
        } else if (lowerActivity.includes('work') || lowerActivity.includes('study') || lowerActivity.includes('meeting')) {
          category = 'work';
        } else if (lowerActivity.includes('breakfast') || lowerActivity.includes('lunch') || lowerActivity.includes('dinner') || lowerActivity.includes('meal')) {
          category = 'meal';
        } else if (lowerActivity.includes('exercise') || lowerActivity.includes('gym') || lowerActivity.includes('workout') || lowerActivity.includes('walk')) {
          category = 'exercise';
        } else if (lowerActivity.includes('relax') || lowerActivity.includes('entertainment') || lowerActivity.includes('hobby')) {
          category = 'leisure';
        } else if (lowerActivity.includes('learn') || lowerActivity.includes('read') || lowerActivity.includes('class') || lowerActivity.includes('course')) {
          category = 'learning';
        } else if (lowerActivity.includes('rest') || lowerActivity.includes('break')) {
          category = 'rest';
        }
      }
      
      // Clean up the activity text
      activityText = activityText.replace(/^\s*-\s*/, ''); // Remove leading dash if present
      
      entries.push({
        time,
        activity: activityText,
        category,
        completed: false,
        important: category === 'work' || category === 'routine'  // Mark work and routine as important by default
      });
    }
    
    return entries;
  };

  const createFallbackTimetable = (): TimetableEntry[] => {
    return [
      { time: '7:00 AM', activity: 'Wake up and morning routine', category: 'routine', completed: false, important: true },
      { time: '7:30 AM', activity: 'Breakfast', category: 'meal', completed: false, important: false },
      { time: '8:30 AM', activity: 'Work/Study session 1', category: 'work', completed: false, important: true },
      { time: '10:30 AM', activity: 'Short break', category: 'rest', completed: false, important: false },
      { time: '10:45 AM', activity: 'Work/Study session 2', category: 'work', completed: false, important: true },
      { time: '12:30 PM', activity: 'Lunch', category: 'meal', completed: false, important: false },
      { time: '1:30 PM', activity: 'Exercise', category: 'exercise', completed: false, important: false },
      { time: '2:30 PM', activity: 'Work/Study session 3', category: 'work', completed: false, important: true },
      { time: '4:30 PM', activity: 'Learning something new', category: 'learning', completed: false, important: false },
      { time: '5:30 PM', activity: 'Free time/Hobbies', category: 'leisure', completed: false, important: false },
      { time: '7:00 PM', activity: 'Dinner', category: 'meal', completed: false, important: false },
      { time: '8:00 PM', activity: 'Relaxation time', category: 'leisure', completed: false, important: false },
      { time: '10:00 PM', activity: 'Bedtime routine', category: 'routine', completed: false, important: true }
    ];
  };

  return (
    <div>
      {responses.length === 0 && localConversation.length === 0 && timetable.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-wellness-darkGreen font-medium mb-4 text-center">
            No conversation data yet. Start a conversation to create a personalized timetable.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowTimetable(true);
              setTimetable(createFallbackTimetable());
            }}
            className="border-wellness-darkGreen text-wellness-darkGreen"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Create Sample Timetable
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4">
          <Button 
            onClick={generateTimetable}
            disabled={isGenerating}
            className="bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            {isGenerating ? '✨ Generating...' : '✨ Generate My Timetable'}
          </Button>
          <p className="text-xs text-wellness-charcoal mt-2">
            {transcript.length > 0 ? "Using speech transcript data" :
             currentConversationId ? "Using voice conversation data" : "Using text conversation data"}
          </p>
        </div>
      )}
      
      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-6 mt-4">
          <div className="rounded-full h-12 w-12 border-b-2 border-t-2 border-wellness-darkGreen animate-spin mb-4"></div>
          <p className="text-wellness-darkGreen font-medium">✨ Creating your personalized timetable...</p>
        </div>
      )}
    </div>
  );
};

export default TimetableGeneratorComponent;
