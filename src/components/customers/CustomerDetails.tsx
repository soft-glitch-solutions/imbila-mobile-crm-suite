
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash, Phone, Mail, FileText, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { businessProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  });

  useEffect(() => {
    if (!id || !businessProfile) return;

    const fetchCustomerData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch customer details
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', id)
          .eq('business_id', businessProfile.id)
          .single();

        if (error) {
          throw error;
        }

        setCustomer(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          notes: data.notes || "",
        });

        // Fetch related sales
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('*')
          .eq('customer_id', id)
          .eq('business_id', businessProfile.id)
          .order('date', { ascending: false });

        if (!salesError) {
          setSales(salesData || []);
        }

        // Fetch related quotes
        const { data: quotesData, error: quotesError } = await supabase
          .from('quotes')
          .select('*')
          .eq('customer_id', id)
          .eq('business_id', businessProfile.id)
          .order('created_at', { ascending: false });

        if (!quotesError) {
          setQuotes(quotesData || []);
        }

      } catch (error) {
        console.error('Error fetching customer data:', error);
        toast.error("Failed to load customer details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [id, businessProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          notes: formData.notes,
          updated_at: new Date()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success("Customer updated successfully");
      setIsEditing(false);
      
      // Update local state
      setCustomer({
        ...customer,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error("Failed to update customer");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Customer deleted successfully");
      navigate('/customers');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error("Failed to delete customer");
    }
  };

  const calculateTotalSpent = () => {
    return sales.reduce((total, sale) => {
      return total + (sale.amount || 0);
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading customer details...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-gray-600">Customer not found</p>
        <Button onClick={() => navigate('/customers')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/customers')} className="p-0">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
        </Button>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-imbila-blue hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="text-red-500" onClick={handleDelete}>
                <Trash className="mr-2 h-4 w-4" /> Delete
              </Button>
              <Button onClick={() => setIsEditing(true)} className="bg-imbila-blue hover:bg-blue-700">
                Edit Customer
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{customer.name}</CardTitle>
                {customer.created_at && (
                  <CardDescription>
                    Customer since {format(new Date(customer.created_at), 'MMMM yyyy')}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{customer.email || "No email provided"}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{customer.phone || "No phone provided"}</span>
                  </div>

                  {customer.address && (
                    <div>
                      <div className="text-sm text-gray-500">Address</div>
                      <p className="whitespace-pre-wrap">{customer.address}</p>
                    </div>
                  )}

                  {customer.notes && (
                    <div className="pt-4 border-t">
                      <div className="text-sm text-gray-500">Notes</div>
                      <p className="whitespace-pre-wrap">{customer.notes}</p>
                    </div>
                  )}

                  <div className="pt-4 flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      <Phone className="mr-2 h-4 w-4" /> Call
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Mail className="mr-2 h-4 w-4" /> Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Total Spent</div>
                    <div className="text-2xl font-bold">
                      R{calculateTotalSpent().toLocaleString('en-ZA', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">Sales</div>
                    <div className="font-medium">{sales.length}</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">Quotes</div>
                    <div className="font-medium">{quotes.length}</div>
                  </div>

                  <div className="pt-4 flex flex-col space-y-2">
                    <Button variant="secondary" onClick={() => navigate(`/quotes/new?customer=${id}`)}>
                      <FileText className="mr-2 h-4 w-4" /> Create Quote
                    </Button>
                    <Button className="bg-imbila-blue hover:bg-blue-700" onClick={() => navigate(`/sales/new?customer=${id}`)}>
                      <DollarSign className="mr-2 h-4 w-4" /> Record Sale
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="sales">
            <TabsList>
              <TabsTrigger value="sales">Sales History</TabsTrigger>
              <TabsTrigger value="quotes">Quotes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales History</CardTitle>
                </CardHeader>
                <CardContent>
                  {sales.length > 0 ? (
                    <div className="divide-y">
                      {sales.map((sale) => (
                        <div
                          key={sale.id}
                          className="py-4 cursor-pointer hover:bg-gray-50 rounded-md px-2"
                          onClick={() => navigate(`/sales/${sale.id}`)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">
                                R{Number(sale.amount).toLocaleString('en-ZA', { 
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(new Date(sale.date), 'PPP')}
                              </div>
                              {sale.description && (
                                <div className="text-sm mt-1 line-clamp-1">{sale.description}</div>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              sale.status === "completed" ? "bg-green-100 text-green-800" :
                              sale.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              sale.status === "cancelled" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No sales history found for this customer.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="quotes" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quotes</CardTitle>
                </CardHeader>
                <CardContent>
                  {quotes.length > 0 ? (
                    <div className="divide-y">
                      {quotes.map((quote) => (
                        <div
                          key={quote.id}
                          className="py-4 cursor-pointer hover:bg-gray-50 rounded-md px-2"
                          onClick={() => navigate(`/quotes/${quote.id}`)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{quote.title}</div>
                              <div className="text-sm text-gray-500">
                                R{Number(quote.total).toLocaleString('en-ZA', { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(new Date(quote.created_at), 'PPP')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No quotes found for this customer.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default CustomerDetails;
