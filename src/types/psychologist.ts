
export interface MoodEntry {
  id: string;
  date: string;
  mood: 'happy' | 'content' | 'neutral' | 'sad' | 'anxious' | 'stressed' | 'angry' | 'other';
  intensity: number; // 1-10
  notes?: string;
  factors?: string[];
  detectedEmotions?: string[];
}

export interface ConversationMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  emotionalContext?: {
    detectedEmotions: string[];
    intensity: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  };
}

export interface TherapistPersonality {
  id: string;
  name: string;
  style: 'supportive' | 'analytical' | 'motivational' | 'spiritual' | 'practical';
  voiceId: string;
  description: string;
  introMessage: string;
}

export interface TherapySession {
  id: string;
  date: string;
  duration: number; // in seconds
  conversationId: string;
  summary?: string;
  insights?: string[];
  moodBefore?: MoodEntry;
  moodAfter?: MoodEntry;
}

export interface TherapyGoal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  progress: number; // 0-100
  status: 'active' | 'completed' | 'paused';
  milestones?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

export interface UserPsychProfile {
  interests: string[];
  personalityTraits: string[];
  copingStrategies: string[];
  stressors: string[];
  supportSystems: string[];
  goals: TherapyGoal[];
}
