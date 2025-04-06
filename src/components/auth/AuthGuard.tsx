
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading, businessProfile, refreshBusinessProfile } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (user && !businessProfile) {
          await refreshBusinessProfile();
        }
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [user, loading, businessProfile, refreshBusinessProfile]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-imbila-blue border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/onboarding" />;
  }

  return <>{children}</>;
};

export default AuthGuard;
