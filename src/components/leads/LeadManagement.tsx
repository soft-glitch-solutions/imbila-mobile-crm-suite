
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Filter, ArrowUpDown, MoreHorizontal, Phone, Mail } from "lucide-react";
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
  );

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

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-imbila-dark">Lead Management</h2>
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

      <Tabs defaultValue="all">
        <TabsList className="flex justify-start overflow-auto">
          <TabsTrigger value="all">All Leads</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="contacted">Contacted</TabsTrigger>
          <TabsTrigger value="qualified">Qualified</TabsTrigger>
          <TabsTrigger value="proposal">Proposal</TabsTrigger>
          <TabsTrigger value="won">Won</TabsTrigger>
          <TabsTrigger value="lost">Lost</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base font-medium">All Leads ({filteredLeads.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[180px]">Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.company}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{lead.value}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No leads found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new">
          <div className="mt-6 text-center text-gray-500 py-8">
            <p>Filter view for New leads would appear here</p>
          </div>
        </TabsContent>
        
        <TabsContent value="contacted">
          <div className="mt-6 text-center text-gray-500 py-8">
            <p>Filter view for Contacted leads would appear here</p>
          </div>
        </TabsContent>
        
        {/* Additional tabs would have similar placeholder content */}
      </Tabs>
    </div>
  );
};

export default LeadManagement;
