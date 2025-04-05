
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Code, Smartphone, Monitor, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose } from "@/components/ui/drawer";

interface Template {
  id: string;
  name: string;
  description: string;
  image: string;
  mobileImage: string;
  category: string;
  popular: boolean;
  features: string[];
}

interface WebsiteTemplatesProps {
  businessType: string;
}

const WebsiteTemplates = ({ businessType }: WebsiteTemplatesProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  // Sample website templates
  const templates: Template[] = [
    {
      id: "modern-business",
      name: "Modern Business",
      description: "A clean, professional template for small businesses",
      image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Modern+Business",
      mobileImage: "https://placehold.co/300x600/e2e8f0/1e293b?text=Modern+Business+Mobile",
      category: "business",
      popular: true,
      features: ["Responsive design", "Contact form", "About section", "Services showcase"]
    },
    {
      id: "elegant-services",
      name: "Elegant Services",
      description: "Perfect for service-based businesses and consultants",
      image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Elegant+Services",
      mobileImage: "https://placehold.co/300x600/e2e8f0/1e293b?text=Elegant+Services+Mobile",
      category: "services",
      popular: false,
      features: ["Testimonials", "Service breakdown", "Team profiles", "Booking integration"]
    },
    {
      id: "retail-showcase",
      name: "Retail Showcase",
      description: "Highlight your products with this visual template",
      image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Retail+Showcase",
      mobileImage: "https://placehold.co/300x600/e2e8f0/1e293b?text=Retail+Showcase+Mobile",
      category: "retail",
      popular: true,
      features: ["Product gallery", "Featured items", "Category navigation", "Call-to-action buttons"]
    },
    {
      id: "contractor-pro",
      name: "Contractor Pro",
      description: "Designed for construction and contracting businesses",
      image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Contractor+Pro",
      mobileImage: "https://placehold.co/300x600/e2e8f0/1e293b?text=Contractor+Pro+Mobile",
      category: "construction",
      popular: false,
      features: ["Project portfolio", "Service areas map", "Quote request form", "Certification display"]
    },
    {
      id: "professional-portfolio",
      name: "Professional Portfolio",
      description: "Showcase your professional services and expertise",
      image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Professional+Portfolio",
      mobileImage: "https://placehold.co/300x600/e2e8f0/1e293b?text=Professional+Portfolio+Mobile",
      category: "professional",
      popular: true,
      features: ["Case studies", "Skills showcase", "Blog ready", "Contact integration"]
    },
    {
      id: "education-hub",
      name: "Education Hub",
      description: "Perfect for educational services and training providers",
      image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Education+Hub",
      mobileImage: "https://placehold.co/300x600/e2e8f0/1e293b?text=Education+Hub+Mobile",
      category: "education",
      popular: false,
      features: ["Course listings", "Instructor profiles", "Registration forms", "Learning resources"]
    },
    {
      id: "restaurant-delight",
      name: "Restaurant Delight",
      description: "Showcase your menu and dining experience",
      image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Restaurant+Delight",
      mobileImage: "https://placehold.co/300x600/e2e8f0/1e293b?text=Restaurant+Delight+Mobile",
      category: "restaurant",
      popular: true,
      features: ["Menu display", "Reservation system", "Location map", "Food gallery"]
    }
  ];

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    toast.success("Template selected! You can now customize it.");
  };

  const getRecommendedTemplates = () => {
    // Map business types to recommended template categories
    const businessTypeMap: {[key: string]: string} = {
      retail: "retail",
      tender: "business",
      construction: "construction",
      professional: "professional",
      education: "education",
      restaurant: "restaurant"
    };
    
    const recommendedCategory = businessTypeMap[businessType] || "business";
    return templates.filter(template => template.category === recommendedCategory);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-imbila-dark">Website Templates</h2>
        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant="ghost"
            className={`rounded-none px-2 py-1 h-8 text-xs ${viewMode === 'desktop' ? 'bg-muted' : ''}`}
            onClick={() => setViewMode('desktop')}
          >
            <Monitor className="h-3 w-3 mr-1" /> Desktop
          </Button>
          <Button
            variant="ghost"
            className={`rounded-none px-2 py-1 h-8 text-xs ${viewMode === 'mobile' ? 'bg-muted' : ''}`}
            onClick={() => setViewMode('mobile')}
          >
            <Smartphone className="h-3 w-3 mr-1" /> Mobile
          </Button>
        </div>
      </div>

      <Tabs defaultValue="recommended">
        <TabsList>
          <TabsTrigger value="recommended" className="text-xs">Recommended</TabsTrigger>
          <TabsTrigger value="all" className="text-xs">All Templates</TabsTrigger>
          <TabsTrigger value="popular" className="text-xs">Popular</TabsTrigger>
        </TabsList>
        <TabsContent value="recommended" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {getRecommendedTemplates().map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                selected={selectedTemplate === template.id}
                onSelect={handleSelectTemplate}
                viewMode={viewMode}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                selected={selectedTemplate === template.id}
                onSelect={handleSelectTemplate}
                viewMode={viewMode}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="popular" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {templates.filter(t => t.popular).map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                selected={selectedTemplate === template.id}
                onSelect={handleSelectTemplate}
                viewMode={viewMode}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-10 bg-gray-50 border rounded-lg p-4">
        <div className="text-center">
          <h3 className="text-lg font-bold text-imbila-dark mb-2">Need a custom website?</h3>
          <p className="text-gray-600 text-sm mb-4">We can create a unique website for your business.</p>
          <Button className="bg-imbila-purple hover:bg-purple-700 text-sm">
            Contact for Custom Design
          </Button>
        </div>
      </div>
    </div>
  );
};

interface TemplateCardProps {
  template: Template;
  selected: boolean;
  onSelect: (id: string) => void;
  viewMode: "desktop" | "mobile";
}

const TemplateCard = ({ template, selected, onSelect, viewMode }: TemplateCardProps) => {
  return (
    <Card className={`overflow-hidden ${selected ? 'ring-2 ring-imbila-blue' : ''}`}>
      <Drawer>
        <DrawerTrigger asChild>
          <div className="cursor-pointer">
            <div 
              className="h-[120px] bg-cover bg-center relative"
              style={{ 
                backgroundImage: `url(${viewMode === 'mobile' ? template.mobileImage : template.image})`,
              }}
            >
              {template.popular && (
                <div className="absolute top-1 right-1 bg-imbila-blue text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  Popular
                </div>
              )}
              {selected && (
                <div className="absolute inset-0 bg-imbila-blue/20 flex items-center justify-center">
                  <div className="bg-white rounded-full p-1">
                    <Check className="h-4 w-4 text-imbila-blue" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-1 right-1 bg-black/50 rounded-full p-1">
                <Eye className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
        </DrawerTrigger>
        <DrawerContent className="h-[85vh] px-0 pt-0 pb-4">
          <div className="h-full overflow-auto">
            <div className="relative">
              <img 
                src={viewMode === 'mobile' ? template.mobileImage : template.image} 
                alt={template.name} 
                className="w-full max-h-[50vh] object-contain"
              />
              <DrawerClose className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold">{template.name}</h3>
              <p className="text-gray-600 mt-1">{template.description}</p>
              
              <h4 className="font-medium mt-4 mb-2">Features:</h4>
              <ul className="grid grid-cols-1 gap-2">
                {template.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="mt-6">
                <Button 
                  className="w-full"
                  onClick={() => {
                    onSelect(template.id);
                  }}
                >
                  {selected ? 'Selected' : 'Choose This Template'}
                </Button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      <CardHeader className="p-2">
        <CardTitle className="text-sm truncate">{template.name}</CardTitle>
      </CardHeader>
      <CardFooter className="p-2 pt-0">
        <Button 
          size="sm" 
          className={`text-xs w-full ${selected ? 'bg-green-600 hover:bg-green-700' : ''}`}
          onClick={() => onSelect(template.id)}
        >
          {selected ? (
            <>
              <Check className="h-3 w-3 mr-1" /> Selected
            </>
          ) : (
            'Select'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WebsiteTemplates;
