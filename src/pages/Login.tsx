// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthForm } from "@/components/auth/AuthForm";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleAuthSuccess = () => {
    toast.success("Logged in successfully!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-center mb-4">Welcome Back</h2>
          
          <div className="flex justify-center mb-4">
            <Button 
              variant={authMode === 'signin' ? 'default' : 'outline'}
              onClick={() => setAuthMode('signin')}
              className="mr-2"
            >
              Sign In
            </Button>
            <Button 
              variant={authMode === 'signup' ? 'default' : 'outline'}
              onClick={() => setAuthMode('signup')}
            >
              Sign Up
            </Button>
          </div>

          <AuthForm mode={authMode} onSuccess={handleAuthSuccess} />

          <div className="text-center mt-4">
            <Button 
              variant="link" 
              onClick={() => navigate('/onboarding')}
              className="text-sm"
            >
              New to our platform? Start onboarding
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;