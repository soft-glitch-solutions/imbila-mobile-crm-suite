
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const businessProfileSchema = z.object({
  business_name: z.string().min(1, { message: "Business name is required" }),
  business_type: z.string().min(1, { message: "Business type is required" }),
  email: z.string().email({ message: "Please enter a valid email" }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

type BusinessProfileFormProps = {
  onSuccess?: () => void;
  initialData?: any;
};

export function BusinessProfileForm({ onSuccess, initialData }: BusinessProfileFormProps) {
  const { createBusinessProfile, updateBusinessProfile, businessProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo_url || businessProfile?.logo_url || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const form = useForm<z.infer<typeof businessProfileSchema>>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      business_name: initialData?.business_name || businessProfile?.business_name || "",
      business_type: initialData?.business_type || businessProfile?.business_type || "",
      email: initialData?.email || businessProfile?.email || "",
      phone: initialData?.phone || businessProfile?.phone || "",
      address: initialData?.address || businessProfile?.address || "",
    },
  });
  
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Logo must be smaller than 5MB");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };
  
  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return initialData?.logo_url || businessProfile?.logo_url || null;
    
    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    try {
      const { error: uploadError, data } = await supabase.storage
        .from('business-logos')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('business-logos')
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
      return null;
    }
  };
  
  const onSubmit = async (data: z.infer<typeof businessProfileSchema>) => {
    try {
      setIsLoading(true);
      
      // Upload logo if a new one is selected
      let logoUrl = null;
      if (logoFile) {
        logoUrl = await uploadLogo();
      }
      
      const profileData = {
        ...data,
        logo_url: logoUrl || initialData?.logo_url || businessProfile?.logo_url,
      };
      
      if (businessProfile) {
        await updateBusinessProfile(profileData);
      } else {
        await createBusinessProfile(profileData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Business Logo</label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 border rounded-md flex items-center justify-center overflow-hidden bg-gray-50">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-400 text-xs text-center">No logo</div>
              )}
            </div>
            <div>
              <label htmlFor="logo-upload" className="cursor-pointer">
                <div className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md">
                  <Upload size={16} />
                  <span className="text-sm">{logoPreview ? 'Change' : 'Upload'} Logo</span>
                </div>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        </div>
      
        <FormField
          control={form.control}
          name="business_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Business Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="business_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Type</FormLabel>
              <FormControl>
                <Input disabled placeholder={field.value} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Email</FormLabel>
              <FormControl>
                <Input placeholder="business@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Phone</FormLabel>
              <FormControl>
                <Input placeholder="+27 123 456 7890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Address</FormLabel>
              <FormControl>
                <Textarea placeholder="123 Main St, City, Country" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {businessProfile ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            businessProfile ? 'Update Business Profile' : 'Create Business Profile'
          )}
        </Button>
      </form>
    </Form>
  );
}
