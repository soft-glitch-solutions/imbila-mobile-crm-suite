
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Users, Briefcase, CreditCard, Activity, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface DashboardProps {
  businessType: string;
}

const Dashboard = ({ businessType }: DashboardProps) => {
  // Sample data - in a real app, this would come from API
  const dashboardData = {
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
  };

  const getBusinessTypeTitle = () => {
    const titles: {[key: string]: string} = {
      retail: "Retail Dashboard",
      tender: "Tender Business Dashboard",
      construction: "Construction Dashboard",
      professional: "Professional Services Dashboard",
      education: "Education & Training Dashboard",
      restaurant: "Restaurant Dashboard"
    };
    
    return titles[businessType] || "Business Dashboard";
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-imbila-dark">{getBusinessTypeTitle()}</h2>
        <Button variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-1" /> View Reports
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Leads</CardTitle>
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
              {dashboardData.leads.conversion}% conversion rate
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
              <div className="flex justify-between mb-1">
                <span>Target: {dashboardData.sales.target}</span>
                <span>{dashboardData.sales.progress}%</span>
              </div>
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
          <CardDescription>Your most recent lead activity</CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.recentLeads.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-xs text-gray-500">{lead.company}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4">
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        lead.status === "New" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {lead.status}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">{lead.date}</div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2">
                View All Leads
              </Button>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No recent leads. Start adding leads to see them here.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Tasks & Reminders</CardTitle>
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
                  <span>{task.title}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8">
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
