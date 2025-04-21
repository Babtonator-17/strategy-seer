
import React from 'react';
import QueryInput from './QueryInput';
import LoginPrompt from './LoginPrompt';

interface AIAssistantInputProps {
  user: any;
  authLoading: boolean;
  loading: boolean;
  error: string | null;
  query: string;
  setQuery: (q: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isListening: boolean;
  toggleListening: () => void;
  retryLastMessage: () => void;
  isMobile: boolean;
  onTryWithoutLogin: () => void;
}

const AIAssistantInput: React.FC<AIAssistantInputProps> = ({
  user,
  authLoading,
  loading,
  error,
  query,
  setQuery,
  onSubmit,
  isListening,
  toggleListening,
  retryLastMessage,
  isMobile,
  onTryWithoutLogin
}) => {
  if (!user && !authLoading) {
    return <LoginPrompt loading={authLoading} onTryWithoutLogin={onTryWithoutLogin} />;
  }
  if (authLoading) {
    return <LoginPrompt loading={authLoading} onTryWithoutLogin={onTryWithoutLogin} />;
  }
  return (
    <QueryInput
      query={query}
      setQuery={setQuery}
      loading={loading}
      error={error}
      onSubmit={onSubmit}
      isListening={isListening}
      toggleListening={toggleListening}
      retryLastMessage={retryLastMessage}
      isMobile={isMobile}
    />
  );
};

export default AIAssistantInput;
