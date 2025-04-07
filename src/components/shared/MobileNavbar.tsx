
import { Home, User, DollarSign, FileText, Users } from "lucide-react";
import { Button } from "../ui/button";

interface MobileNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode?: boolean;
  extraTabs?: Array<{id: string; label: string; icon: string}>;
}

const MobileNavbar = ({ activeTab, setActiveTab, darkMode = false, extraTabs = [] }: MobileNavbarProps) => {
  const getTabIcon = (tabName: string) => {
    switch (tabName) {
      case "Dashboard":
        return <Home className="h-5 w-5" />;
      case "Leads":
        return <User className="h-5 w-5" />;
      case "Sales":
        return <DollarSign className="h-5 w-5" />;
      case "Customers":
        return <Users className="h-5 w-5" />;
      case "Quotes":
        return <FileText className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: "Dashboard", label: "Dashboard" },
    { id: "Leads", label: "Leads" },
    { id: "Sales", label: "Sales" },
    ...extraTabs,
    { id: "Quotes", label: "Quotes" },
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 border-t z-20 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="grid grid-cols-5 gap-1 py-1">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center justify-center h-14 rounded-none space-y-1 ${
              activeTab === tab.id
                ? darkMode
                  ? 'text-imbila-blue border-t-2 border-imbila-blue'
                  : 'text-imbila-blue border-t-2 border-imbila-blue'
                : darkMode
                ? 'text-gray-400'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {getTabIcon(tab.id)}
            <span className="text-xs">{tab.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavbar;
