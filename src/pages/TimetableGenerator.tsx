import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Edit, Save, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useConversation } from '@11labs/react';
import { useMediaQuery } from '@/hooks/use-mobile';

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
}

interface ConversationResponse {
  question: string;
  answer: string;
}

const TimetableGenerator = () => {
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [responses, setResponses] = useState<ConversationResponse[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEntry, setEditEntry] = useState<TimetableEntry | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  
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
        
        // Generate timetable from collected responses
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
    } catch (error) {
      console.error("Error ending conversation:", error);
    }
  };

  // Generate timetable using Gemini API
  const generateTimetable = async () => {
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
      const timetableText = data.candidates[0].content.parts[0].text;
      
      // Parse the timetable text into structured data
      const parsedTimetable = parseTimetableText(timetableText);
      setTimetable(parsedTimetable);
      
      toast({
        title: "Timetable Generated",
        description: "Your personalized timetable has been created!",
      });
    } catch (error) {
      console.error("Error generating timetable:", error);
      toast({
        title: "Generation Failed",
        description: "There was a problem generating your timetable. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingTimetable(false);
    }
  };

  // Parse the timetable text into structured data
  const parseTimetableText = (text: string): TimetableEntry[] => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const entries: TimetableEntry[] = [];
    
    const timeRegex = /(\d{1,2}:\d{2}\s*(?:AM|PM))/i;
    
    for (const line of lines) {
      // Skip headers or non-timetable lines
      if (!timeRegex.test(line)) continue;
      
      const timeMatch = line.match(timeRegex);
      if (!timeMatch) continue;
      
      const time = timeMatch[1];
      let activityText = line.substring(line.indexOf('-') + 1).trim();
      
      // Try to determine the category from the activity description
      let category: TimetableEntry['category'] = 'routine';
      
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
      
      entries.push({
        time,
        activity: activityText,
        category
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

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Download timetable as text file
  const downloadTimetable = () => {
    const timetableText = timetable.map(entry => 
      `${entry.time} - ${entry.activity}`
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

  // Get color based on activity category
  const getCategoryColor = (category: TimetableEntry['category']) => {
    switch (category) {
      case 'routine': return 'bg-slate-100 text-slate-800';
      case 'work': return 'bg-blue-100 text-blue-800';
      case 'meal': return 'bg-amber-100 text-amber-800';
      case 'exercise': return 'bg-green-100 text-green-800';
      case 'leisure': return 'bg-purple-100 text-purple-800';
      case 'learning': return 'bg-indigo-100 text-indigo-800';
      case 'rest': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          {timetable.length > 0 && (
            <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-6 border border-wellness-softGreen/30 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-wellness-darkGreen flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Your Personalized Timetable
                </h2>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleEditMode}
                    className="text-wellness-darkGreen border-wellness-darkGreen/30"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {isEditMode ? 'View Mode' : 'Edit Mode'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadTimetable}
                    className="text-wellness-darkGreen border-wellness-darkGreen/30"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Time</TableHead>
                      <TableHead className="w-2/4">Activity</TableHead>
                      <TableHead className="w-1/4">Category</TableHead>
                      {isEditMode && <TableHead className="w-1/12">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timetable.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{entry.time}</TableCell>
                        <TableCell>{entry.activity}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(entry.category)}`}>
                            {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
                          </span>
                        </TableCell>
                        {isEditMode && (
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditEntry(entry, index)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Category Legend */}
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="text-xs font-medium mr-2">Categories:</span>
                {(['routine', 'work', 'meal', 'exercise', 'leisure', 'learning', 'rest'] as const).map(category => (
                  <span 
                    key={category} 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Loading Indicator for Timetable Generation */}
          {loadingTimetable && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wellness-darkGreen"></div>
              <p className="ml-3 text-wellness-darkGreen font-medium">Generating your timetable...</p>
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
              </div>
            </div>
          )}
          <DrawerFooter>
            <Button onClick={saveEditedEntry}>Save Changes</Button>
            <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default TimetableGenerator;
