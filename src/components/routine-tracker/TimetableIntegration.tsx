
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Check, 
  X, 
  Sparkles, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { TimetableData, HabitSuggestion, Task } from '../../types/routine';
import { getSavedTimetables, generateHabitsFromTimetable, convertSuggestionsToTasks } from '../../utils/timetableIntegration';

interface TimetableIntegrationProps {
  onAddTasks: (tasks: Task[]) => void;
  onClose: () => void;
}

const TimetableIntegration: React.FC<TimetableIntegrationProps> = ({ onAddTasks, onClose }) => {
  const [timetables, setTimetables] = useState<TimetableData[]>([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>('');
  const [habitSuggestions, setHabitSuggestions] = useState<HabitSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('choose');

  useEffect(() => {
    // Load saved timetables
    const loadTimetables = async () => {
      const savedTimetables = getSavedTimetables();
      setTimetables(savedTimetables);
      if (savedTimetables.length > 0) {
        setSelectedTimetableId(savedTimetables[0].id);
      }
    };
    
    loadTimetables();
  }, []);

  const handleTimetableSelect = (timetableId: string) => {
    setSelectedTimetableId(timetableId);
  };

  const generateSuggestions = () => {
    setIsLoading(true);
    setTimeout(() => {
      const selectedTimetable = timetables.find(t => t.id === selectedTimetableId);
      
      if (selectedTimetable) {
        const suggestions = generateHabitsFromTimetable(selectedTimetable);
        setHabitSuggestions(suggestions);
        // Preselect all suggestions
        setSelectedSuggestions(suggestions.map((_, index) => index.toString()));
        setActiveTab('review');
      }
      
      setIsLoading(false);
    }, 1500); // Simulate AI processing time
  };

  const toggleSuggestion = (index: string) => {
    setSelectedSuggestions(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleAddSelectedHabits = () => {
    const selectedHabits = habitSuggestions.filter((_, index) => 
      selectedSuggestions.includes(index.toString())
    );
    
    const newTasks = convertSuggestionsToTasks(selectedHabits);
    onAddTasks(newTasks);
    
    toast.success(`${newTasks.length} habits added from timetable!`);
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTimeOfDayIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌙';
      case 'anytime': return '⏱️';
      default: return '⏱️';
    }
  };

  return (
    <Card className="w-full max-w-4xl bg-white/90 backdrop-blur-sm border border-wellness-softGreen/30 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-wellness-darkGreen to-wellness-mediumGreen text-white rounded-t-lg pb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-wellness-softGreen" />
          <CardTitle className="text-xl">AI Timetable Integration</CardTitle>
        </div>
        <CardDescription className="text-white/80">
          Generate personalized habits based on your existing timetable
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6 pt-4">
          <TabsList className="w-full grid grid-cols-2 bg-wellness-softGreen/20 p-1 rounded-lg">
            <TabsTrigger 
              value="choose" 
              className="data-[state=active]:bg-white data-[state=active]:text-wellness-darkGreen rounded-md"
              disabled={isLoading}
            >
              1. Choose Timetable
            </TabsTrigger>
            <TabsTrigger 
              value="review" 
              className="data-[state=active]:bg-white data-[state=active]:text-wellness-darkGreen rounded-md"
              disabled={habitSuggestions.length === 0 || isLoading}
            >
              2. Review Suggestions
            </TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-4 pb-2">
          <TabsContent value="choose" className="mt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timetable-select">Select your timetable</Label>
                <Select 
                  value={selectedTimetableId} 
                  onValueChange={handleTimetableSelect}
                  disabled={timetables.length === 0}
                >
                  <SelectTrigger 
                    id="timetable-select" 
                    className="border-wellness-softGreen/30 focus:ring-wellness-mediumGreen/20"
                  >
                    <SelectValue placeholder="Select a timetable" />
                  </SelectTrigger>
                  <SelectContent>
                    {timetables.map(timetable => (
                      <SelectItem key={timetable.id} value={timetable.id}>
                        {timetable.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedTimetableId && (
                <div className="border rounded-lg border-wellness-softGreen/30 p-4 bg-wellness-softGreen/5">
                  <h3 className="font-medium text-wellness-darkGreen mb-2 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Timetable Preview
                  </h3>
                  
                  <div className="mt-3">
                    {timetables
                      .find(t => t.id === selectedTimetableId)?.events
                      .map(event => (
                        <div 
                          key={event.id} 
                          className="flex items-center justify-between p-2 my-1 rounded-md border border-wellness-softGreen/20 bg-white"
                        >
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-8 mr-2 rounded-l-md" 
                              style={{ backgroundColor: event.color || '#34d399' }}
                            />
                            <div>
                              <p className="font-medium text-sm">{event.title}</p>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                {' - '}
                                {new Date(event.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                          </div>
                          <Badge className="capitalize bg-wellness-softGreen/20 text-wellness-darkGreen hover:bg-wellness-softGreen/30">
                            {event.day}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-center py-3">
                <Button
                  onClick={generateSuggestions}
                  disabled={!selectedTimetableId || isLoading}
                  className="bg-wellness-darkGreen hover:bg-wellness-darkGreen/90 text-white relative overflow-hidden group"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Suggestions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                      Generate Habit Suggestions
                      <div className="absolute inset-0 w-full h-full bg-wellness-mediumGreen/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="review" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-wellness-softGreen/20">
                <h3 className="font-medium text-wellness-darkGreen flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-wellness-mediumGreen" />
                  AI-Generated Habit Suggestions
                </h3>
                <div className="flex items-center gap-2">
                  <Label htmlFor="select-all" className="text-sm">Select All</Label>
                  <Switch 
                    id="select-all"
                    checked={selectedSuggestions.length === habitSuggestions.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSuggestions(habitSuggestions.map((_, i) => i.toString()));
                      } else {
                        setSelectedSuggestions([]);
                      }
                    }}
                    className="data-[state=checked]:bg-wellness-darkGreen"
                  />
                </div>
              </div>
              
              <ScrollArea className="h-[300px] rounded-md border border-wellness-softGreen/20 p-4">
                <div className="space-y-3">
                  {habitSuggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className="flex items-start p-3 rounded-lg border border-wellness-softGreen/30 bg-white hover:bg-wellness-softGreen/5 transition-colors"
                    >
                      <Checkbox 
                        id={`suggestion-${index}`}
                        checked={selectedSuggestions.includes(index.toString())}
                        onCheckedChange={() => toggleSuggestion(index.toString())}
                        className="mt-1 border-wellness-softGreen data-[state=checked]:bg-wellness-darkGreen"
                      />
                      <div className="ml-3 space-y-1">
                        <label 
                          htmlFor={`suggestion-${index}`}
                          className="font-medium text-wellness-charcoal block cursor-pointer"
                        >
                          {suggestion.title}
                        </label>
                        
                        {suggestion.description && (
                          <p className="text-sm text-gray-500">{suggestion.description}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <Badge className={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority} priority
                          </Badge>
                          
                          <span className="flex items-center px-2 py-1 rounded-full bg-gray-100">
                            {getTimeOfDayIcon(suggestion.timeOfDay)} {suggestion.timeOfDay}
                          </span>
                          
                          <Badge className="bg-wellness-softGreen/20 text-wellness-darkGreen">
                            {suggestion.repeatDays.length} day{suggestion.repeatDays.length !== 1 ? 's' : ''}
                          </Badge>
                          
                          {suggestion.fromTimetable && (
                            <Badge className="bg-blue-100 text-blue-800">
                              From Timetable
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('choose')}
                  className="border-wellness-mediumGreen/30 text-wellness-darkGreen hover:bg-wellness-softGreen/20"
                >
                  Back to Timetables
                </Button>
                
                <Button
                  onClick={handleAddSelectedHabits}
                  disabled={selectedSuggestions.length === 0}
                  className="bg-wellness-darkGreen hover:bg-wellness-darkGreen/90 flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Add {selectedSuggestions.length} Habit{selectedSuggestions.length !== 1 ? 's' : ''}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="flex justify-between border-t border-wellness-softGreen/20 px-6 py-4 bg-wellness-softGreen/5">
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-wellness-charcoal/70 hover:text-wellness-charcoal hover:bg-wellness-softGreen/10"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        
        <div className="text-xs text-wellness-charcoal/60 italic">
          Powered by AI suggestions based on your schedule
        </div>
      </CardFooter>
    </Card>
  );
};

export default TimetableIntegration;
