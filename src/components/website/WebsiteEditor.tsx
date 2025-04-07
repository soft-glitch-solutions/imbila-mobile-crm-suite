
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorPicker } from "@/components/ui/color-picker";
import { toast } from "sonner";
import { ArrowLeft, Save, EyeIcon, Layout, Type, Palette } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface WebsiteData {
  id: string;
  business_id: string;
  title: string;
  description: string;
  hero_image_url?: string;
  services?: any[];
  testimonials?: any[];
  primary_color: string;
  secondary_color: string;
  font_family: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

const defaultWebsiteData: Partial<WebsiteData> = {
  title: "",
  description: "",
  services: [],
  testimonials: [],
  primary_color: "#0f766e",
  secondary_color: "#0284c7",
  font_family: "Inter",
};

const WebsiteEditor = () => {
  const navigate = useNavigate();
  const { businessProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [websiteData, setWebsiteData] = useState<Partial<WebsiteData>>(defaultWebsiteData);
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    const fetchWebsiteData = async () => {
      if (!businessProfile) return;
      
      try {
        setIsLoading(true);
        
        // Check if website data exists
        const { data, error } = await supabase
          .from('website_data')
          .select('*')
          .eq('business_id', businessProfile.id)
          .single();
          
        if (error && error.code !== 'PGSQL_ERROR_22P02') {
          console.error("Error fetching website data:", error);
          toast.error("Failed to load website data");
        }
        
        if (data) {
          setWebsiteData(data);
        } else {
          // Set default data with business name
          setWebsiteData({
            ...defaultWebsiteData,
            title: businessProfile.business_name || "My Business Website",
            business_id: businessProfile.id,
          });
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred while loading website data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWebsiteData();
  }, [businessProfile]);
  
  const handleInputChange = (field: string, value: any) => {
    setWebsiteData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSave = async () => {
    if (!businessProfile) {
      toast.error("Business profile not found");
      return;
    }
    
    try {
      setIsSaving(true);
      
      const website = {
        ...websiteData,
        business_id: businessProfile.id,
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      if (websiteData.id) {
        // Update existing record
        result = await supabase
          .from('website_data')
          .update(website)
          .eq('id', websiteData.id);
      } else {
        // Create new record
        result = await supabase
          .from('website_data')
          .insert({ ...website, created_at: new Date().toISOString() });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast.success("Website data saved successfully");
      
      // Refresh data after save
      const { data } = await supabase
        .from('website_data')
        .select('*')
        .eq('business_id', businessProfile.id)
        .single();
        
      if (data) {
        setWebsiteData(data);
      }
      
    } catch (error) {
      console.error("Error saving website data:", error);
      toast.error("Failed to save website data");
    } finally {
      setIsSaving(false);
    }
  };
  
  const viewWebsite = () => {
    if (businessProfile?.business_name) {
      const businessName = businessProfile.business_name.toLowerCase().replace(/\s+/g, '-');
      window.open(`/business/${businessName}`, '_blank');
    } else {
      toast.error("Business name is required to view your website");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <div className="space-x-2">
            <Skeleton className="h-10 w-28 inline-block" />
            <Skeleton className="h-10 w-28 inline-block" />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/website')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Templates
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={viewWebsite}>
            <EyeIcon className="mr-2 h-4 w-4" /> Preview
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Website Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="content" className="flex items-center">
                <Type className="mr-2 h-4 w-4" /> Content
              </TabsTrigger>
              <TabsTrigger value="design" className="flex items-center">
                <Layout className="mr-2 h-4 w-4" /> Design
              </TabsTrigger>
              <TabsTrigger value="colors" className="flex items-center">
                <Palette className="mr-2 h-4 w-4" /> Colors & Fonts
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-4">
              <div>
                <Label htmlFor="title">Website Title</Label>
                <Input 
                  id="title"
                  value={websiteData.title || ""}
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder="Your website title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  value={websiteData.description || ""}
                  onChange={e => handleInputChange('description', e.target.value)}
                  placeholder="Describe your business in a few sentences..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input 
                  id="contact_email"
                  type="email"
                  value={websiteData.contact_email || ""}
                  onChange={e => handleInputChange('contact_email', e.target.value)}
                  placeholder="contact@yourbusiness.com"
                />
              </div>
              
              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input 
                  id="contact_phone"
                  value={websiteData.contact_phone || ""}
                  onChange={e => handleInputChange('contact_phone', e.target.value)}
                  placeholder="+27 12 345 6789"
                />
              </div>
              
              <div>
                <Label htmlFor="address">Business Address</Label>
                <Textarea 
                  id="address"
                  value={websiteData.address || ""}
                  onChange={e => handleInputChange('address', e.target.value)}
                  placeholder="123 Main Street, City, Country"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="design" className="space-y-4">
              <div>
                <Label>Hero Image URL</Label>
                <Input 
                  value={websiteData.hero_image_url || ""}
                  onChange={e => handleInputChange('hero_image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter a URL for your hero image or upload one using the button below.
                </p>
              </div>
              
              <div className="mt-4">
                <Button variant="outline">Upload Image</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="colors" className="space-y-4">
              <div>
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-8 h-8 rounded border" 
                    style={{ backgroundColor: websiteData.primary_color || "#0f766e" }}
                  />
                  <Input 
                    value={websiteData.primary_color || "#0f766e"}
                    onChange={e => handleInputChange('primary_color', e.target.value)}
                    placeholder="#0f766e"
                  />
                </div>
              </div>
              
              <div>
                <Label>Secondary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-8 h-8 rounded border" 
                    style={{ backgroundColor: websiteData.secondary_color || "#0284c7" }}
                  />
                  <Input 
                    value={websiteData.secondary_color || "#0284c7"}
                    onChange={e => handleInputChange('secondary_color', e.target.value)}
                    placeholder="#0284c7"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="font_family">Font Family</Label>
                <select 
                  id="font_family"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={websiteData.font_family || "Inter"}
                  onChange={e => handleInputChange('font_family', e.target.value)}
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteEditor;
