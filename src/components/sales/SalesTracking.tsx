
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, FileText, Download } from "lucide-react";
import { toast } from "sonner";

interface SalesTrackingProps {
  businessType: string;
}

const SalesTracking = ({ businessType }: SalesTrackingProps) => {
  // Sample data for sales
  const monthlySales = [
    { name: 'Jan', sales: 4000, expenses: 2400, profit: 1600 },
    { name: 'Feb', sales: 3000, expenses: 1398, profit: 1602 },
    { name: 'Mar', sales: 9800, expenses: 4000, profit: 5800 },
    { name: 'Apr', sales: 3908, expenses: 2500, profit: 1408 },
    { name: 'May', sales: 4800, expenses: 3000, profit: 1800 },
    { name: 'Jun', sales: 3800, expenses: 2000, profit: 1800 },
  ];

  const recentSales = [
    { id: 1, customer: "Tech Solutions Ltd", amount: "R12,500", date: "2025-04-01", status: "Paid" },
    { id: 2, customer: "Brown Consulting", amount: "R28,000", date: "2025-03-28", status: "Pending" },
    { id: 3, customer: "Innovate Inc", amount: "R5,750", date: "2025-03-25", status: "Paid" },
    { id: 4, customer: "Wilson Group", amount: "R18,300", date: "2025-03-20", status: "Paid" },
  ];

  const handleNewSale = () => {
    // In a real app, this would open a form to add a new sale
    toast.info("New sale form would open here");
  };

  const handleGenerateReport = () => {
    toast.success("Sales report is being generated");
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-imbila-dark">Sales Tracking</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleGenerateReport}>
            <FileText className="h-4 w-4 mr-1" /> Report
          </Button>
          <Button className="bg-imbila-blue hover:bg-blue-700" onClick={handleNewSale}>
            <Plus className="h-4 w-4 mr-1" /> New Sale
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly">
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly" className="pt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlySales}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#2563eb" name="Sales" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                    <Bar dataKey="profit" fill="#10b981" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="quarterly">
              <div className="h-[300px]">
                <div className="flex items-center justify-center h-full text-gray-500">
                  Quarterly data visualization would appear here
                </div>
              </div>
            </TabsContent>
            <TabsContent value="yearly">
              <div className="h-[300px]">
                <div className="flex items-center justify-center h-full text-gray-500">
                  Yearly data visualization would appear here
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium">{sale.customer}</div>
                    <div className="text-sm text-gray-500">{sale.date}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-semibold">{sale.amount}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      sale.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {sale.status}
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" size="sm">
                View All Sales
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Total Sales</div>
                  <div className="text-2xl font-bold mt-1">R78,050</div>
                  <div className="text-sm text-green-600 mt-1">↑ 12.5% vs last month</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Total Profit</div>
                  <div className="text-2xl font-bold mt-1">R35,750</div>
                  <div className="text-sm text-green-600 mt-1">↑ 8.3% vs last month</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Avg. Sale Value</div>
                  <div className="text-2xl font-bold mt-1">R7,805</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Sales Count</div>
                  <div className="text-2xl font-bold mt-1">10</div>
                  <div className="text-xs text-gray-500 mt-1">This month</div>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleGenerateReport}>
                <Download className="h-4 w-4 mr-1" /> Export Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesTracking;
