
import { useState } from "react";
import MobileNavbar from "./shared/MobileNavbar";
import Dashboard from "./Dashboard";
import LeadManagement from "./leads/LeadManagement";
import SalesTracking from "./sales/SalesTracking";
import ComplianceCenter from "./compliance/ComplianceCenter";
import WebsiteTemplates from "./website/WebsiteTemplates";
import BusinessTypeSelector from "./BusinessTypeSelector";
import { User, BellRing, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const Layout = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [businessType, setBusinessType] = useState<string | null>(null);
  
  const renderContent = () => {
    if (!businessType) {
      return (
        <div className="px-4 py-6">
          <BusinessTypeSelector onSelectBusinessType={(type) => setBusinessType(type)} />
        </div>
      );
    }
    
    switch (activeTab) {
      case "Dashboard":
        return <Dashboard businessType={businessType} />;
      case "Leads":
        return <LeadManagement businessType={businessType} />;
      case "Sales":
        return <SalesTracking businessType={businessType} />;
      case "Compliance":
        return <ComplianceCenter businessType={businessType} />;
      case "Website":
        return <WebsiteTemplates businessType={businessType} />;
      case "Settings":
        return (
          <div className="p-4">
            <Card className="p-6 text-center">
              <h2 className="text-xl font-bold mb-4">Settings</h2>
              <p className="text-gray-500">Settings panel would be displayed here.</p>
            </Card>
          </div>
        );
      default:
        return <Dashboard businessType={businessType} />;
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-20">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="font-bold text-xl text-imbila-blue flex items-center">
              <span className="mr-1">💼</span> IMBILA
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-gray-600">
              <BellRing className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-gray-100 rounded-full text-gray-600">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-14 pb-16">
        <div className="container mx-auto max-w-4xl px-4 py-6">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Layout;
