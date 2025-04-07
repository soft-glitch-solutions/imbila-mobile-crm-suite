
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash, Plus, Minus } from "lucide-react";
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Sale {
  id: string;
  business_id: string;
  customer_id: string | null;
  customer_name: string;
  amount: number;
  status: string;
  description: string | null;
  items: SaleItem[];
  created_at: string;
  updated_at: string;
  date: string;
}

const SaleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { businessProfile } = useAuth();
  const [sale, setSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchSale = async () => {
      if (!businessProfile || !id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('sales')
          .select('*')
          .eq('id', id)
          .eq('business_id', businessProfile.id)
          .single();
          
        if (error) throw error;
        
        // Transform the database record to match our Sale interface
        const saleData: Sale = {
          id: data.id,
          business_id: data.business_id,
          customer_id: data.customer_id,
          customer_name: data.customer_name || 'Unnamed Customer',
          amount: data.amount,
          status: data.status,
          description: data.description || '',
          items: data.items ? JSON.parse(data.items) : [],
          date: data.date,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        
        setSale(saleData);
      } catch (error) {
        console.error('Error fetching sale:', error);
        toast.error('Failed to load sale information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSale();
  }, [id, businessProfile]);
  
  const handleChange = (field: keyof Sale, value: string | SaleItem[]) => {
    if (sale) {
      setSale({ ...sale, [field]: value });
    }
  };
  
  const handleSave = async () => {
    if (!sale || !businessProfile) return;
    
    try {
      setIsSaving(true);
      
      // Calculate the total
      const total = sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const { error } = await supabase
        .from('sales')
        .update({ 
          customer_name: sale.customer_name,
          amount: total,
          status: sale.status,
          description: sale.description,
          items: JSON.stringify(sale.items),
          updated_at: new Date().toISOString()
        })
        .eq('id', sale.id);
        
      if (error) throw error;
      
      toast.success('Sale updated successfully');
    } catch (error) {
      console.error('Error saving sale:', error);
      toast.error('Failed to update sale');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!sale || !businessProfile) return;
    
    if (!window.confirm('Are you sure you want to delete this sale?')) return;
    
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', sale.id);
        
      if (error) throw error;
      
      toast.success('Sale deleted successfully');
      navigate('/sales');
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error('Failed to delete sale');
    } finally {
      setIsSaving(false);
    }
  };
  
  const addItem = () => {
    if (sale) {
      const newItem = {
        id: `temp-${Date.now()}`,
        name: '',
        quantity: 1,
        price: 0,
      };
      
      handleChange('items', [...sale.items, newItem]);
    }
  };
  
  const updateItem = (index: number, field: keyof SaleItem, value: string | number) => {
    if (sale) {
      const updatedItems = [...sale.items];
      updatedItems[index] = { 
        ...updatedItems[index], 
        [field]: value 
      };
      handleChange('items', updatedItems);
    }
  };
  
  const removeItem = (index: number) => {
    if (sale) {
      const updatedItems = sale.items.filter((_, i) => i !== index);
      handleChange('items', updatedItems);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-10 w-28" />
              </div>
              
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-10">
        <p className="mb-4">Sale not found.</p>
        <Button onClick={() => navigate('/sales')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sales
        </Button>
      </div>
    );
  }

  // Calculate the total
  const total = sale?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/sales')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sales
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
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input 
                  id="customer_name"
                  value={sale.customer_name || ''}
                  onChange={(e) => handleChange('customer_name', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={sale.status} 
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="total">Total Amount</Label>
                <div className="text-xl font-bold mt-1">R {total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
              </div>
              
              <div>
                <Label>Created</Label>
                <div className="text-sm mt-1 text-gray-500">
                  {sale.created_at ? format(new Date(sale.created_at), 'PPP') : 'Unknown'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <Label>Items</Label>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {sale.items?.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Input 
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    placeholder="Item name"
                    className="flex-1"
                  />
                  <Input 
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    placeholder="Qty"
                    className="w-20"
                    min="1"
                  />
                  <Input 
                    type="number" 
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                    placeholder="Price"
                    className="w-28"
                    min="0"
                    step="0.01"
                  />
                  <div className="w-28 text-right">
                    R {(item.price * item.quantity).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeItem(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {(!sale.items || sale.items.length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  No items added. Click "Add Item" to add an item to this sale.
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes"
              rows={4}
              value={sale.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaleDetails;
