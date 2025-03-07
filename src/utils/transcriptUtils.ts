
export const saveTranscript = (transcript: string[]) => {
  try {
    localStorage.setItem('lastConversationTranscript', JSON.stringify(transcript));
    console.log("Saved transcript to localStorage:", transcript);
  } catch (error) {
    console.error("Error saving transcript to localStorage:", error);
  }
};

export const loadTranscript = (): string[] => {
  try {
    const savedTranscript = localStorage.getItem('lastConversationTranscript');
    if (savedTranscript) {
      return JSON.parse(savedTranscript);
    }
  } catch (error) {
    console.error("Error loading saved transcript:", error);
  }
  return [];
};

export const dispatchTranscriptEvent = (transcript: string[]) => {
  window.dispatchEvent(new CustomEvent('conversationTranscript', { 
    detail: { transcript } 
  }));
};
