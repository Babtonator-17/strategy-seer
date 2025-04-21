
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

interface LoginPromptProps {
  loading: boolean;
  onTryWithoutLogin: () => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ loading, onTryWithoutLogin }) => {
  const { tryWithoutLogin } = useAuth();
  
  if (loading) {
    return (
      <div className="w-full flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  const handleTryWithoutLogin = async () => {
    try {
      await tryWithoutLogin();
      // Call the parent component's callback to update UI
      onTryWithoutLogin();
    } catch (error) {
      console.error('Error in try without login:', error);
    }
  };
  
  return (
    <div className="w-full space-y-3">
      <div className="text-center p-3 bg-amber-900/20 border border-amber-900/30 rounded-md">
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <p className="font-medium text-amber-500">Login Recommended</p>
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          Sign in to use all assistant features
        </p>
        <p className="text-xs text-muted-foreground">
          You can try the assistant without login but your conversations won't be saved
        </p>
      </div>
      <div className="flex gap-2 justify-center">
        <Button className="flex-1" asChild>
          <Link to="/auth">
            Login or Create Account
          </Link>
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={handleTryWithoutLogin}
          type="button"
        >
          Try Without Login
        </Button>
      </div>
    </div>
  );
};

export default LoginPrompt;
