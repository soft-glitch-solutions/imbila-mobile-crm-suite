
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash } from "lucide-react";
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Customer {
  id: string;
  business_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { businessProfile } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!businessProfile) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', id)
          .eq('business_id', businessProfile.id)
          .single();
          
        if (error) throw error;
        
        setCustomer(data);
      } catch (error) {
        console.error('Error fetching customer:', error);
        toast.error('Failed to load customer information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomer();
  }, [id, businessProfile]);
  
  const handleChange = (field: keyof Customer, value: string) => {
    if (customer) {
      setCustomer({ ...customer, [field]: value });
    }
  };
  
  const handleSave = async () => {
    if (!customer || !businessProfile) return;
    
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('customers')
        .update({ 
          ...customer,
          updated_at: new Date().toISOString()
        })
        .eq('id', customer.id);
        
      if (error) throw error;
      
      toast.success('Customer updated successfully');
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Failed to update customer');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!customer || !businessProfile) return;
    
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id);
        
      if (error) throw error;
      
      toast.success('Customer deleted successfully');
      navigate('/customers');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading customer details...</div>;
  }

  if (!customer) {
    return (
      <div className="text-center py-10">
        <p className="mb-4">Customer not found.</p>
        <Button onClick={() => navigate('/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDelete} disabled={isSaving}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name"
                  value={customer.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={customer.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone"
                  value={customer.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address"
                  value={customer.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Created</Label>
                <div className="text-sm mt-1 text-gray-500">
                  {customer.created_at ? format(new Date(customer.created_at), 'PPP') : 'Unknown'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes"
              rows={4}
              value={customer.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDetails;
