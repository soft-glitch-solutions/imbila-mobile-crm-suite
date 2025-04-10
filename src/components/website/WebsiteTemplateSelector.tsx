
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const WebsiteTemplateSelector = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [templates, setTemplates] = useState([
    {
      id: "template-1",
      name: "Simple Business Template",
      description: "A clean and professional template for showcasing your business.",
      imageUrl: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "business"
    },
    {
      id: "template-2",
      name: "E-commerce Template",
      description: "A template designed for selling products online.",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "ecommerce"
    },
    {
      id: "template-3",
      name: "Portfolio Template",
      description: "A template for showcasing your work and skills.",
      imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "portfolio"
    },
    {
      id: "template-4",
      name: "Restaurant Template",
      description: "Perfect for restaurants, cafes and food businesses.",
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "restaurant"
    },
    {
      id: "template-5",
      name: "Consulting Services",
      description: "Professional template for consultancy and service businesses.",
      imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "business"
    },
    {
      id: "template-6",
      name: "Creative Agency",
      description: "Showcase your agency's creative work and services.",
      imageUrl: "https://images.unsplash.com/photo-1493397212122-2b85dda8106b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "agency"
    },
    {
      id: "template-7",
      name: "Educational Institution",
      description: "Template designed for schools, colleges and educational services.",
      imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "education"
    },
    {
      id: "template-8",
      name: "Healthcare Provider",
      description: "Template for medical practices, clinics and healthcare services.",
      imageUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "healthcare"
    },
  ]);

  const handlePreviewTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      toast(`Previewing: ${template.name}`, {
        description: "This would open a preview of the template in a real application."
      });
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    navigate('/website/edit');
    toast.success(`Template selected: ${templateId}`);
  };

  const filteredTemplates = templates.filter((template) => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Select a Website Template</h2>
        <p className="text-muted-foreground mb-4">
          Choose a template to get started with your website.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/website/edit')}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit Website
          </Button>
        </div>
      </div>
      
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No templates found matching "{searchQuery}". Try a different search term.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img
                  src={template.imageUrl}
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mt-4 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewTemplate(template.id)}
                  >
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    Select & Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebsiteTemplateSelector;
