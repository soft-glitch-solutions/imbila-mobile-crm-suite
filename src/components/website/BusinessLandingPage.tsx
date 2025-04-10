
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Mail, Phone, MapPin, Home } from "lucide-react";

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
  created_at?: string;
  updated_at?: string;
}

interface BusinessData {
  id: string;
  business_name: string;
  logo_url?: string;
  email?: string;
  phone?: string;
  address?: string;
}

const BusinessLandingPage = () => {
  const { businessName } = useParams<{ businessName: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBusinessAndWebsiteData = async () => {
      if (!businessName) return;
      
      try {
        setIsLoading(true);
        
        // Format business name for query (replace hyphens with spaces)
        const formattedBusinessName = businessName.replace(/-/g, ' ');
        
        // First, get the business profile
        const { data: businessData, error: businessError } = await supabase
          .from('business_profiles')
          .select('*')
          .ilike('business_name', formattedBusinessName)
          .single();
          
        if (businessError) {
          throw new Error("Business not found");
        }
        
        setBusinessData(businessData);
        
        // Then get the website data
        // Use maybeSingle to handle case where no data is found
        const { data: websiteData, error: websiteError } = await supabase
          .from('website_data')
          .select('*')
          .eq('business_id', businessData.id)
          .maybeSingle();
        
        if (websiteError) {
          console.error("Error fetching website data:", websiteError);
        }
        
        if (websiteData) {
          setWebsiteData(websiteData as WebsiteData);
        } else {
          // Use default data with business profile info
          setWebsiteData({
            id: '',
            business_id: businessData.id,
            title: businessData.business_name,
            description: `Welcome to ${businessData.business_name}`,
            primary_color: "#0f766e",
            secondary_color: "#0284c7",
            font_family: "Inter",
          });
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Business not found");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBusinessAndWebsiteData();
  }, [businessName]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Skeleton className="h-16 w-2/3 mx-auto mb-8" />
          <Skeleton className="h-96 w-full rounded-xl mb-12" />
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }
  
  if (error || !businessData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
          <p className="text-gray-500 mb-6">
            The business you're looking for doesn't exist or may have been removed.
          </p>
          <Link to="/">
            <Button>
              <Home className="mr-2 h-4 w-4" /> Return Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }
  
  // Font family for the entire page
  const fontFamily = websiteData?.font_family || 'Inter';
  // Primary and secondary colors
  const primaryColor = websiteData?.primary_color || "#0f766e";
  const secondaryColor = websiteData?.secondary_color || "#0284c7";
  
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily }}>
      {/* Hero Section */}
      <div 
        className="relative py-20 px-4"
        style={{ 
          backgroundColor: primaryColor,
          backgroundImage: websiteData?.hero_image_url ? `url(${websiteData.hero_image_url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50" style={{ 
          opacity: websiteData?.hero_image_url ? 0.6 : 0,
          backgroundColor: websiteData?.hero_image_url ? 'black' : 'transparent'
        }}></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {websiteData?.title || businessData.business_name}
          </h1>
          <p className="text-xl text-white/90 mb-8">
            {websiteData?.description || `Welcome to ${businessData.business_name}`}
          </p>
          <Button 
            size="lg" 
            className="text-white"
            style={{ backgroundColor: secondaryColor }}
          >
            Contact Us <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Services Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: primaryColor }}>
            Our Services
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {(websiteData?.services && Array.isArray(websiteData.services) && websiteData.services.length > 0) ? (
              websiteData.services.map((service, index) => (
                <Card key={index} className="p-6">
                  <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </Card>
              ))
            ) : (
              <>
                <Card className="p-6 text-center bg-gray-50">
                  <h3 className="text-xl font-bold mb-3">Service 1</h3>
                  <p className="text-gray-600">Description of your service goes here. Add details about what you offer to your clients.</p>
                </Card>
                <Card className="p-6 text-center bg-gray-50">
                  <h3 className="text-xl font-bold mb-3">Service 2</h3>
                  <p className="text-gray-600">Description of your service goes here. Add details about what you offer to your clients.</p>
                </Card>
                <Card className="p-6 text-center bg-gray-50">
                  <h3 className="text-xl font-bold mb-3">Service 3</h3>
                  <p className="text-gray-600">Description of your service goes here. Add details about what you offer to your clients.</p>
                </Card>
              </>
            )}
          </div>
        </div>
        
        {/* Contact Section */}
        <div className="bg-gray-50 rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: primaryColor }}>
            Contact Us
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: primaryColor }}>
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Email</h3>
              <p className="text-gray-600">
                {websiteData?.contact_email || businessData.email || 'contact@yourbusiness.com'}
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: primaryColor }}>
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Phone</h3>
              <p className="text-gray-600">
                {websiteData?.contact_phone || businessData.phone || '+27 12 345 6789'}
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: primaryColor }}>
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Address</h3>
              <p className="text-gray-600">
                {websiteData?.address || businessData.address || '123 Main Street, City, Country'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-8 px-4 text-center text-white" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-6xl mx-auto">
          <p>&copy; {new Date().getFullYear()} {businessData.business_name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default BusinessLandingPage;
