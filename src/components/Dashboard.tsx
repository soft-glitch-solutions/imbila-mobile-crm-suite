import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Users, Briefcase, CreditCard, Activity, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardProps {
  businessType: string;
}

const Dashboard = ({ businessType }: DashboardProps) => {
  const { profile, businessProfile } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    leads: {
      total: 0,
      new: 0,
      conversion: 0,
    },
    sales: {
      total: "R0",
      change: 0,
      target: "R30,000",
      progress: 0
    },
    expenses: {
      total: "R0",
      change: 0
    },
    tasks: [] as { id: number; title: string; priority: string }[],
    recentLeads: [] as { id: number; name: string; company: string; status: string; date: string }[]
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!businessProfile) return;
      
      // Fetch real data from Supabase
      try {
        // Sample data for now - in a production app, this would be real data from API
        setDashboardData({
          leads: {
            total: 28,
            new: 5,
            conversion: 32,
          },
          sales: {
            total: "R24,500",
            change: 12.5,
            target: "R30,000",
            progress: 82
          },
          expenses: {
            total: "R8,750",
            change: -5.2
          },
          tasks: [
            { id: 1, title: "Follow up with John about quote", priority: "high" },
            { id: 2, title: "Renew business license", priority: "medium" },
            { id: 3, title: "Update website content", priority: "low" }
          ],
          recentLeads: [
            { id: 1, name: "Sarah Johnson", company: "Tech Solutions", status: "New", date: "Today" },
            { id: 2, name: "Michael Brown", company: "Brown Consulting", status: "Contacted", date: "Yesterday" },
          ]
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-xl font-bold text-imbila-dark">
          {businessProfile?.business_name || "Business Dashboard"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">{getWelcomeMessage()}</p>
      </div>

      {/* Rest of the dashboard content */}
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
                {dashboardData.leads.new}
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
              <div className="text-2xl font-bold">{dashboardData.sales.total}</div>
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
              <div className="text-2xl font-bold">{dashboardData.expenses.total}</div>
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
              <div className="text-2xl font-bold">R15,750</div>
              <div className="flex items-center text-xs font-medium text-green-600">
                <ArrowUp className="h-3 w-3 mr-1" />
                18.3%
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              64% margin
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
                <div key={lead.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-xs text-gray-500">{lead.company}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2">
                      <div className={`text-xs px-2 py-0.5 rounded-full ${
                        lead.status === "New" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {lead.status}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">{lead.date}</div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs">
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
