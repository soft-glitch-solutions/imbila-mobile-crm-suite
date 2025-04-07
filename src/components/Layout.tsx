
import { useState, useEffect } from "react";
import MobileNavbar from "./shared/MobileNavbar";
import Dashboard from "./Dashboard";
import LeadManagement from "./leads/LeadManagement";
import LeadDetails from "./leads/LeadDetails";
import SalesTracking from "./sales/SalesTracking";
import SaleDetails from "./sales/SaleDetails";
import ComplianceCenter from "./compliance/ComplianceCenter";
import WebsiteTemplates from "./website/WebsiteTemplates";
import WebsiteTemplateSelector from "./website/WebsiteTemplateSelector";
import BusinessTypeSelector from "./BusinessTypeSelector";
import { User, BellRing, Menu, Sun, Moon, Settings, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import QuoteGenerator from "./quotes/QuoteGenerator";
import QuoteHistory from "./quotes/QuoteHistory";
import BusinessProfile from "./profile/BusinessProfile";
import CustomerList from "./customers/CustomerList";
import CustomerDetails from "./customers/CustomerDetails";
import { useIsMobile } from "@/hooks/use-mobile";
import { Switch } from "./ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "./ui/progress";
import BusinessTypeChangeRequest from "./business/BusinessTypeChangeRequest";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

const Layout = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const isMobile = useIsMobile();
  const { user, profile, businessProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Update active tab based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") {
      setActiveTab("Dashboard");
    } else if (path.includes("/leads")) {
      setActiveTab("Leads");
    } else if (path.includes("/sales")) {
      setActiveTab("Sales");
    } else if (path.includes("/customers")) {
      setActiveTab("Customers");
    } else if (path.includes("/quotes")) {
      setActiveTab("Quotes");
    } else if (path.includes("/compliance")) {
      setActiveTab("Compliance");
    } else if (path.includes("/website")) {
      setActiveTab("Website");
    } else if (path.includes("/profile")) {
      setActiveTab("Profile");
    } else if (path.includes("/settings")) {
      setActiveTab("Settings");
    }
  }, [location.pathname]);
  
  const calculateProfileHealth = () => {
    if (!businessProfile) return 0;
    
    let score = 0;
    const totalFields = 5;
    
    if (businessProfile.business_name) score += 1;
    if (businessProfile.email) score += 1;
    if (businessProfile.phone) score += 1;
    if (businessProfile.address) score += 1;
    if (businessProfile.logo_url) score += 1;
    
    return Math.round((score / totalFields) * 100);
  };
  
  const profileHealth = calculateProfileHealth();
  const profileHealthColor = profileHealth < 40 ? "bg-red-500" : profileHealth < 70 ? "bg-yellow-500" : "bg-green-500";
  
  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || "U";
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Navigate based on tab selection
    switch (tab) {
      case "Dashboard":
        navigate("/dashboard");
        break;
      case "Leads":
        navigate("/leads");
        break;
      case "Sales":
        navigate("/sales");
        break;
      case "Customers":
        navigate("/customers");
        break;
      case "Quotes":
        navigate("/quotes");
        break;
      case "Compliance":
        navigate("/compliance");
        break;
      case "Website":
        navigate("/website");
        break;
      case "Profile":
        navigate("/profile");
        break;
      case "Settings":
        navigate("/settings");
        break;
    }
  };
  
  const sidebarItems = [
    { name: "Dashboard", icon: "home" },
    { name: "Website", icon: "file" },
    { name: "Compliance", icon: "clipboard" },
    { name: "Profile", icon: "user" },
    { name: "Settings", icon: "settings" },
  ];

  return (
    <div className={`min-h-full flex flex-col ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
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
                
                {businessProfile && (
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="font-medium">{businessProfile.business_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Profile Completeness:
                      <div className="mt-1 flex items-center gap-2">
                        <Progress 
                          value={profileHealth} 
                          className="h-2 flex-1" 
                          indicatorClassName={profileHealthColor} 
                        />
                        <span className="text-xs font-medium">{profileHealth}%</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="py-4">
                  {sidebarItems.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className={`w-full justify-start text-left px-4 py-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      onClick={() => handleTabChange(item.name)}
                    >
                      {item.name}
                    </Button>
                  ))}
                  
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-left px-4 py-2 ${darkMode ? 'hover:bg-gray-700 text-red-300' : 'hover:bg-gray-100 text-red-500'}`}
                    onClick={signOut}
                  >
                    Sign Out
                  </Button>
                  
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
          
          {businessProfile && (
            <div className="flex-1 px-4 hidden md:block">
              <div className="font-medium">{businessProfile.business_name}</div>
              {profile && (
                <div className="text-xs text-gray-500">
                  Welcome back, {profile.first_name || user?.email?.split('@')[0] || 'User'}
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className={darkMode ? 'text-white' : 'text-gray-600'}>
              <BellRing className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={`rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Avatar>
                    <AvatarImage src={profile?.avatar_url} alt={profile?.first_name || "User"} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleTabChange("Profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTabChange("Settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className={`flex-1 pt-14 pb-16 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
        <div className="container mx-auto max-w-4xl px-4 py-6">
          {businessProfile && profileHealth < 70 && (
            <div className={`mb-4 p-3 rounded-md ${profileHealth < 40 ? 'bg-red-50 border border-red-100 text-red-800' : 'bg-yellow-50 border border-yellow-100 text-yellow-800'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-sm">Complete your business profile</h3>
                  <p className="text-xs mt-0.5">
                    Your business profile is {profileHealth}% complete. Add missing information to get the most out of IMBILA.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/profile')}>
                  Complete Profile
                </Button>
              </div>
              <div className="mt-2">
                <Progress 
                  value={profileHealth} 
                  className="h-1.5" 
                  indicatorClassName={profileHealthColor}
                />
              </div>
            </div>
          )}
          
          <Routes>
            <Route path="/" element={<Dashboard businessType={businessProfile?.business_type || ""} />} />
            <Route path="/dashboard" element={<Dashboard businessType={businessProfile?.business_type || ""} />} />
            <Route path="/leads" element={<LeadManagement businessType={businessProfile?.business_type || ""} />} />
            <Route path="/leads/:id" element={<LeadDetails />} />
            <Route path="/sales" element={<SalesTracking businessType={businessProfile?.business_type || ""} />} />
            <Route path="/sales/:id" element={<SaleDetails />} />
            <Route path="/customers" element={<CustomerList businessType={businessProfile?.business_type || ""} />} />
            <Route path="/customers/:id" element={<CustomerDetails />} />
            <Route path="/quotes" element={<QuoteHistory />} />
            <Route path="/quotes/new" element={<QuoteGenerator businessType={businessProfile?.business_type || ""} />} />
            <Route path="/quotes/:id" element={<QuoteGenerator businessType={businessProfile?.business_type || ""} />} />
            <Route path="/compliance" element={<ComplianceCenter businessType={businessProfile?.business_type || ""} />} />
            <Route path="/website" element={<WebsiteTemplateSelector />} />
            <Route path="/profile" element={<BusinessProfile businessType={businessProfile?.business_type || ""} />} />
            <Route path="/settings" element={
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
                      <h3 className="text-lg font-medium mb-3">Business Type</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Current business type: <span className="font-medium">{businessProfile?.business_type || 'None'}</span></p>
                        </div>
                        <BusinessTypeChangeRequest />
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
            } />
          </Routes>
        </div>
      </main>

      <MobileNavbar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        darkMode={darkMode} 
        extraTabs={[
          { id: "Customers", label: "Customers", icon: "user" }
        ]}
      />
    </div>
  );
};

export default Layout;
