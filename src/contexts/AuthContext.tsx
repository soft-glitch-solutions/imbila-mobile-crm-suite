
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  businessProfile: any | null;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshBusinessProfile: () => Promise<void>;
  createBusinessProfile: (data: any) => Promise<any>;
  updateBusinessProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [businessProfile, setBusinessProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshProfile = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading profile:', error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const refreshBusinessProfile = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        console.error('Error loading business profile:', error);
        return;
      }
      
      setBusinessProfile(data || null);
    } catch (error) {
      console.error('Error refreshing business profile:', error);
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      try {
        setLoading(true);
        
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (event === 'SIGNED_OUT') {
              setProfile(null);
              setBusinessProfile(null);
            }
            
            if (event === 'SIGNED_IN' && currentSession?.user) {
              setTimeout(() => {
                refreshProfile();
                refreshBusinessProfile();
              }, 0);
            }
          }
        );
        
        // THEN check for existing session
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          await refreshProfile();
          await refreshBusinessProfile();
        }
        
        setLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth setup error:', error);
        setLoading(false);
      }
    };
    
    setupAuth();
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });
      
      if (error) throw error;
      
      toast.success("Sign up successful!");
      return data;
    } catch (error: any) {
      toast.error(error.message || "Sign up failed");
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success("Signed in successfully!");
      return data;
    } catch (error: any) {
      toast.error(error.message || "Sign in failed");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate('/onboarding');
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error(error.message || "Sign out failed");
    }
  };

  const createBusinessProfile = async (data: any) => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      const { data: result, error } = await supabase
        .from('business_profiles')
        .insert({
          owner_id: user.id,
          ...data
        })
        .select()
        .single();
      
      if (error) throw error;
      
      await refreshBusinessProfile();
      return result;
    } catch (error: any) {
      toast.error(error.message || "Failed to create business profile");
      throw error;
    }
  };

  const updateBusinessProfile = async (data: any) => {
    try {
      if (!businessProfile) throw new Error("No business profile found");
      
      const { error } = await supabase
        .from('business_profiles')
        .update(data)
        .eq('id', businessProfile.id);
      
      if (error) throw error;
      
      await refreshBusinessProfile();
      toast.success("Business profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update business profile");
      throw error;
    }
  };

  const value = {
    user,
    session,
    profile,
    businessProfile,
    signUp,
    signIn,
    signOut,
    loading,
    refreshProfile,
    refreshBusinessProfile,
    createBusinessProfile,
    updateBusinessProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
