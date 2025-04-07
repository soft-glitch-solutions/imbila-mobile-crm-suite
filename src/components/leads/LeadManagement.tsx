
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  notes: string;
  created_at: string;
}

interface LeadManagementProps {
  businessType: string;
}

const LeadManagement = ({ businessType }: LeadManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { businessProfile } = useAuth();
  
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    status: "new",
    source: "",
    notes: ""
  });

  useEffect(() => {
    const fetchLeads = async () => {
      if (!businessProfile) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('business_id', businessProfile.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setLeads(data || []);
      } catch (error) {
        console.error('Error fetching leads:', error);
        toast.error('Failed to load leads data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeads();
  }, [businessProfile]);

  const filteredLeads = leads.filter((lead) =>
    (lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.status?.toLowerCase().includes(searchTerm.toLowerCase()))
    &&
    (activeTab === "all" || lead.status.toLowerCase() === activeTab.toLowerCase())
  );

  const handleAddLead = async () => {
    if (!businessProfile) {
      toast.error('You must have a business profile to add leads');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          business_id: businessProfile.id,
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          status: newLead.status,
          source: newLead.source,
          notes: newLead.notes
        })
        .select();
        
      if (error) throw error;
      
      toast.success('New lead added successfully!');
      setIsAddDialogOpen(false);
      
      // Add the new lead to the state
      if (data && data.length > 0) {
        setLeads(prevLeads => [data[0], ...prevLeads]);
      }
      
      // Reset form
      setNewLead({
        name: "",
        email: "",
        phone: "",
        status: "new",
        source: "",
        notes: ""
      });
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead');
    }
  };

  const handleViewLead = (id: string) => {
    navigate(`/leads/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-green-100 text-green-800";
      case "contacted":
        return "bg-blue-100 text-blue-800";
      case "qualified":
        return "bg-purple-100 text-purple-800";
      case "proposal":
        return "bg-orange-100 text-orange-800";
      case "negotiation":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading leads data...</div>;
  }

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
                <Label htmlFor="source" className="text-right">
                  Source
                </Label>
                <Input
                  id="source"
                  value={newLead.source}
                  onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                  className="col-span-3"
                  placeholder="Website, Referral, etc."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
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
                <Card key={lead.id} className="overflow-hidden cursor-pointer" onClick={() => handleViewLead(lead.id)}>
                  <CardContent className="p-4">
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{lead.name}</h3>
                          <p className="text-sm text-gray-500">{lead.email || 'No email'}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(lead.status)}`}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="text-sm my-2">
                        <p className="text-gray-500">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </p>
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
