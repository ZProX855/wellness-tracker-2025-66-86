
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { MoodEntry } from '@/types/psychologist';
import { useToast } from '@/hooks/use-toast';

interface MoodOption {
  value: MoodEntry['mood'];
  label: string;
  emoji: string;
}

const MoodTracker: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood'] | null>(null);
  const [intensity, setIntensity] = useState([5]);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const moodOptions: MoodOption[] = [
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'content', label: 'Content', emoji: '😌' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
    { value: 'anxious', label: 'Anxious', emoji: '😰' },
    { value: 'stressed', label: 'Stressed', emoji: '😫' },
    { value: 'angry', label: 'Angry', emoji: '😠' },
    { value: 'other', label: 'Other', emoji: '🤔' }
  ];

  const saveMood = () => {
    if (!selectedMood) {
      toast({
        title: "Missing Selection",
        description: "Please select a mood before saving.",
        variant: "destructive"
      });
      return;
    }

    const moodEntry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood: selectedMood,
      intensity: intensity[0],
      notes: notes.trim() || undefined
    };

    // Save to localStorage for now
    const savedMoods = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    localStorage.setItem('moodEntries', JSON.stringify([...savedMoods, moodEntry]));
    
    toast({
      title: "Mood Saved",
      description: "Your mood has been recorded successfully."
    });
    
    // Reset form
    setSelectedMood(null);
    setIntensity([5]);
    setNotes('');
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-wellness-darkGreen mb-4">How are you feeling?</h3>
      
      <div className="grid grid-cols-4 gap-2 mb-6">
        {moodOptions.map((mood) => (
          <Button
            key={mood.value}
            variant={selectedMood === mood.value ? "default" : "outline"}
            className={`flex flex-col items-center h-auto py-3 ${
              selectedMood === mood.value ? "bg-wellness-darkGreen text-white" : ""
            }`}
            onClick={() => setSelectedMood(mood.value)}
          >
            <span className="text-2xl mb-1">{mood.emoji}</span>
            <span className="text-xs">{mood.label}</span>
          </Button>
        ))}
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <Label htmlFor="intensity">Intensity</Label>
          <span className="text-sm font-medium">{intensity[0]}/10</span>
        </div>
        <Slider
          id="intensity"
          min={1}
          max={10}
          step={1}
          value={intensity}
          onValueChange={setIntensity}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-wellness-charcoal/70">Mild</span>
          <span className="text-xs text-wellness-charcoal/70">Intense</span>
        </div>
      </div>
      
      <div className="mb-6">
        <Label htmlFor="notes" className="mb-2 block">
          Notes (optional)
        </Label>
        <Textarea
          id="notes"
          placeholder="What's making you feel this way?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="resize-none"
          rows={3}
        />
      </div>
      
      <Button onClick={saveMood} className="w-full">
        Save Mood
      </Button>
    </div>
  );
};

export default MoodTracker;
