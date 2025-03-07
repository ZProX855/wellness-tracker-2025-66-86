import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from '@/hooks/use-mobile';
import TimetableVisualizer from '@/components/TimetableVisualizer';
import useLocalStorage from '@/hooks/useLocalStorage';
import useSessionStorage from '@/hooks/useSessionStorage';
import VoiceAssistant from '@/components/timetable/VoiceAssistant';
import ConversationSummary from '@/components/timetable/ConversationSummary';
import TimetableGeneratorComponent from '@/components/timetable/TimetableGenerator';
import ChatModeSelector from '@/components/timetable/ChatModeSelector';
import TimetableInsights from '@/components/timetable/TimetableInsights';

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
  const [isTextChatActive, setIsTextChatActive] = useState(false);
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
  const [conversationData, setConversationData] = useState<any>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isGeneratingAfterConversation, setIsGeneratingAfterConversation] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [localConversation, setLocalConversation] = useState<{
    question: string;
    answer: string;
  }[]>([]);
  const [chatMode, setChatMode] = useState<'voice' | null>(null);
  const [showInsights, setShowInsights] = useSessionStorage('show-timetable-insights', false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (timetable && timetable.length > 0) {
      setShowTimetable(true);
    }

    const handleSpeechTranscript = (event: CustomEvent) => {
      if (event.detail && event.detail.transcript) {
        setTranscript(prev => [...prev, event.detail.transcript]);
        const updatedTranscript = [...transcript, event.detail.transcript];
        localStorage.setItem('lastConversationTranscript', JSON.stringify(updatedTranscript));
      }
    };

    const handleConversationTranscript = (event: CustomEvent) => {
      if (event.detail && event.detail.transcript) {
        setTranscript(event.detail.transcript);
        localStorage.setItem('lastConversationTranscript', JSON.stringify(event.detail.transcript));
      }
    };

    try {
      const savedTranscript = localStorage.getItem('lastConversationTranscript');
      if (savedTranscript) {
        const parsed = JSON.parse(savedTranscript);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log("Loading saved transcript on mount:", parsed);
          setTranscript(parsed);
        }
      }
    } catch (error) {
      console.error("Error loading saved transcript:", error);
    }

    window.addEventListener('speechTranscript', handleSpeechTranscript as EventListener);
    window.addEventListener('conversationTranscript', handleConversationTranscript as EventListener);
    return () => {
      window.removeEventListener('speechTranscript', handleSpeechTranscript as EventListener);
      window.removeEventListener('conversationTranscript', handleConversationTranscript as EventListener);
    };
  }, [transcript]);

  const handleAddResponse = (question: string, answer: string) => {
    if (question && !answer) {
      setResponses(prev => [...prev, {
        question,
        answer: ''
      }]);
      setLocalConversation(prev => [...prev, {
        question,
        answer: ''
      }]);
    } else if (answer) {
      setResponses(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].answer = answer;
        }
        return updated;
      });
      setLocalConversation(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].answer = answer;
        }
        return updated;
      });
    }
  };

  const handleConversationComplete = () => {
    setConversationComplete(true);
    setIsGeneratingAfterConversation(true);
    setTimeout(() => {
      generateTimetableFromLocalData();
    }, 1000);
  };

  const generateTimetableFromLocalData = () => {
    setIsGeneratingAfterConversation(false);
    setShowTimetable(true);
    setShowInsights(true);
  };

  const handleEditEntry = (entry: TimetableEntry, index: number) => {
    setEditEntry({
      ...entry
    });
    setEditIndex(index);
    setIsDrawerOpen(true);
  };

  const saveEditedEntry = () => {
    if (editEntry && editIndex !== null) {
      const updatedTimetable = [...timetable];
      updatedTimetable[editIndex] = editEntry;
      setTimetable(updatedTimetable);
      setIsDrawerOpen(false);
      toast({
        title: "Entry Updated",
        description: "Your timetable has been updated."
      });
    }
  };

  const addNewEntry = () => {
    if (newEntry.time && newEntry.activity) {
      setTimetable(prev => [...prev, {
        ...newEntry,
        completed: false,
        important: false
      }]);
      setIsAddEntryDrawerOpen(false);
      setNewEntry({
        time: '',
        activity: '',
        category: 'routine',
        description: ''
      });
      toast({
        title: "Entry Added",
        description: "New activity has been added to your timetable."
      });
    } else {
      toast({
        title: "Missing Information",
        description: "Please provide both time and activity.",
        variant: "destructive"
      });
    }
  };

  const deleteEntry = (entry: TimetableEntry, index: number) => {
    const updatedTimetable = [...timetable];
    updatedTimetable.splice(index, 1);
    setTimetable(updatedTimetable);
    toast({
      title: "Entry Deleted",
      description: "Activity has been removed from your timetable."
    });
  };

  const toggleCompleted = (index: number) => {
    const updatedTimetable = [...timetable];
    updatedTimetable[index].completed = !updatedTimetable[index].completed;
    setTimetable(updatedTimetable);
  };

  const toggleImportant = (index: number) => {
    const updatedTimetable = [...timetable];
    updatedTimetable[index].important = !updatedTimetable[index].important;
    setTimetable(updatedTimetable);
  };

  const shareTimetable = async () => {
    try {
      const timetableText = timetable.map(entry => `${entry.time} - ${entry.activity}${entry.description ? ` (${entry.description})` : ''}`).join('\n');
      if (navigator.share) {
        await navigator.share({
          title: 'My Daily Timetable',
          text: timetableText
        });
        toast({
          title: "Timetable Shared",
          description: "Your timetable has been shared successfully."
        });
      } else {
        await navigator.clipboard.writeText(timetableText);
        toast({
          title: "Copied to Clipboard",
          description: "Your timetable has been copied to the clipboard."
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

  const downloadTimetable = () => {
    const timetableText = timetable.map(entry => `${entry.time} - ${entry.activity}${entry.description ? ` (${entry.description})` : ''}`).join('\n');
    const blob = new Blob([timetableText], {
      type: 'text/plain'
    });
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
      description: "Your timetable has been downloaded as a text file."
    });
  };

  const handleStartVoiceConversation = () => {
    setIsConversationActive(true);
    setShowTimetable(false);
    setShowInsights(false);
  };

  const handleHideInsights = () => {
    setShowInsights(false);
  };

  const handleHideTimetable = () => {
    setShowTimetable(false);
  };

  return <div className="min-h-screen bg-gradient-to-b from-wellness-softBeige to-wellness-softGreen/30">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-wellness-darkGreen hover:text-wellness-mediumGreen transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-medium text-wellness-darkGreen mt-4 mb-2 animate-fade-in">
              AI Timetable Generator
            </h1>
            <p className="text-wellness-charcoal animate-fade-in">
              Have a conversation with our AI voice assistant to create your personalized daily timetable.
            </p>
          </div>
          
          <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-6 border border-wellness-softGreen/30 shadow-sm mb-8 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-medium text-wellness-darkGreen mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-wellness-mediumGreen" />
              AI Voice Assistant
            </h2>
            
            <ChatModeSelector 
              chatMode={chatMode} 
              setChatMode={setChatMode} 
              isConversationActive={isConversationActive} 
              isTextChatActive={isTextChatActive} 
            />
            
            {(chatMode === 'voice' || chatMode === null) && 
              <VoiceAssistant 
                isConversationActive={isConversationActive} 
                setIsConversationActive={handleStartVoiceConversation} 
                onConversationComplete={handleConversationComplete} 
                onResponses={handleAddResponse} 
                onSetConversationId={setCurrentConversationId}
                onHideInsights={handleHideInsights}
                onHideTimetable={handleHideTimetable}
              />
            }
            
            <ConversationSummary responses={responses} showSummary={chatMode === 'voice'} />
          </div>
          
          {showTimetable && !loadingTimetable && !isGeneratingAfterConversation && timetable.length > 0 && showInsights && <TimetableInsights timetable={timetable} conversationData={conversationData} localConversation={localConversation} responses={responses} />}
          
          {(isGeneratingAfterConversation || loadingTimetable) && <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full h-16 w-16 border-b-2 border-t-2 border-wellness-darkGreen animate-spin mb-4"></div>
              <p className="text-wellness-darkGreen font-medium text-lg">Generating your personalized timetable...</p>
              <p className="text-wellness-charcoal text-sm mt-2">Analyzing your preferences and creating the perfect schedule for you</p>
            </div>}
          
          {showTimetable && !loadingTimetable && !isGeneratingAfterConversation && timetable.length > 0 && <TimetableVisualizer timetable={timetable} onEditEntry={handleEditEntry} onDeleteEntry={deleteEntry} onToggleCompleted={toggleCompleted} onToggleImportant={toggleImportant} onDownload={downloadTimetable} onShare={shareTimetable} onRegenerate={() => {
          const timetableGenerator = document.getElementById('timetable-generator');
          if (timetableGenerator) {
            timetableGenerator.scrollIntoView({
              behavior: 'smooth'
            });
          }
        }} colorTheme={colorTheme} />}
          
          <div id="timetable-generator" className="animate-fade-in">
            {showTimetable && !loadingTimetable && !isGeneratingAfterConversation && <TimetableGeneratorComponent conversationData={conversationData} localConversation={localConversation} responses={responses} transcript={transcript} setTimetable={setTimetable} setShowTimetable={setShowTimetable} timetable={timetable} currentConversationId={currentConversationId} />}
          </div>
          
          {!showTimetable && !isConversationActive && !isTextChatActive && !loadingTimetable && !isGeneratingAfterConversation && timetable.length === 0 && !conversationComplete && !chatMode}
        </div>
      </main>
      
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Timetable Entry</DrawerTitle>
            <DrawerDescription>
              Make changes to your timetable entry below.
            </DrawerDescription>
          </DrawerHeader>
          {editEntry && <div className="px-4 py-2">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="edit-time" className="text-right col-span-1">
                    Time
                  </label>
                  <input id="edit-time" type="text" value={editEntry.time} onChange={e => setEditEntry({
                ...editEntry,
                time: e.target.value
              })} className="col-span-3 p-2 border rounded w-full" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="edit-activity" className="text-right col-span-1">
                    Activity
                  </label>
                  <input id="edit-activity" type="text" value={editEntry.activity} onChange={e => setEditEntry({
                ...editEntry,
                activity: e.target.value
              })} className="col-span-3 p-2 border rounded w-full" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="edit-category" className="text-right col-span-1">
                    Category
                  </label>
                  <select id="edit-category" value={editEntry.category} onChange={e => setEditEntry({
                ...editEntry,
                category: e.target.value as TimetableEntry['category']
              })} className="col-span-3 p-2 border rounded w-full">
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
                  <textarea id="edit-description" value={editEntry.description || ''} onChange={e => setEditEntry({
                ...editEntry,
                description: e.target.value
              })} className="col-span-3 p-2 border rounded w-full h-20" placeholder="Add optional description" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-span-1"></div>
                  <div className="col-span-3 flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={editEntry.completed || false} onChange={e => setEditEntry({
                    ...editEntry,
                    completed: e.target.checked
                  })} className="rounded border-gray-300 text-wellness-darkGreen" />
                      <span>Completed</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={editEntry.important || false} onChange={e => setEditEntry({
                    ...editEntry,
                    important: e.target.checked
                  })} className="rounded border-gray-300 text-wellness-darkGreen" />
                      <span>Important</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>}
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
                <input id="new-time" type="text" value={newEntry.time} onChange={e => setNewEntry({
                ...newEntry,
                time: e.target.value
              })} className="col-span-3 p-2 border rounded w-full" placeholder="e.g. 8:00 AM" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="new-activity" className="text-right col-span-1">
                  Activity
                </label>
                <input id="new-activity" type="text" value={newEntry.activity} onChange={e => setNewEntry({
                ...newEntry,
                activity: e.target.value
              })} className="col-span-3 p-2 border rounded w-full" placeholder="e.g. Morning Exercise" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="new-category" className="text-right col-span-1">
                  Category
                </label>
                <select id="new-category" value={newEntry.category} onChange={e => setNewEntry({
                ...newEntry,
                category: e.target.value as TimetableEntry['category']
              })} className="col-span-3 p-2 border rounded w-full">
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
                <textarea id="new-description" value={newEntry.description} onChange={e => setNewEntry({
                ...newEntry,
                description: e.target.value
              })} className="col-span-3 p-2 border rounded w-full h-20" placeholder="Add optional description" />
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
    </div>;
};

export default TimetableGenerator;
