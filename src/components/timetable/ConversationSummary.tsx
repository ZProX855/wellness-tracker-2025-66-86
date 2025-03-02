
import React from 'react';

interface ConversationSummaryProps {
  responses: { question: string; answer: string }[];
  showSummary?: boolean;
}

const ConversationSummary: React.FC<ConversationSummaryProps> = ({ 
  responses, 
  showSummary = true 
}) => {
  if (responses.length === 0 || !showSummary) {
    return null;
  }
  
  return (
    <div className="mt-4 border-t border-wellness-softGreen/20 pt-4 animate-fade-in">
      <h3 className="text-sm font-medium text-wellness-darkGreen mb-2">✨ Conversation Summary</h3>
      <div className="space-y-3 max-h-60 overflow-y-auto p-2 rounded-md bg-white/50 backdrop-blur-sm">
        {responses.map((response, i) => (
          <div key={i} className="space-y-1 hover:bg-white/60 p-2 rounded-md transition-colors">
            {response.question && (
              <p className="text-sm font-medium text-wellness-darkGreen">
                <span className="text-wellness-mediumGreen">💬</span> {response.question.length > 100 ? 
                  `${response.question.substring(0, 100)}...` : response.question}
              </p>
            )}
            {response.answer && (
              <p className="text-sm text-wellness-charcoal pl-4">
                <span className="text-wellness-mediumGreen">👤</span> {response.answer.length > 80 ? 
                  `${response.answer.substring(0, 80)}...` : response.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationSummary;
