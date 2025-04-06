
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BusinessTypeSelector from "@/components/BusinessTypeSelector";
import { ChevronRight, ChevronLeft } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  
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
      title: "On The Go",
      description: "Access your business tools anytime, anywhere from your mobile device",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80"
    },
    {
      title: "Select Your Business Type",
      description: "We'll customize your experience based on your business type",
      isBusinessTypeSelection: true,
    }
  ];
  
  const handleBusinessTypeSelected = (type: string) => {
    // Store selected business type in localStorage for persistence
    localStorage.setItem("selectedBusinessType", type);
    navigate("/dashboard");
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
    setStep(steps.length - 1);
  };
  
  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  
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
          {currentStep.isBusinessTypeSelection ? (
            <CardContent className="p-0">
              <BusinessTypeSelector onSelectBusinessType={handleBusinessTypeSelected} />
            </CardContent>
          ) : (
            <CardContent className="p-0">
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
                    {step < steps.length - 2 && (
                      <Button variant="ghost" onClick={handleSkip}>
                        Skip
                      </Button>
                    )}
                    <Button onClick={handleNext}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
