
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BusinessTypeSelector, { businessTypes } from "@/components/BusinessTypeSelector";
import { ChevronRight, ChevronLeft, LogIn } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const OnboardingStep = ({ 
  children, 
  step, 
  currentStep, 
}: { 
  children: React.ReactNode, 
  step: number, 
  currentStep: number, 
}) => {
  if (step !== currentStep) return null;
  return <div className="animate-fadeIn">{children}</div>;
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, businessProfile, loading, createBusinessProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [selectedBusinessType, setSelectedBusinessType] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>("");
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  
  // Check if the user has completed onboarding
// In your Onboarding component
useEffect(() => {
  // If user is authenticated and has a business profile, go to dashboard
  if (!loading && user && businessProfile) {
    navigate("/dashboard");
    return;
  }
  
  // If user is authenticated but no business profile, stay on onboarding
  if (!loading && user && !businessProfile) {
    return;
  }
  
  // If no user, redirect to login
  if (!loading && !user) {
    navigate("/login");
  }
}, [user, businessProfile, loading, navigate]);
  
  const steps = [
    {
      title: "Welcome to IMBILA",
      description: "Your all-in-one business management solution for small businesses in South Africa",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1000&q=80",
    },
    {
      title: "Manage Your Business",
      description: "Track leads, manage sales, create professional quotes, and ensure compliance all in one place",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1000&q=80",
    },
    {
      title: "Create an Account",
      isAuthStep: true,
    },
    {
      title: "Business Information",
      isBusinessInfoStep: true,
    },
    {
      title: "Select Your Business Type",
      isBusinessTypeSelection: true,
    }
  ];
  
  const handleAuthSuccess = () => {
    if (authMode === 'signup') {
      setShowEmailConfirmation(true);
    } else {
      setStep(3);
    }
  };
  
  const handleBusinessInfoSubmit = (data: any) => {
    setBusinessName(data.business_name);
    setStep(4);
  };
  
  const handleBusinessTypeSelected = async (type: string) => {
    setSelectedBusinessType(type);
    
    if (user) {
      try {
        // Create business profile
        if (businessName && type) {
          await createBusinessProfile({
            business_name: businessName,
            business_type: type
          });
          toast.success("Business profile created successfully!");
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Error creating business profile:", error);
        toast.error("Failed to create business profile. Please try again.");
      }
    } else {
      // No user yet, move to auth step
      setStep(2);
    }
  };
  
  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };
  
  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  const handleSkip = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setStep(2); // Skip to auth step
    }
  };
  
  const handleContinueToLogin = () => {
    setAuthMode('signin');
    setShowEmailConfirmation(false);
    setStep(2);
  };
  
  const currentStep = steps[step];
  const isAuthStep = step === 2;
  const isBusinessInfoStep = step === 3;
  const isBusinessTypeStep = step === 4;
  const isLastStep = step === steps.length - 1;
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-imbila-blue border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-imbila-dark">Check Your Email</h2>
              <p className="text-gray-600 mt-2">We've sent a confirmation link to your email address.</p>
              <p className="text-gray-600">Please verify your email to continue.</p>
            </div>
            <div className="pt-4 text-center">
              <Button onClick={handleContinueToLogin} className="w-full">
                Continue to Login
                <LogIn className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-sm text-gray-500 mt-2">Already confirmed? Click the button above to sign in.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 z-10">
        <div className="flex w-full h-1">
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`flex-1 h-full transition-all duration-300 ${
                index <= step ? "bg-imbila-blue" : "bg-gray-200"
              }`} 
            />
          ))}
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto overflow-hidden">
          <CardContent className="p-0">
            <OnboardingStep step={0} currentStep={step}>
              <div className="relative pb-[56.25%] overflow-hidden">
                <img 
                  src={currentStep.image} 
                  alt={currentStep.title}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold text-imbila-dark">{currentStep.title}</h2>
                <p className="text-gray-600">{currentStep.description}</p>
                
                <div className="flex justify-between pt-4">
                  <div>
                    {step > 0 && (
                      <Button variant="outline" onClick={handlePrev}>
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={handleSkip}>
                      {user ? "Go to Dashboard" : "Sign In"}
                    </Button>
                    <Button onClick={handleNext}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </OnboardingStep>
            
            <OnboardingStep step={1} currentStep={step}>
              <div className="relative pb-[56.25%] overflow-hidden">
                <img 
                  src={currentStep.image} 
                  alt={currentStep.title}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold text-imbila-dark">{currentStep.title}</h2>
                <p className="text-gray-600">{currentStep.description}</p>
                
                <div className="flex justify-between pt-4">
                  <div>
                    <Button variant="outline" onClick={handlePrev}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={handleSkip}>
                      {user ? "Go to Dashboard" : "Sign In"}
                    </Button>
                    <Button onClick={handleNext}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </OnboardingStep>
            
            <OnboardingStep step={2} currentStep={step}>
              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold text-center mb-4">Create an Account</h2>
                
                <Tabs defaultValue={authMode} onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signup" className="mt-4">
                    <AuthForm mode="signup" onSuccess={handleAuthSuccess} />
                  </TabsContent>
                  <TabsContent value="signin" className="mt-4">
                    <AuthForm mode="signin" onSuccess={handleAuthSuccess} />
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handlePrev}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  
                  {selectedBusinessType && (
                    <div className="text-sm text-gray-500">
                      Selected business type: <span className="font-medium">
                        {businessTypes.find(t => t.id === selectedBusinessType)?.name || selectedBusinessType}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </OnboardingStep>
            
            <OnboardingStep step={3} currentStep={step}>
              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold text-center mb-4">Business Information</h2>
                
                <div className="py-2">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Business Name</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded mt-1" 
                        value={businessName} 
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Enter your business name"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => setStep(4)} disabled={!businessName}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </OnboardingStep>
            
            <OnboardingStep step={4} currentStep={step}>
              <div className="p-6 space-y-4">
                <BusinessTypeSelector 
                  onSelectBusinessType={handleBusinessTypeSelected}
                />
              </div>
            </OnboardingStep>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
