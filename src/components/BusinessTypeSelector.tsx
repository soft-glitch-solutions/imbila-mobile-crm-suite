
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, ShoppingBag, Building, Hammer, Book, Utensils } from "lucide-react";
import { toast } from "sonner";

interface BusinessType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const businessTypes: BusinessType[] = [
  {
    id: "retail",
    name: "Retail Shop",
    description: "Product-based business selling directly to consumers",
    icon: <ShoppingBag className="h-8 w-8 text-imbila-blue" />,
    features: ["Basic Lead Tracking", "Simple Sales Process", "Inventory Management", "Basic Compliance"]
  },
  {
    id: "tender",
    name: "Tender Business",
    description: "Contract-based business bidding for projects",
    icon: <Briefcase className="h-8 w-8 text-imbila-purple" />,
    features: ["Advanced Lead Management", "Complex Sales Pipeline", "Document Management", "Tender Compliance", "RFP/RFQ Tracking"]
  },
  {
    id: "construction",
    name: "Construction",
    description: "Project-based construction and contracting",
    icon: <Hammer className="h-8 w-8 text-imbila-orange" />,
    features: ["Project Leads", "Quote Management", "Resource Planning", "Certification Tracking"]
  },
  {
    id: "professional",
    name: "Professional Services",
    description: "Service-based consulting and professional work",
    icon: <Building className="h-8 w-8 text-imbila-skyblue" />,
    features: ["Client Management", "Retainer Tracking", "Time & Billing", "Professional Certifications"]
  },
  {
    id: "education",
    name: "Education & Training",
    description: "Training programs and educational services",
    icon: <Book className="h-8 w-8 text-imbila-green" />,
    features: ["Student Leads", "Course Management", "Certification Tracking", "Education Compliance"]
  },
  {
    id: "restaurant",
    name: "Restaurant & Hospitality",
    description: "Food service and hospitality business",
    icon: <Utensils className="h-8 w-8 text-imbila-purple" />,
    features: ["Customer Management", "Reservation System", "Inventory", "Health & Safety Compliance"]
  }
];

const BusinessTypeSelector = ({ onSelectBusinessType }: { 
  onSelectBusinessType: (type: string) => void 
}) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (businessType: string) => {
    setSelected(businessType);
    onSelectBusinessType(businessType);
    toast.success(`${businessType} profile selected!`);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-imbila-dark">Select Your Business Type</h2>
        <p className="text-gray-500 mt-1">We'll customize your experience based on your selection</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {businessTypes.map((type) => (
          <Card 
            key={type.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selected === type.id ? "ring-2 ring-imbila-blue bg-blue-50" : ""
            }`}
            onClick={() => handleSelect(type.id)}
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              {type.icon}
              <div>
                <CardTitle className="text-lg">{type.name}</CardTitle>
                <CardDescription className="text-sm">{type.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-500">
                <span className="font-medium">Features:</span>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  {type.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BusinessTypeSelector;
