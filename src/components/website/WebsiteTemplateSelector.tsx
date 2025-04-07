
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Check, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Template {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
}

const WebsiteTemplateSelector = () => {
  const { businessProfile } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Sample template data
  useEffect(() => {
    // In a real app, you would fetch templates from an API
    const sampleTemplates = [
      {
        id: "template1",
        name: "Modern Business",
        description: "A clean, modern design ideal for professional services.",
        image: "https://plus.unsplash.com/premium_photo-1681140560086-06ada35a656f?q=80&w=1170&auto=format&fit=crop",
        category: "professional"
      },
      {
        id: "template2",
        name: "Creative Portfolio",
        description: "Showcase your work with this artistic template.",
        image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1170&auto=format&fit=crop",
        category: "creative"
      },
      {
        id: "template3",
        name: "E-Commerce Classic",
        description: "Perfect for online stores with product showcases.",
        image: "https://images.unsplash.com/photo-1593013128725-ed49e2e45491?q=80&w=880&auto=format&fit=crop",
        category: "ecommerce"
      },
      {
        id: "template4",
        name: "Restaurant Showcase",
        description: "Designed for restaurants and food businesses.",
        image: "https://plus.unsplash.com/premium_photo-1687147220831-82aaff4c5846?q=80&w=1170&auto=format&fit=crop",
        category: "food"
      },
      {
        id: "template5",
        name: "Minimal Portfolio",
        description: "A minimalist design for creative professionals.",
        image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1055&auto=format&fit=crop",
        category: "creative"
      },
      {
        id: "template6",
        name: "Corporate Blue",
        description: "Professional template for corporate businesses.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1115&auto=format&fit=crop",
        category: "professional"
      }
    ];

    setTemplates(sampleTemplates);
    
    // Check if business already has a selected template
    const checkSelectedTemplate = async () => {
      if (businessProfile?.website_template) {
        setSelectedTemplate(businessProfile.website_template);
      }
    };
    
    checkSelectedTemplate();
  }, [businessProfile]);

  const filteredTemplates = activeCategory === "all" 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

  const handleSelectTemplate = async (templateId: string) => {
    if (!businessProfile) {
      toast.error("You need to create a business profile first");
      return;
    }
    
    try {
      // In a real app, this would update the business profile in the database
      setSelectedTemplate(templateId);
      toast.success("Website template selected");
      
      // This would save the selected template to the business profile
      // For now, we're just simulating this behavior
    } catch (error) {
      console.error("Error selecting template:", error);
      toast.error("Failed to select template");
    }
  };

  const handleCustomizeTemplate = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first");
      return;
    }
    
    // In a real app, this would navigate to a template editor
    toast.success("Opening template editor");
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Website Templates</h2>
        {selectedTemplate && (
          <Button 
            onClick={handleCustomizeTemplate}
            className="bg-imbila-blue hover:bg-blue-700"
          >
            <Edit className="mr-2 h-4 w-4" /> Customize Website
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex justify-start overflow-auto">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="creative">Creative</TabsTrigger>
          <TabsTrigger value="ecommerce">E-Commerce</TabsTrigger>
          <TabsTrigger value="food">Food & Restaurant</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id} 
                className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate === template.id ? 'ring-2 ring-imbila-blue' : ''
                }`}
                onClick={() => handleSelectTemplate(template.id)}
              >
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={template.image} 
                    alt={template.name} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                    </div>
                    {selectedTemplate === template.id && (
                      <div className="rounded-full bg-imbila-blue p-1 text-white">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No templates found in this category.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedTemplate && (
        <Card className="mt-8">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Selected Template</h3>
                <p className="text-sm text-gray-500">
                  {templates.find(t => t.id === selectedTemplate)?.name}
                </p>
              </div>
              <Button 
                onClick={handleCustomizeTemplate}
                variant="outline"
              >
                <Edit className="mr-2 h-4 w-4" /> Customize
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WebsiteTemplateSelector;
