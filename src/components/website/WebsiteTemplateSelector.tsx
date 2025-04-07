import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit } from "lucide-react";
import { toast } from "sonner";

const WebsiteTemplateSelector = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([
    {
      id: "template-1",
      name: "Simple Business Template",
      description: "A clean and professional template for showcasing your business.",
      imageUrl: "https://via.placeholder.com/400x300",
    },
    {
      id: "template-2",
      name: "E-commerce Template",
      description: "A template designed for selling products online.",
      imageUrl: "https://via.placeholder.com/400x300",
    },
    {
      id: "template-3",
      name: "Portfolio Template",
      description: "A template for showcasing your work and skills.",
      imageUrl: "https://via.placeholder.com/400x300",
    },
  ]);

  const handlePreviewTemplate = (templateId: string) => {
    alert(`Previewing template: ${templateId}`);
  };

  // Inside the component, update the handleSelectTemplate function to navigate to the editor
  const handleSelectTemplate = (templateId: string) => {
    navigate('/website/edit');
    toast.success(`Template selected: ${templateId}`);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Select a Website Template</h2>
        <p className="text-muted-foreground">
          Choose a template to get started with your website.
        </p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/website/edit')}
          className="ml-2"
        >
          <Edit className="mr-2 h-4 w-4" /> Edit Website
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src={template.imageUrl}
                alt={template.name}
                className="rounded-md"
              />
            </CardContent>
            {/* Update the card action buttons to include an edit button */}
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
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WebsiteTemplateSelector;
