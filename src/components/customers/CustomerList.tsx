
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Mail, FileText, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface CustomerListProps {
  businessType: string;
}

const CustomerList = ({ businessType }: CustomerListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const { businessProfile } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!businessProfile) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('business_id', businessProfile.id);
        
        if (error) throw error;
        
        setCustomers(data || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error('Failed to load customers data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, [businessProfile]);

  const filteredCustomers = customers.filter((customer) =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = () => {
    // Navigate to a new customer form in a real app
    navigate("/customers/new");
  };

  const handleViewCustomer = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  const handleViewInvoices = (customerId: string) => {
    // In a real app, navigate to customer's invoices
    toast.info(`Viewing invoices for customer ${customerId}`);
  };

  const handleViewQuotes = (customerId: string) => {
    // In a real app, navigate to customer's quotes
    toast.info(`Viewing quotes for customer ${customerId}`);
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading customers data...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold ">Customers</h2>
        <Button className="bg-imbila-blue hover:bg-blue-700" onClick={handleAddCustomer}>
          <Plus className="h-4 w-4 mr-1" /> Add Customer
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex justify-start overflow-auto">
          <TabsTrigger value="all">All Customers</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <Card key={customer.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col h-full">
                      <div className="mb-2">
                        <h3 className="font-medium">{customer.name || 'Unknown'}</h3>
                        <p className="text-sm text-gray-500">{customer.email || 'No email'}</p>
                        <p className="text-sm text-gray-500">{customer.phone || 'No phone'}</p>
                      </div>
                      
                      <div className="flex justify-between text-sm my-2">
                        <span>Added:</span>
                        <span className="font-medium">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="mt-auto pt-3 border-t grid grid-cols-3 gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleViewCustomer(customer.id)}
                        >
                          <User className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full" 
                          onClick={() => handleViewInvoices(customer.id)}
                        >
                          <FileText className="h-4 w-4 mr-1" /> Invoices
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full" 
                          onClick={() => handleViewQuotes(customer.id)}
                        >
                          <Mail className="h-4 w-4 mr-1" /> Quotes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">No customers found matching your search.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="mt-6 text-center text-gray-500 py-8">
            <p>Filter view for Active customers would appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="inactive">
          <div className="mt-6 text-center text-gray-500 py-8">
            <p>Filter view for Inactive customers would appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerList;
