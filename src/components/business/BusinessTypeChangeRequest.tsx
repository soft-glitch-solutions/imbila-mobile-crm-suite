
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import BusinessTypeSelector from "@/components/BusinessTypeSelector";

const BusinessTypeChangeRequest = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { businessProfile, refreshBusinessProfile } = useAuth();
  const [selectedBusinessType, setSelectedBusinessType] = useState<string | null>(null);
  
  const handleRequestChange = async () => {
    if (!businessProfile || !selectedBusinessType) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('business_type_change_requests')
        .insert({
          business_id: businessProfile.id,
          current_type: businessProfile.business_type,
          requested_type: selectedBusinessType,
        });
      
      if (error) throw error;
      
      toast.success("Business type change request submitted successfully");
      setIsOpen(false);
      setSelectedBusinessType(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Request Business Type Change</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Business Type Change</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Current business type: <span className="font-medium">{businessProfile?.business_type || 'None'}</span>
          </p>
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Select New Business Type</h3>
            <BusinessTypeSelector 
              onSelectBusinessType={(type) => setSelectedBusinessType(type)} 
              displayOnly 
              initialValue={selectedBusinessType}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRequestChange} 
              disabled={loading || !selectedBusinessType || selectedBusinessType === businessProfile?.business_type}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessTypeChangeRequest;
