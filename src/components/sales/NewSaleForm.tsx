
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Customer {
  id: string;
  name: string;
}

const NewSaleForm = () => {
  const navigate = useNavigate();
  const { businessProfile } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState<SaleItem[]>([
    { id: `item-${Date.now()}`, name: "", quantity: 1, price: 0 }
  ]);
  
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!businessProfile) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('customers')
          .select('id, name')
          .eq('business_id', businessProfile.id)
          .order('name');
        
        if (error) throw error;
        
        setCustomers(data || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error('Failed to load customers');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, [businessProfile]);
  
  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomerId(customerId);
    setCustomerName(customer ? customer.name : "");
  };
  
  const addItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        name: "",
        quantity: 1,
        price: 0
      }
    ]);
  };
  
  const updateItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { 
      ...updatedItems[index], 
      [field]: value 
    };
    setItems(updatedItems);
  };
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessProfile) {
      toast.error('Business profile not found');
      return;
    }
    
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    
    if (items.some(item => !item.name.trim())) {
      toast.error('All items must have a name');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const total = calculateTotal();
      
      const { data, error } = await supabase
        .from('sales')
        .insert({
          business_id: businessProfile.id,
          customer_id: selectedCustomerId,
          customer_name: customerName,
          amount: total,
          status,
          items: JSON.stringify(items),
          date: new Date().toISOString(),
        })
        .select();
        
      if (error) throw error;
      
      toast.success('Sale created successfully');
      navigate(`/sales/${data[0].id}`);
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error('Failed to create sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/sales')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sales
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Sale</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Customer</Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : customers.length > 0 ? (
                  <Select onValueChange={handleCustomerSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground mt-1">
                    No customers found. Enter the customer name manually below.
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
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
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Items</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addItem}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Input 
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="Item name"
                      className="flex-1"
                      required
                    />
                    <Input 
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value || "1"))}
                      placeholder="Qty"
                      className="w-20"
                      min="1"
                      required
                    />
                    <Input 
                      type="number" 
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value || "0"))}
                      placeholder="Price"
                      className="w-28"
                      min="0"
                      step="0.01"
                      required
                    />
                    <div className="w-28 text-right">
                      R {(item.price * item.quantity).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </div>
                    {items.length > 1 && (
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-4">
                <div className="text-xl font-bold">
                  Total: R {calculateTotal().toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-imbila-blue hover:bg-blue-700" 
                disabled={isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" /> Create Sale
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewSaleForm;
