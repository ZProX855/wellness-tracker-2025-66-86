
import React from 'react';

interface ConversationSummaryProps {
  responses: { question: string; answer: string }[];
  showSummary?: boolean;
}

const ConversationSummary: React.FC<ConversationSummaryProps> = ({ 
  responses, 
  showSummary = false // Change default to false to hide it by default
}) => {
  // Always return null to hide the component from UI
  return null;
};

export default ConversationSummary;
