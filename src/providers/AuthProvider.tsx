
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BrokerType } from '@/services/broker/types';
import { connectToBroker, setCurrentBrokerConnection } from '@/services/broker/connectionManager';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        toast({
          title: "Logged in successfully",
          description: `Welcome${session.user.email ? ' ' + session.user.email : ''}!`,
        });
        
        // Auto-connect to demo broker when user logs in
        connectToDemoAccount();
      }
      
      if (event === 'SIGNED_OUT') {
        toast({
          title: "Logged out",
          description: "You have been logged out successfully",
        });
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Auto-connect to demo broker when loaded with existing session
        connectToDemoAccount();
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  // Connect to demo broker account
  const connectToDemoAccount = async () => {
    try {
      // Connect to demo broker
      const success = await connectToBroker({
        type: BrokerType.DEMO,
        name: "Demo Trading Account"
      });
      
      if (success) {
        // For demo purposes, create a connection ID
        const demoConnectionId = `demo_${Math.random().toString(36).substring(2, 10)}`;
        
        // Set as current connection
        setCurrentBrokerConnection(BrokerType.DEMO, demoConnectionId);
        
        console.log('Connected to demo broker account successfully');
      }
    } catch (error) {
      console.error('Failed to connect to demo broker:', error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value = {
    session,
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
