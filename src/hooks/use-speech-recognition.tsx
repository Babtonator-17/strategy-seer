
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useSpeechRecognition = (onResult: (transcript: string) => void) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const speechRecognition = useRef<SpeechRecognition | null>(null);

  const setupSpeechRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = (window.SpeechRecognition || 
        window.webkitSpeechRecognition) as unknown as SpeechRecognitionStatic;
      
      if (SpeechRecognitionAPI) {
        speechRecognition.current = new SpeechRecognitionAPI();
        
        if (speechRecognition.current) {
          speechRecognition.current.continuous = false;
          speechRecognition.current.interimResults = false;
          
          speechRecognition.current.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
            setIsListening(false);
          };
          
          speechRecognition.current.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
            toast({
              title: "Voice Input Error",
              description: "Could not recognize speech. Please try again or type your query.",
              variant: "destructive"
            });
          };
          
          speechRecognition.current.onend = () => {
            setIsListening(false);
          };
        }
      }
    }
  };

  const toggleListening = () => {
    if (!speechRecognition.current) {
      setupSpeechRecognition();
    }
    
    if (speechRecognition.current) {
      if (isListening) {
        speechRecognition.current.stop();
        setIsListening(false);
      } else {
        speechRecognition.current.start();
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak your query now",
        });
      }
    } else {
      toast({
        title: "Voice Input Error",
        description: "Your browser doesn't support voice input. Please type your query instead.",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    setupSpeechRecognition();
    
    return () => {
      if (speechRecognition.current && isListening) {
        speechRecognition.current.stop();
      }
    };
  }, []);

  return { isListening, toggleListening };
};

export default useSpeechRecognition;
