
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface SalesTrackingProps {
  businessType: string;
}

interface Sale {
  id: number;
  customer: string;
  amount: string;
  date: string;
  status: string;
  items?: string[];
}

const SalesTracking = ({ businessType }: SalesTrackingProps) => {
  // Sample data for sales
  const recentSales: Sale[] = [
    { 
      id: 1, 
      customer: "Tech Solutions Ltd", 
      amount: "R12,500", 
      date: "2025-04-01", 
      status: "Paid",
      items: ["Website Development", "SEO Package"]
    },
    { 
      id: 2, 
      customer: "Brown Consulting", 
      amount: "R28,000", 
      date: "2025-03-28", 
      status: "Pending",
      items: ["Business Strategy", "Market Research"]
    },
    { 
      id: 3, 
      customer: "Innovate Inc", 
      amount: "R5,750", 
      date: "2025-03-25", 
      status: "Paid",
      items: ["Logo Design"]
    },
    { 
      id: 4, 
      customer: "Wilson Group", 
      amount: "R18,300", 
      date: "2025-03-20", 
      status: "Paid",
      items: ["Social Media Campaign", "Content Creation"]
    },
    { 
      id: 5, 
      customer: "Creative Solutions", 
      amount: "R8,750", 
      date: "2025-03-15", 
      status: "Overdue",
      items: ["Branding Package"]
    },
    { 
      id: 6, 
      customer: "Global Enterprises", 
      amount: "R45,000", 
      date: "2025-03-10", 
      status: "Paid",
      items: ["Website Redesign", "SEO Optimization", "Content Creation"]
    }
  ];

  const handleNewSale = () => {
    // In a real app, this would open a form to add a new sale
    toast.info("New sale form would open here");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate summary numbers
  const totalSales = recentSales.reduce((sum, sale) => sum + parseInt(sale.amount.replace(/[^0-9]/g, '')), 0) / 100;
  const paidSales = recentSales.filter(sale => sale.status === "Paid").length;
  const pendingSales = recentSales.filter(sale => sale.status === "Pending").length;

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
            <h3 className="text-2xl font-bold">R{totalSales.toLocaleString()}</h3>
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
          {recentSales.map((sale) => (
            <Card key={sale.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{sale.customer}</h3>
                      <p className="text-sm text-gray-500">{sale.date}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(sale.status)}`}>
                      {sale.status}
                    </span>
                  </div>
                  
                  <div className="text-sm my-2">
                    <p className="font-medium mb-1">{sale.amount}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {sale.items?.join(", ")}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-3 border-t">
                    <Button variant="ghost" size="sm" className="w-full">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesTracking;
