
import { useState, useEffect } from "react";
import MobileNavbar from "./shared/MobileNavbar";
import Dashboard from "./Dashboard";
import LeadManagement from "./leads/LeadManagement";
import SalesTracking from "./sales/SalesTracking";
import ComplianceCenter from "./compliance/ComplianceCenter";
import WebsiteTemplates from "./website/WebsiteTemplates";
import BusinessTypeSelector from "./BusinessTypeSelector";
import { User, BellRing, Menu, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import QuoteGenerator from "./quotes/QuoteGenerator";
import BusinessProfile from "./profile/BusinessProfile";
import CustomerList from "./customers/CustomerList";
import { useIsMobile } from "@/hooks/use-mobile";
import { Switch } from "./ui/switch";

const Layout = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const isMobile = useIsMobile();
  
  // Load business type from localStorage
  useEffect(() => {
    const storedBusinessType = localStorage.getItem("selectedBusinessType");
    if (storedBusinessType) {
      setBusinessType(storedBusinessType);
    }
  }, []);
  
  // Effect to apply dark mode class to document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
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
      case "Customers":
        return <CustomerList businessType={businessType} />;
      case "Quotes":
        return <QuoteGenerator businessType={businessType} />;
      case "Compliance":
        return <ComplianceCenter businessType={businessType} />;
      case "Website":
        return <WebsiteTemplates businessType={businessType} />;
      case "Settings":
        return (
          <div className="p-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Appearance</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                      <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                    <Switch 
                      checked={darkMode} 
                      onCheckedChange={setDarkMode}
                    />
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-3">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Email Notifications</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Push Notifications</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-3">Account</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Subscription Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-700">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      case "Profile":
        return <BusinessProfile businessType={businessType} />;
      default:
        return <Dashboard businessType={businessType} />;
    }
  };

  // Sidebar menu items
  const sidebarItems = [
    { name: "Dashboard", icon: "home" },
    { name: "Website", icon: "file" },
    { name: "Compliance", icon: "clipboard" },
    { name: "Profile", icon: "user" },
    { name: "Settings", icon: "settings" },
  ];

  return (
    <div className={`min-h-full flex flex-col ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b fixed top-0 left-0 right-0 z-20`}>
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className={`w-[240px] p-0 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                <div className={`py-4 px-4 ${darkMode ? 'bg-imbila-blue text-white' : 'bg-imbila-blue text-white'} flex items-center`}>
                  <div className="font-bold text-xl flex items-center">
                    <span className="mr-1">💼</span> IMBILA
                  </div>
                </div>
                <div className="py-4">
                  {sidebarItems.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className={`w-full justify-start text-left px-4 py-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      onClick={() => {
                        setActiveTab(item.name);
                        setSidebarOpen(false);
                      }}
                    >
                      {item.name}
                    </Button>
                  ))}
                  
                  {/* Dark mode toggle in sidebar */}
                  <div className={`px-4 py-3 mt-2 flex items-center justify-between ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
                    <div className="flex items-center space-x-2">
                      {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      <span className="text-sm">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                    <Switch 
                      checked={darkMode} 
                      onCheckedChange={setDarkMode}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-imbila-blue'} flex items-center`}>
              <span className="mr-1">💼</span> IMBILA
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className={darkMode ? 'text-white' : 'text-gray-600'}>
              <BellRing className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full ${darkMode ? 'text-white' : 'text-gray-600'}`}>
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 pt-14 pb-16 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
        <div className="container mx-auto max-w-4xl px-4 py-6">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        darkMode={darkMode} 
        // Add the Customers tab between Sales and Quotes
        extraTabs={[
          { id: "Customers", label: "Customers", icon: "user" }
        ]}
      />
    </div>
  );
};

export default Layout;
