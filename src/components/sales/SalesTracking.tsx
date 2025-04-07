
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SalesTrackingProps {
  businessType: string;
}

interface Sale {
  id: string;
  customer_name: string;
  amount: number;
  date: string;
  status: string;
  items: string;
}

const SalesTracking = ({ businessType }: SalesTrackingProps) => {
  const navigate = useNavigate();
  const { businessProfile } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      if (!businessProfile) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('sales')
          .select('*')
          .eq('business_id', businessProfile.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setSales(data || []);
      } catch (error) {
        console.error('Error fetching sales:', error);
        toast.error('Failed to load sales data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSales();
  }, [businessProfile]);

  const handleNewSale = () => {
    // In a real app, this would navigate to a new sale form
    navigate('/sales/new');
  };

  const handleViewSale = (id: string) => {
    navigate(`/sales/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate summary numbers
  const totalSales = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
  const paidSales = sales.filter(sale => sale.status === "paid").length;
  const pendingSales = sales.filter(sale => sale.status === "pending").length;

  if (isLoading) {
    return <div className="text-center py-10">Loading sales data...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold ">Sales Tracking</h2>
        <Button className="bg-imbila-blue hover:bg-blue-700" onClick={handleNewSale}>
          <Plus className="h-4 w-4 mr-1" /> New Sale
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-imbila-blue/10 to-imbila-blue/5">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Sales</p>
            <h3 className="text-2xl font-bold">R{totalSales.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</h3>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-imbila-green/10 to-imbila-green/5">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Completed Sales</p>
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">{paidSales}</h3>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{pendingSales} pending</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales List */}
      <div className="space-y-4">
        <h3 className="font-semibold">Recent Sales</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sales.length > 0 ? (
            sales.map((sale) => (
              <Card key={sale.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{sale.customer_name}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(sale.date || sale.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(sale.status)}`}>
                        {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="text-sm my-2">
                      <p className="font-medium mb-1">
                        R{sale.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {sale.items ? JSON.parse(sale.items).map((item: any) => item.name).join(", ") : "No items"}
                      </p>
                    </div>
                    
                    <div className="mt-auto pt-3 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleViewSale(sale.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-500">
              No sales found. Click "New Sale" to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesTracking;
