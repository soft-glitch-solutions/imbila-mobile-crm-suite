
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Code, Smartphone, Monitor, Check } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  description: string;
  image: string;
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
      category: "business",
      popular: true,
      features: ["Responsive design", "Contact form", "About section", "Services showcase"]
    },
    {
      id: "elegant-services",
      name: "Elegant Services",
      description: "Perfect for service-based businesses and consultants",
      image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Elegant+Services",
      category: "services",
      popular: false,
      features: ["Testimonials", "Service breakdown", "Team profiles", "Booking integration"]
    },
    {
      id: "retail-showcase",
      name: "Retail Showcase",
      description: "Highlight your products with this visual template",
      image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Retail+Showcase",
      category: "retail",
      popular: true,
      features: ["Product gallery", "Featured items", "Category navigation", "Call-to-action buttons"]
    },
    {
      id: "contractor-pro",
      name: "Contractor Pro",
      description: "Designed for construction and contracting businesses",
      image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Contractor+Pro",
      category: "construction",
      popular: false,
      features: ["Project portfolio", "Service areas map", "Quote request form", "Certification display"]
    },
    {
      id: "professional-portfolio",
      name: "Professional Portfolio",
      description: "Showcase your professional services and expertise",
      image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Professional+Portfolio",
      category: "professional",
      popular: true,
      features: ["Case studies", "Skills showcase", "Blog ready", "Contact integration"]
    },
    {
      id: "education-hub",
      name: "Education Hub",
      description: "Perfect for educational services and training providers",
      image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Education+Hub",
      category: "education",
      popular: false,
      features: ["Course listings", "Instructor profiles", "Registration forms", "Learning resources"]
    },
    {
      id: "restaurant-delight",
      name: "Restaurant Delight",
      description: "Showcase your menu and dining experience",
      image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Restaurant+Delight",
      category: "restaurant",
      popular: true,
      features: ["Menu display", "Reservation system", "Location map", "Food gallery"]
    }
  ];

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    toast.success("Template selected! You can now customize it.");
  };

  const handlePreviewTemplate = (templateId: string) => {
    toast.info("Template preview would open here");
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
        <h2 className="text-2xl font-bold text-imbila-dark">Website Templates</h2>
        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant="ghost"
            className={`rounded-none ${viewMode === 'desktop' ? 'bg-muted' : ''}`}
            onClick={() => setViewMode('desktop')}
          >
            <Monitor className="h-4 w-4 mr-1" /> Desktop
          </Button>
          <Button
            variant="ghost"
            className={`rounded-none ${viewMode === 'mobile' ? 'bg-muted' : ''}`}
            onClick={() => setViewMode('mobile')}
          >
            <Smartphone className="h-4 w-4 mr-1" /> Mobile
          </Button>
        </div>
      </div>

      <Tabs defaultValue="recommended">
        <TabsList>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>
        <TabsContent value="recommended" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getRecommendedTemplates().map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                selected={selectedTemplate === template.id}
                onSelect={handleSelectTemplate}
                onPreview={handlePreviewTemplate}
                viewMode={viewMode}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                selected={selectedTemplate === template.id}
                onSelect={handleSelectTemplate}
                onPreview={handlePreviewTemplate}
                viewMode={viewMode}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="popular" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.filter(t => t.popular).map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                selected={selectedTemplate === template.id}
                onSelect={handleSelectTemplate}
                onPreview={handlePreviewTemplate}
                viewMode={viewMode}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-10 bg-gray-50 border rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-imbila-dark mb-2">Need a custom website design?</h3>
          <p className="text-gray-600 mb-4">We can help you create a unique website tailored to your business needs.</p>
          <Button className="bg-imbila-purple hover:bg-purple-700">
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
  onPreview: (id: string) => void;
  viewMode: "desktop" | "mobile";
}

const TemplateCard = ({ template, selected, onSelect, onPreview, viewMode }: TemplateCardProps) => {
  return (
    <Card className={`overflow-hidden ${selected ? 'ring-2 ring-imbila-blue' : ''}`}>
      <div className="relative">
        <div 
          className={`
            ${viewMode === 'mobile' ? 'w-1/3 h-[250px] mx-auto' : 'w-full h-[200px]'}
            bg-cover bg-center relative overflow-hidden transition-all duration-300
          `}
          style={{ 
            backgroundImage: `url(${template.image})`,
            borderRadius: viewMode === 'mobile' ? '12px 12px 0 0' : '0'
          }}
        >
          {template.popular && (
            <div className="absolute top-2 right-2 bg-imbila-blue text-white text-xs px-2 py-1 rounded-full">
              Popular
            </div>
          )}
          {selected && (
            <div className="absolute inset-0 bg-imbila-blue/20 flex items-center justify-center">
              <div className="bg-white rounded-full p-2">
                <Check className="h-6 w-6 text-imbila-blue" />
              </div>
            </div>
          )}
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle>{template.name}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-gray-500 text-sm">{template.description}</p>
        <div className="mt-2">
          <div className="text-xs font-medium text-gray-700">Features:</div>
          <ul className="mt-1 grid grid-cols-2 gap-1">
            {template.features.map((feature, index) => (
              <li key={index} className="text-xs text-gray-600 flex items-center">
                <Check className="h-3 w-3 text-imbila-green mr-1" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex space-x-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onPreview(template.id)}
          >
            <Eye className="h-4 w-4 mr-1" /> Preview
          </Button>
          <Button 
            size="sm" 
            className={`flex-1 ${selected ? 'bg-green-600 hover:bg-green-700' : 'bg-imbila-blue hover:bg-blue-700'}`}
            onClick={() => onSelect(template.id)}
          >
            {selected ? (
              <>
                <Check className="h-4 w-4 mr-1" /> Selected
              </>
            ) : (
              'Select'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default WebsiteTemplates;
