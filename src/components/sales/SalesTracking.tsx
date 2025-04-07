
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

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
  created_at: string;
  updated_at: string;
  description?: string;
  customer_id?: string;
  business_id: string;
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
        
        // Transform the database records to match our Sale interface
        const salesData: Sale[] = data.map((sale: any) => ({
          id: sale.id,
          business_id: sale.business_id,
          customer_id: sale.customer_id,
          customer_name: sale.customer_name || 'Unnamed Customer',
          amount: sale.amount,
          date: sale.date,
          status: sale.status,
          items: sale.items || '[]',
          description: sale.description,
          created_at: sale.created_at,
          updated_at: sale.updated_at
        }));
        
        setSales(salesData);
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

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold ">Sales Tracking</h2>
        <Button className="bg-imbila-blue hover:bg-blue-700" onClick={handleNewSale}>
          <Plus className="h-4 w-4 mr-1" /> New Sale
        </Button>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-imbila-blue/10 to-imbila-blue/5">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Sales</p>
              <Skeleton className="h-8 w-32 mt-1" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-imbila-green/10 to-imbila-green/5">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Completed Sales</p>
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-16 mt-1" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
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
      )}

      {/* Sales List */}
      <div className="space-y-4">
        <h3 className="font-semibold">Recent Sales</h3>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24 mt-1" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    
                    <div className="text-sm my-2">
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    
                    <div className="mt-auto pt-3 border-t">
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sales.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sales.map((sale) => (
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
                        {sale.items ? 
                          (() => {
                            try {
                              return JSON.parse(sale.items).map((item: any) => item.name).join(", ")
                            } catch {
                              return "No items"
                            }
                          })()
                          : "No items"}
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
            ))}
          </div>
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No sales found. Click "New Sale" to create one.
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesTracking;
