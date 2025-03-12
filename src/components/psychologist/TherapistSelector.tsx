
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { TherapistPersonality } from '@/types/psychologist';

interface TherapistSelectorProps {
  selectedTherapist: TherapistPersonality;
  onSelect: (therapist: TherapistPersonality) => void;
}

const TherapistSelector: React.FC<TherapistSelectorProps> = ({ 
  selectedTherapist, 
  onSelect 
}) => {
  const therapists: TherapistPersonality[] = [
    {
      id: '1',
      name: 'Dr. Sarah',
      style: 'supportive',
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah voice
      description: 'Warm, empathetic, and supportive. Dr. Sarah creates a safe space for sharing.',
      introMessage: "Hi there, I'm Dr. Sarah. How are you feeling today? I'm here to listen and support you."
    },
    {
      id: '2',
      name: 'Dr. Michael',
      style: 'analytical',
      voiceId: 'N2lVS1w4EtoT3dr4eOWO', // Callum voice
      description: 'Rational, methodical, and insight-oriented. Dr. Michael helps you understand patterns in your thinking.',
      introMessage: "Hello, I'm Dr. Michael. I specialize in cognitive behavioral approaches. Let's explore what's on your mind today."
    },
    {
      id: '3',
      name: 'Dr. Amy',
      style: 'motivational',
      voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte voice
      description: 'Energetic, goal-oriented, and positive. Dr. Amy helps you find your inner strength.',
      introMessage: "Hi! I'm Dr. Amy. I'm here to help you unlock your potential and achieve your goals. What would you like to work on today?"
    }
  ];

  return (
    <div>
      <h3 className="text-lg font-medium text-wellness-darkGreen mb-4">Choose Your Therapist</h3>
      
      <RadioGroup 
        value={selectedTherapist.id} 
        onValueChange={(value) => {
          const therapist = therapists.find(t => t.id === value);
          if (therapist) onSelect(therapist);
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {therapists.map((therapist) => (
          <div key={therapist.id} className="flex items-start space-x-2">
            <RadioGroupItem value={therapist.id} id={`therapist-${therapist.id}`} />
            <div className="grid gap-1.5">
              <Label htmlFor={`therapist-${therapist.id}`} className="font-medium">
                {therapist.name}
              </Label>
              <p className="text-sm text-wellness-charcoal/70">
                {therapist.description}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default TherapistSelector;
