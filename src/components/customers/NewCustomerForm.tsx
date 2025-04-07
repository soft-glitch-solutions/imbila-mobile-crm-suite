
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const NewCustomerForm = () => {
  const navigate = useNavigate();
  const { businessProfile } = useAuth();
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (field: string, value: string) => {
    setCustomer({ ...customer, [field]: value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessProfile) {
      toast.error('Business profile not found');
      return;
    }
    
    if (!customer.name.trim()) {
      toast.error('Customer name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('customers')
        .insert({
          business_id: businessProfile.id,
          name: customer.name,
          email: customer.email || null,
          phone: customer.phone || null,
          address: customer.address || null,
          notes: customer.notes || null
        })
        .select();
        
      if (error) throw error;
      
      toast.success('Customer created successfully');
      navigate(`/customers/${data[0].id}`);
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="required">Customer Name</Label>
              <Input
                id="name"
                placeholder="Enter customer name"
                value={customer.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="customer@example.com"
                  value={customer.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={customer.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Enter customer address"
                value={customer.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional information about the customer"
                value={customer.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-imbila-blue hover:bg-blue-700"
                disabled={isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" /> Save Customer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewCustomerForm;
