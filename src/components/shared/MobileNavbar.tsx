
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, Home, User, Users, Clipboard, File, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  icon: React.ReactNode;
}

const MobileNavbar = ({ activeTab, setActiveTab }: { 
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const navItems: NavItem[] = [
    { name: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Leads", icon: <Users className="h-5 w-5" /> },
    { name: "Sales", icon: <Briefcase className="h-5 w-5" /> },
    { name: "Compliance", icon: <Clipboard className="h-5 w-5" /> },
    { name: "Website", icon: <File className="h-5 w-5" /> },
    { name: "Settings", icon: <Settings className="h-5 w-5" /> }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            size="sm"
            className={cn(
              "flex flex-col items-center justify-center h-full rounded-none px-2",
              activeTab === item.name ? "text-imbila-blue border-t-2 border-imbila-blue" : "text-gray-500"
            )}
            onClick={() => setActiveTab(item.name)}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavbar;
