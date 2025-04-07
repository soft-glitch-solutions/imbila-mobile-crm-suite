
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash, CalendarIcon, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { businessProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [sale, setSale] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    status: "",
    description: "",
    date: "",
    customer_id: ""
  });

  useEffect(() => {
    if (!id || !businessProfile) return;

    const fetchSale = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('sales')
          .select('*')
          .eq('id', id)
          .eq('business_id', businessProfile.id)
          .single();

        if (error) {
          throw error;
        }

        setSale(data);
        
        // Format date for form
        const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : "";
        
        setFormData({
          amount: data.amount?.toString() || "",
          status: data.status || "completed",
          description: data.description || "",
          date: formattedDate,
          customer_id: data.customer_id || ""
        });

        // Fetch customer if customer_id exists
        if (data.customer_id) {
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .eq('id', data.customer_id)
            .single();

          if (!customerError) {
            setCustomer(customerData);
          }
        }
      } catch (error) {
        console.error('Error fetching sale:', error);
        toast.error("Failed to load sale details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSale();
  }, [id, businessProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('sales')
        .update({
          amount: parseFloat(formData.amount),
          status: formData.status,
          description: formData.description,
          date: formData.date,
          updated_at: new Date()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success("Sale updated successfully");
      setIsEditing(false);
      
      // Update local state
      setSale({
        ...sale,
        amount: parseFloat(formData.amount),
        status: formData.status,
        description: formData.description,
        date: formData.date
      });
    } catch (error) {
      console.error('Error updating sale:', error);
      toast.error("Failed to update sale");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this sale?")) return;

    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Sale deleted successfully");
      navigate('/sales');
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error("Failed to delete sale");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading sale details...</p>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-gray-600">Sale not found</p>
        <Button onClick={() => navigate('/sales')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sales
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/sales')} className="p-0">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sales
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
                Edit Sale
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Sale Details</span>
            <span className={`text-sm px-2 py-1 rounded-full ${
              sale.status === "completed" ? "bg-green-100 text-green-800" :
              sale.status === "pending" ? "bg-yellow-100 text-yellow-800" :
              sale.status === "cancelled" ? "bg-red-100 text-red-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {isEditing ? (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (R)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      type="number"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <div className="text-sm p-2 bg-gray-50 rounded border">
                      {customer ? customer.name : "No customer linked"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold">R {Number(sale.amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{format(new Date(sale.date), 'PPP')}</span>
                      </div>
                      
                      {customer && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{customer.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Created</div>
                      <div>{new Date(sale.created_at).toLocaleDateString()}</div>
                    </div>
                    {sale.updated_at && sale.updated_at !== sale.created_at && (
                      <div>
                        <div className="text-sm text-gray-500">Last Updated</div>
                        <div>{new Date(sale.updated_at).toLocaleDateString()}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-500">Description</div>
                  <p className="mt-1 whitespace-pre-wrap">{sale.description || "No description provided."}</p>
                </div>

                {customer && (
                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-500 mb-2">Customer Information</div>
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="font-medium">{customer.name}</div>
                          {customer.email && <div className="text-sm">{customer.email}</div>}
                          {customer.phone && <div className="text-sm">{customer.phone}</div>}
                          {customer.address && <div className="text-sm text-gray-500">{customer.address}</div>}
                        </div>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto mt-2 text-imbila-blue"
                          onClick={() => navigate(`/customers/${customer.id}`)}
                        >
                          View Customer Profile
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaleDetails;
