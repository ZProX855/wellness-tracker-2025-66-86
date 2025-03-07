
import { useState, useRef, useEffect } from 'react';

interface UseSpeechRecognitionProps {
  onTranscript?: (transcript: string) => void;
}

export const useSpeechRecognition = ({ onTranscript }: UseSpeechRecognitionProps = {}) => {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const latestTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        
        console.log("Local speech recognition transcript:", latestTranscript);
        
        // Update local transcript state
        setTranscript(prev => {
          const updatedTranscript = [...prev, latestTranscript];
          
          // Save to localStorage immediately for persistence
          try {
            localStorage.setItem('lastConversationTranscript', JSON.stringify(updatedTranscript));
            console.log("Saved transcript to localStorage:", updatedTranscript);
          } catch (error) {
            console.error("Error saving transcript to localStorage:", error);
          }
          
          return updatedTranscript;
        });
        
        // Call the provided callback if any
        if (onTranscript) {
          onTranscript(latestTranscript);
        }
        
        // Dispatch event for other components to use
        window.dispatchEvent(new CustomEvent('speechTranscript', { 
          detail: { transcript: latestTranscript } 
        }));
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };
    } else {
      console.warn("Speech Recognition API is not supported in this browser");
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  // Update localStorage whenever transcript changes
  useEffect(() => {
    if (transcript.length > 0) {
      try {
        localStorage.setItem('lastConversationTranscript', JSON.stringify(transcript));
        console.log("Updated transcript in localStorage:", transcript);
      } catch (error) {
        console.error("Error updating transcript in localStorage:", error);
      }
    }
  }, [transcript]);

  const startRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsActive(true);
        console.log("Local speech recognition started");
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    }
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsActive(false);
        console.log("Local speech recognition stopped");
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
  };

  return {
    isActive,
    transcript,
    startRecognition,
    stopRecognition,
  };
};
