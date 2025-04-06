
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Filter, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  value: string;
  date: string;
}

interface LeadManagementProps {
  businessType: string;
}

const LeadManagement = ({ businessType }: LeadManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "New",
    value: "",
  });

  // Sample data
  const leads: Lead[] = [
    { 
      id: 1, 
      name: "Sarah Johnson", 
      company: "Tech Solutions", 
      email: "sarah@techsolutions.com",
      phone: "(011) 555-1234",
      status: "New", 
      value: "R12,500",
      date: "2025-03-28"
    },
    { 
      id: 2, 
      name: "Michael Brown", 
      company: "Brown Consulting", 
      email: "michael@brownconsulting.com",
      phone: "(012) 555-5678",
      status: "Contacted", 
      value: "R28,000",
      date: "2025-03-25"
    },
    { 
      id: 3, 
      name: "Emily Davis", 
      company: "Innovate Inc", 
      email: "emily@innovate.com",
      phone: "(021) 555-9012",
      status: "Qualified", 
      value: "R45,000",
      date: "2025-03-20"
    },
    { 
      id: 4, 
      name: "Robert Wilson", 
      company: "Wilson Group", 
      email: "robert@wilsongroup.com",
      phone: "(031) 555-3456",
      status: "Proposal", 
      value: "R78,000",
      date: "2025-03-15"
    },
    { 
      id: 5, 
      name: "Jennifer Lee", 
      company: "Creative Solutions", 
      email: "jennifer@creative.com",
      phone: "(041) 555-7890",
      status: "Negotiation", 
      value: "R35,000",
      date: "2025-03-10"
    }
  ];

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.status.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(lead => activeTab === "all" || lead.status.toLowerCase() === activeTab.toLowerCase());

  const handleAddLead = () => {
    // In a real app, this would call an API to add the lead
    toast.success("New lead added successfully!");
    setIsAddDialogOpen(false);
    // Reset form
    setNewLead({
      name: "",
      company: "",
      email: "",
      phone: "",
      status: "New",
      value: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-green-100 text-green-800";
      case "Contacted":
        return "bg-blue-100 text-blue-800";
      case "Qualified":
        return "bg-purple-100 text-purple-800";
      case "Proposal":
        return "bg-orange-100 text-orange-800";
      case "Negotiation":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold ">Lead Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-imbila-blue hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-1" /> Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <DialogDescription>
                Enter the details of your new lead below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">
                  Company
                </Label>
                <Input
                  id="company"
                  value={newLead.company}
                  onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  Value (R)
                </Label>
                <Input
                  id="value"
                  value={newLead.value}
                  onChange={(e) => setNewLead({...newLead, value: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button className="bg-imbila-blue hover:bg-blue-700" onClick={handleAddLead}>Save Lead</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="flex justify-start overflow-auto">
          <TabsTrigger value="all">All Leads</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="contacted">Contacted</TabsTrigger>
          <TabsTrigger value="qualified">Qualified</TabsTrigger>
          <TabsTrigger value="proposal">Proposal</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <Card key={lead.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{lead.name}</h3>
                          <p className="text-sm text-gray-500">{lead.company}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                      
                      <div className="text-sm my-2">
                        <p className="font-medium mb-1">Value: {lead.value}</p>
                        <p className="text-gray-500">{lead.date}</p>
                      </div>
                      
                      <div className="mt-auto pt-3 border-t flex justify-between">
                        <Button variant="ghost" size="sm" className="flex-1">
                          <Phone className="h-4 w-4 mr-1" /> Call
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1">
                          <Mail className="h-4 w-4 mr-1" /> Email
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">No leads found matching your search.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadManagement;
