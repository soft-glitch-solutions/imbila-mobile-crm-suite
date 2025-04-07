
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Users, Briefcase, CreditCard, Activity, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface DashboardProps {
  businessType: string;
}

interface Lead {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

interface Task {
  id: number;
  title: string;
  priority: string;
}

const Dashboard = ({ businessType }: DashboardProps) => {
  const { profile, businessProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  const [dashboardData, setDashboardData] = useState({
    leads: {
      total: 0,
      new: 0,
      conversion: 0,
    },
    sales: {
      total: 0,
      change: 0,
      target: 30000,
      progress: 0
    },
    expenses: {
      total: 0,
      change: 0
    },
    tasks: [] as Task[],
    recentLeads: [] as Lead[]
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!businessProfile) return;
      
      setIsLoading(true);
      
      try {
        // Fetch leads data
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .eq('business_id', businessProfile.id);
          
        if (leadsError) throw leadsError;
        
        // Fetch sales data
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('*')
          .eq('business_id', businessProfile.id);
          
        if (salesError) throw salesError;
        
        // Calculate dashboard metrics
        const allLeads = leadsData || [];
        const newLeads = allLeads.filter(lead => lead.status === 'new').length;
        const qualifiedLeads = allLeads.filter(lead => 
          ['qualified', 'proposal', 'negotiation', 'won'].includes(lead.status)
        ).length;
        
        const conversionRate = allLeads.length > 0 
          ? Math.round((qualifiedLeads / allLeads.length) * 100) 
          : 0;
        
        const allSales = salesData || [];
        const totalSales = allSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
        
        // Get previous month sales for comparison
        const currentDate = new Date();
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        
        const previousMonthSales = allSales
          .filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate.getMonth() === lastMonth.getMonth() && 
                  saleDate.getFullYear() === lastMonth.getFullYear();
          })
          .reduce((sum, sale) => sum + (sale.amount || 0), 0);
          
        const currentMonthSales = allSales
          .filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate.getMonth() === currentDate.getMonth() && 
                  saleDate.getFullYear() === currentDate.getFullYear();
          })
          .reduce((sum, sale) => sum + (sale.amount || 0), 0);
        
        // Calculate percentage change
        const salesChange = previousMonthSales > 0 
          ? Math.round(((currentMonthSales - previousMonthSales) / previousMonthSales) * 100)
          : 0;
        
        // Calculate progress towards target
        const target = 30000; // Example target
        const progress = totalSales > 0 
          ? Math.min(Math.round((totalSales / target) * 100), 100)
          : 0;
        
        // Get recent leads
        const recentLeads = [...allLeads]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        
        // Sample tasks - in a real app, you would fetch these from a tasks table
        const tasks = [
          { id: 1, title: "Follow up with new leads", priority: "high" },
          { id: 2, title: "Update business profile", priority: "medium" },
          { id: 3, title: "Review sales performance", priority: "low" }
        ];
        
        setDashboardData({
          leads: {
            total: allLeads.length,
            new: newLeads,
            conversion: conversionRate,
          },
          sales: {
            total: totalSales,
            change: salesChange,
            target,
            progress
          },
          expenses: {
            total: totalSales * 0.35, // Example: expenses are 35% of sales
            change: -5.2
          },
          tasks,
          recentLeads
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [businessProfile]);

  // Function to get the welcome message with the user's name
  const getWelcomeMessage = () => {
    const firstName = profile?.first_name || "User";
    const lastName = profile?.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    
    const hour = new Date().getHours();
    let greeting = "Welcome";
    
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";
    
    return `${greeting}, ${fullName}`;
  };

  const handleNavigateToLead = (id: string) => {
    navigate(`/leads/${id}`);
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-xl font-bold ">
          {businessProfile?.business_name || "Business Dashboard"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">{getWelcomeMessage()}</p>
      </div>

      {/* Dashboard content */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{dashboardData.leads.total}</div>
              <div className="flex items-center text-xs font-medium text-green-600">
                <ArrowUp className="h-3 w-3 mr-1" />
                {dashboardData.leads.new} new
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {dashboardData.leads.conversion}% conversion
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">
                R{dashboardData.sales.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </div>
              <div className={`flex items-center text-xs font-medium ${dashboardData.sales.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dashboardData.sales.change >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(dashboardData.sales.change)}%
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <Progress value={dashboardData.sales.progress} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">
                R{dashboardData.expenses.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </div>
              <div className={`flex items-center text-xs font-medium ${dashboardData.expenses.change <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dashboardData.expenses.change <= 0 ? (
                  <ArrowDown className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowUp className="h-3 w-3 mr-1" />
                )}
                {Math.abs(dashboardData.expenses.change)}%
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              vs. last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">
                R{(dashboardData.sales.total - dashboardData.expenses.total).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center text-xs font-medium text-green-600">
                <ArrowUp className="h-3 w-3 mr-1" />
                {dashboardData.sales.total > 0 ? 
                  Math.round(((dashboardData.sales.total - dashboardData.expenses.total) / dashboardData.sales.total) * 100) : 0}%
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {dashboardData.sales.total > 0 ? 
                Math.round(((dashboardData.sales.total - dashboardData.expenses.total) / dashboardData.sales.total) * 100) : 0}% margin
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.recentLeads.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentLeads.map((lead) => (
                <div 
                  key={lead.id} 
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-md"
                  onClick={() => handleNavigateToLead(lead.id)}
                >
                  <div>
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2">
                      <div className={`text-xs px-2 py-0.5 rounded-full ${
                        lead.status === "new" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2 text-xs"
                onClick={() => navigate('/leads')}
              >
                View All Leads
              </Button>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              No recent leads.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dashboardData.tasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-3 rounded-md border bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === "high" ? "bg-red-500" : 
                    task.priority === "medium" ? "bg-yellow-500" : "bg-blue-500"
                  }`} />
                  <span className="text-sm">{task.title}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  Complete
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
