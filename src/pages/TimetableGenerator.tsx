
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Edit, Save, Clock, Calendar, Download, RefreshCw, List, Grid, Palette, Settings, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useConversation } from '@11labs/react';
import { useMediaQuery } from '@/hooks/use-mobile';
import TimetableVisualizer from '@/components/TimetableVisualizer';
import useLocalStorage from '@/hooks/useLocalStorage';

// Agent ID for ElevenLabs
const ELEVENLABS_AGENT_ID = "Dxu3cYNnYBYHvtV3Q9Hu";
// Default API key for ElevenLabs (will be used for all users)
const DEFAULT_ELEVENLABS_API_KEY = "d7ee089e6025770746b2fd8a9e9c98f5";
// Gemini API key and endpoint
const GEMINI_API_KEY = "AIzaSyC3Er0jxIvcQCjPzGpp9xYH-Lc-8TuqqJc";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

interface TimetableEntry {
  time: string;
  activity: string;
  category: 'routine' | 'work' | 'meal' | 'exercise' | 'leisure' | 'learning' | 'rest';
  description?: string;
  completed?: boolean;
  important?: boolean;
}

interface ConversationResponse {
  question: string;
  answer: string;
}

const TimetableGenerator = () => {
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [responses, setResponses] = useState<ConversationResponse[]>([]);
  const [timetable, setTimetable] = useLocalStorage<TimetableEntry[]>('wellness-timetable', []);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEntry, setEditEntry] = useState<TimetableEntry | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [colorTheme, setColorTheme] = useState<'soft' | 'vibrant' | 'pastel'>('soft');
  const [isColorThemeDialogOpen, setIsColorThemeDialogOpen] = useState(false);
  const [isAddEntryDrawerOpen, setIsAddEntryDrawerOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<TimetableEntry>({
    time: '',
    activity: '',
    category: 'routine',
    description: ''
  });
  const [showTimetable, setShowTimetable] = useState(false);
  
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Initialize ElevenLabs conversation hook
  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Message received:", message);
      // Save the conversation history
      if (message.type === 'agent' && message.content) {
        // This is a question from the agent
        setResponses(prev => [...prev, { 
          question: message.content, 
          answer: '' 
        }]);
      } else if (message.type === 'user_message' && message.content) {
        // Update the last response with the user's answer
        setResponses(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1].answer = message.content;
          }
          return updated;
        });
      } else if (message.type === 'end_of_conversation') {
        // Conversation has ended
        setIsConversationActive(false);
        setConversationComplete(true);
        setShowTimetable(true);
        
        // Generate timetable from collected responses immediately
        generateTimetable();
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      toast({
        title: "Error",
        description: "There was a problem with the conversation. Please try again.",
        variant: "destructive"
      });
      setIsConversationActive(false);
    }
  });

  // Use default API key
  useEffect(() => {
    // Set the API key in the browser for the ElevenLabs library
    window.localStorage.setItem('xi-api-key', DEFAULT_ELEVENLABS_API_KEY);
    
    // If we have a stored timetable, show it
    if (timetable && timetable.length > 0) {
      setShowTimetable(true);
    }
  }, []);

  // Start conversation
  const startConversation = async () => {
    try {
      setIsConnecting(true);
      
      // Start the conversation session with the ElevenLabs agent
      await conversation.startSession({
        agentId: ELEVENLABS_AGENT_ID
      });
      
      setIsConversationActive(true);
      setResponses([]);
      setConversationComplete(false);
      
      toast({
        title: "Conversation Started",
        description: "The AI assistant is now listening. Please allow microphone access.",
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to the ElevenLabs service. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // End conversation
  const endConversation = async () => {
    try {
      await conversation.endSession();
      setIsConversationActive(false);
      
      // Manually trigger timetable generation after ending the conversation
      if (responses.length > 0) {
        setConversationComplete(true);
        setShowTimetable(true);
        generateTimetable();
      }
    } catch (error) {
      console.error("Error ending conversation:", error);
    }
  };

  // Generate timetable using Gemini API
  const generateTimetable = async () => {
    if (responses.length === 0) {
      toast({
        title: "No Conversation Data",
        description: "Please have a conversation with the AI assistant first.",
        variant: "destructive"
      });
      return;
    }
    
    setLoadingTimetable(true);
    
    try {
      // Format the conversation data for Gemini
      const conversationText = responses.map(r => 
        `Question: ${r.question}\nAnswer: ${r.answer}`
      ).join('\n\n');
      
      const prompt = `Based on the following user responses, generate a structured and balanced daily timetable for the user. Format it with time slots and activities, ensuring it's well-balanced with work, meals, exercise, leisure, and rest.
      
      User Responses:
      ${conversationText}
      
      Important: Return ONLY a nicely formatted timetable as plain text with the format "hh:mm AM/PM - Activity" on each line, and categorize each activity as one of these: routine, work, meal, exercise, leisure, learning, rest.`;
      
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
      
      if (!data || !data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error("Invalid response format from Gemini API");
      }
      
      const timetableText = data.candidates[0].content.parts[0].text;
      
      // Parse the timetable text into structured data
      const parsedTimetable = parseTimetableText(timetableText);
      
      if (parsedTimetable.length === 0) {
        throw new Error("Could not parse any timetable entries from the response");
      }
      
      setTimetable(parsedTimetable);
      
      toast({
        title: "Timetable Generated",
        description: "Your personalized timetable has been created!",
      });
    } catch (error) {
      console.error("Error generating timetable:", error);
      
      // Create a fallback timetable if generation fails
      if (timetable.length === 0) {
        const fallbackTimetable = createFallbackTimetable();
        setTimetable(fallbackTimetable);
        
        toast({
          title: "Timetable Created",
          description: "We've created a sample timetable for you. You can customize it to your needs.",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "There was a problem generating your timetable. Using your previous timetable.",
          variant: "destructive"
        });
      }
    } finally {
      setLoadingTimetable(false);
    }
  };

  // Create a fallback timetable if generation fails
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

  // Parse the timetable text into structured data
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

  // Handle editing a timetable entry
  const handleEditEntry = (entry: TimetableEntry, index: number) => {
    setEditEntry({ ...entry });
    setEditIndex(index);
    setIsDrawerOpen(true);
  };

  // Save edited timetable entry
  const saveEditedEntry = () => {
    if (editEntry && editIndex !== null) {
      const updatedTimetable = [...timetable];
      updatedTimetable[editIndex] = editEntry;
      setTimetable(updatedTimetable);
      setIsDrawerOpen(false);
      
      toast({
        title: "Entry Updated",
        description: "Your timetable has been updated.",
      });
    }
  };

  // Add new entry to timetable
  const addNewEntry = () => {
    if (newEntry.time && newEntry.activity) {
      setTimetable(prev => [...prev, { ...newEntry, completed: false, important: false }]);
      setIsAddEntryDrawerOpen(false);
      setNewEntry({
        time: '',
        activity: '',
        category: 'routine',
        description: ''
      });
      
      toast({
        title: "Entry Added",
        description: "New activity has been added to your timetable.",
      });
    } else {
      toast({
        title: "Missing Information",
        description: "Please provide both time and activity.",
        variant: "destructive"
      });
    }
  };

  // Delete entry from timetable
  const deleteEntry = (index: number) => {
    const updatedTimetable = [...timetable];
    updatedTimetable.splice(index, 1);
    setTimetable(updatedTimetable);
    
    toast({
      title: "Entry Deleted",
      description: "Activity has been removed from your timetable.",
    });
  };

  // Toggle completed status
  const toggleCompleted = (index: number) => {
    const updatedTimetable = [...timetable];
    updatedTimetable[index].completed = !updatedTimetable[index].completed;
    setTimetable(updatedTimetable);
  };

  // Toggle important status
  const toggleImportant = (index: number) => {
    const updatedTimetable = [...timetable];
    updatedTimetable[index].important = !updatedTimetable[index].important;
    setTimetable(updatedTimetable);
  };

  // Share timetable
  const shareTimetable = async () => {
    try {
      // Format timetable as text
      const timetableText = timetable.map(entry => 
        `${entry.time} - ${entry.activity}${entry.description ? ` (${entry.description})` : ''}`
      ).join('\n');
      
      // Try to use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'My Daily Timetable',
          text: timetableText,
        });
        
        toast({
          title: "Timetable Shared",
          description: "Your timetable has been shared successfully.",
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(timetableText);
        
        toast({
          title: "Copied to Clipboard",
          description: "Your timetable has been copied to the clipboard.",
        });
      }
    } catch (error) {
      console.error("Error sharing timetable:", error);
      
      toast({
        title: "Sharing Failed",
        description: "There was a problem sharing your timetable.",
        variant: "destructive"
      });
    }
  };

  // Download timetable as text file
  const downloadTimetable = () => {
    const timetableText = timetable.map(entry => 
      `${entry.time} - ${entry.activity}${entry.description ? ` (${entry.description})` : ''}`
    ).join('\n');
    
    const blob = new Blob([timetableText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_timetable.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Timetable Downloaded",
      description: "Your timetable has been downloaded as a text file.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-softBeige to-wellness-softGreen/30">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-wellness-darkGreen hover:text-wellness-mediumGreen transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-medium text-wellness-darkGreen mt-4 mb-2">
              AI Voice Timetable Generator
            </h1>
            <p className="text-wellness-charcoal">
              Have a natural conversation with our AI assistant to create your personalized daily timetable.
            </p>
          </div>
          
          {/* Conversation Section */}
          <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-6 border border-wellness-softGreen/30 shadow-sm mb-8">
            <h2 className="text-xl font-medium text-wellness-darkGreen mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Voice Assistant
            </h2>
            
            <div className="mb-6">
              <p className="text-sm text-wellness-charcoal mb-2">
                The AI assistant will ask you questions about your daily routine and preferences to create a personalized timetable.
              </p>
              
              {isConversationActive ? (
                <div className="flex flex-col items-center py-4">
                  <div className="h-16 w-16 rounded-full bg-wellness-softGreen/50 flex items-center justify-center mb-4 animate-pulse">
                    <Mic className="h-8 w-8 text-wellness-darkGreen" />
                  </div>
                  <p className="text-wellness-darkGreen font-medium mb-2">
                    Assistant is listening...
                  </p>
                  <p className="text-sm text-wellness-charcoal mb-4">
                    Speak clearly to answer the assistant's questions
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={endConversation}
                    className="flex items-center"
                  >
                    <MicOff className="h-4 w-4 mr-2" />
                    End Conversation
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <div className="h-16 w-16 rounded-full bg-wellness-softGreen/30 flex items-center justify-center mb-4">
                    <Mic className="h-8 w-8 text-wellness-darkGreen/70" />
                  </div>
                  <Button 
                    onClick={startConversation} 
                    disabled={isConnecting}
                    className="bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white"
                  >
                    {isConnecting ? 'Connecting...' : (conversationComplete ? 'Start New Conversation' : 'Start Conversation')}
                  </Button>
                </div>
              )}
            </div>
            
            {/* Conversation History */}
            {responses.length > 0 && (
              <div className="mt-4 border-t border-wellness-softGreen/20 pt-4">
                <h3 className="text-sm font-medium text-wellness-darkGreen mb-2">Conversation Summary</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto p-2">
                  {responses.map((response, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-sm font-medium text-wellness-darkGreen">
                        <span className="text-wellness-mediumGreen">Q:</span> {response.question}
                      </p>
                      {response.answer && (
                        <p className="text-sm text-wellness-charcoal pl-4">
                          <span className="text-wellness-mediumGreen">A:</span> {response.answer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Timetable Section */}
          {loadingTimetable && (
            <div className="flex flex-col items-center justify-center py-12 animate-pulse">
              <div className="rounded-full h-16 w-16 border-b-2 border-t-2 border-wellness-darkGreen animate-spin mb-4"></div>
              <p className="text-wellness-darkGreen font-medium text-lg">Generating your personalized timetable...</p>
              <p className="text-wellness-charcoal text-sm mt-2">Analyzing your preferences and creating the perfect schedule for you</p>
            </div>
          )}
          
          {(showTimetable && !loadingTimetable && timetable.length > 0) && (
            <TimetableVisualizer 
              timetable={timetable}
              onEditEntry={handleEditEntry}
              onDeleteEntry={deleteEntry}
              onToggleCompleted={toggleCompleted}
              onToggleImportant={toggleImportant}
              onDownload={downloadTimetable}
              onShare={shareTimetable}
              onRegenerate={generateTimetable}
              colorTheme={colorTheme}
            />
          )}
          
          {!showTimetable && !loadingTimetable && conversationComplete && (
            <div className="flex flex-col items-center justify-center py-8">
              <Button 
                variant="default" 
                onClick={() => {
                  setShowTimetable(true);
                  generateTimetable();
                }}
                className="bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Generate Timetable
              </Button>
            </div>
          )}
          
          {/* Add timetable button if there is no timetable yet */}
          {!showTimetable && !loadingTimetable && !conversationComplete && timetable.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-6 border border-wellness-softGreen/30 shadow-sm">
              <p className="text-wellness-darkGreen font-medium mb-4 text-center">
                Start a conversation with the AI assistant to create your personalized timetable, or create one manually
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
                Create Empty Timetable
              </Button>
            </div>
          )}
        </div>
      </main>
      
      {/* Edit Entry Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Timetable Entry</DrawerTitle>
            <DrawerDescription>
              Make changes to your timetable entry below.
            </DrawerDescription>
          </DrawerHeader>
          {editEntry && (
            <div className="px-4 py-2">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="edit-time" className="text-right col-span-1">
                    Time
                  </label>
                  <input 
                    id="edit-time" 
                    type="text" 
                    value={editEntry.time} 
                    onChange={(e) => setEditEntry({...editEntry, time: e.target.value})}
                    className="col-span-3 p-2 border rounded w-full"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="edit-activity" className="text-right col-span-1">
                    Activity
                  </label>
                  <input 
                    id="edit-activity" 
                    type="text" 
                    value={editEntry.activity} 
                    onChange={(e) => setEditEntry({...editEntry, activity: e.target.value})}
                    className="col-span-3 p-2 border rounded w-full"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="edit-category" className="text-right col-span-1">
                    Category
                  </label>
                  <select 
                    id="edit-category" 
                    value={editEntry.category} 
                    onChange={(e) => setEditEntry({
                      ...editEntry, 
                      category: e.target.value as TimetableEntry['category']
                    })}
                    className="col-span-3 p-2 border rounded w-full"
                  >
                    <option value="routine">Routine</option>
                    <option value="work">Work</option>
                    <option value="meal">Meal</option>
                    <option value="exercise">Exercise</option>
                    <option value="leisure">Leisure</option>
                    <option value="learning">Learning</option>
                    <option value="rest">Rest</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="edit-description" className="text-right col-span-1">
                    Description
                  </label>
                  <textarea 
                    id="edit-description" 
                    value={editEntry.description || ''} 
                    onChange={(e) => setEditEntry({...editEntry, description: e.target.value})}
                    className="col-span-3 p-2 border rounded w-full h-20"
                    placeholder="Add optional description"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-span-1"></div>
                  <div className="col-span-3 flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={editEntry.completed || false} 
                        onChange={(e) => setEditEntry({...editEntry, completed: e.target.checked})}
                        className="rounded border-gray-300 text-wellness-darkGreen"
                      />
                      <span>Completed</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={editEntry.important || false} 
                        onChange={(e) => setEditEntry({...editEntry, important: e.target.checked})}
                        className="rounded border-gray-300 text-wellness-darkGreen"
                      />
                      <span>Important</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DrawerFooter>
            <Button onClick={saveEditedEntry} className="bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white">
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Add New Entry Drawer */}
      <Drawer open={isAddEntryDrawerOpen} onOpenChange={setIsAddEntryDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add New Activity</DrawerTitle>
            <DrawerDescription>
              Create a new activity for your timetable.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-2">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="new-time" className="text-right col-span-1">
                  Time
                </label>
                <input 
                  id="new-time" 
                  type="text" 
                  value={newEntry.time} 
                  onChange={(e) => setNewEntry({...newEntry, time: e.target.value})}
                  className="col-span-3 p-2 border rounded w-full"
                  placeholder="e.g., 9:00 AM"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="new-activity" className="text-right col-span-1">
                  Activity
                </label>
                <input 
                  id="new-activity" 
                  type="text" 
                  value={newEntry.activity} 
                  onChange={(e) => setNewEntry({...newEntry, activity: e.target.value})}
                  className="col-span-3 p-2 border rounded w-full"
                  placeholder="e.g., Morning Exercise"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="new-category" className="text-right col-span-1">
                  Category
                </label>
                <select 
                  id="new-category" 
                  value={newEntry.category} 
                  onChange={(e) => setNewEntry({
                    ...newEntry, 
                    category: e.target.value as TimetableEntry['category']
                  })}
                  className="col-span-3 p-2 border rounded w-full"
                >
                  <option value="routine">Routine</option>
                  <option value="work">Work</option>
                  <option value="meal">Meal</option>
                  <option value="exercise">Exercise</option>
                  <option value="leisure">Leisure</option>
                  <option value="learning">Learning</option>
                  <option value="rest">Rest</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="new-description" className="text-right col-span-1">
                  Description
                </label>
                <textarea 
                  id="new-description" 
                  value={newEntry.description || ''} 
                  onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                  className="col-span-3 p-2 border rounded w-full h-20"
                  placeholder="Add optional description"
                />
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={addNewEntry} className="bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white">
              Add Activity
            </Button>
            <Button variant="outline" onClick={() => setIsAddEntryDrawerOpen(false)}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Color Theme Dialog */}
      <Dialog open={isColorThemeDialogOpen} onOpenChange={setIsColorThemeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Timetable Theme</DialogTitle>
            <DialogDescription>
              Select a color theme for your timetable.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            <div 
              className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${colorTheme === 'soft' ? 'ring-2 ring-wellness-darkGreen' : ''}`}
              onClick={() => setColorTheme('soft')}
            >
              <h3 className="font-medium text-center mb-2">Soft</h3>
              <div className="flex flex-wrap gap-1">
                {(['routine', 'work', 'meal', 'exercise', 'leisure'] as const).map(category => (
                  <div 
                    key={category} 
                    className={`h-4 w-4 rounded-full ${'bg-slate-100 text-slate-800'.split(' ')[0]}`}
                  ></div>
                ))}
              </div>
            </div>
            <div 
              className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${colorTheme === 'vibrant' ? 'ring-2 ring-wellness-darkGreen' : ''}`}
              onClick={() => setColorTheme('vibrant')}
            >
              <h3 className="font-medium text-center mb-2">Vibrant</h3>
              <div className="flex flex-wrap gap-1">
                {(['routine', 'work', 'meal', 'exercise', 'leisure'] as const).map(category => (
                  <div 
                    key={category} 
                    className={`h-4 w-4 rounded-full ${'bg-slate-200 text-slate-900'.split(' ')[0]}`}
                  ></div>
                ))}
              </div>
            </div>
            <div 
              className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${colorTheme === 'pastel' ? 'ring-2 ring-wellness-darkGreen' : ''}`}
              onClick={() => setColorTheme('pastel')}
            >
              <h3 className="font-medium text-center mb-2">Pastel</h3>
              <div className="flex flex-wrap gap-1">
                {(['routine', 'work', 'meal', 'exercise', 'leisure'] as const).map(category => (
                  <div 
                    key={category} 
                    className={`h-4 w-4 rounded-full ${'bg-slate-50 text-slate-700'.split(' ')[0]}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setIsColorThemeDialogOpen(false)} className="bg-wellness-darkGreen hover:bg-wellness-mediumGreen text-white">
              Apply Theme
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimetableGenerator;
