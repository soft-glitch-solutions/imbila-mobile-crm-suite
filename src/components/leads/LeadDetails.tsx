
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { businessProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [lead, setLead] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "",
    value: "",
    notes: "",
    source: ""
  });

  useEffect(() => {
    if (!id || !businessProfile) return;

    const fetchLead = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('id', id)
          .eq('business_id', businessProfile.id)
          .single();

        if (error) {
          throw error;
        }

        setLead(data);
        setFormData({
          name: data.name || "",
          company: data.company || "",
          email: data.email || "",
          phone: data.phone || "",
          status: data.status || "new",
          value: data.value || "",
          notes: data.notes || "",
          source: data.source || ""
        });
      } catch (error) {
        console.error('Error fetching lead:', error);
        toast.error("Failed to load lead details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLead();
  }, [id, businessProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          name: formData.name,
          company: formData.company,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
          value: formData.value,
          notes: formData.notes,
          source: formData.source,
          updated_at: new Date()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success("Lead updated successfully");
      setIsEditing(false);
      // Refresh lead data
      setLead({ ...lead, ...formData });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error("Failed to update lead");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Lead deleted successfully");
      navigate('/leads');
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error("Failed to delete lead");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading lead details...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-gray-600">Lead not found</p>
        <Button onClick={() => navigate('/leads')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Leads
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/leads')} className="p-0">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Leads
        </Button>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-imbila-blue hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="text-red-500" onClick={handleDelete}>
                <Trash className="mr-2 h-4 w-4" /> Delete
              </Button>
              <Button onClick={() => setIsEditing(true)} className="bg-imbila-blue hover:bg-blue-700">
                Edit Lead
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Lead Details</span>
            <span className={`text-sm px-2 py-1 rounded-full ${
              lead.status === "new" ? "bg-green-100 text-green-800" :
              lead.status === "contacted" ? "bg-blue-100 text-blue-800" :
              lead.status === "qualified" ? "bg-purple-100 text-purple-800" :
              lead.status === "proposal" ? "bg-orange-100 text-orange-800" :
              lead.status === "negotiation" ? "bg-yellow-100 text-yellow-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {isEditing ? (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium">{lead.name}</h3>
                    <p className="text-sm text-gray-500">{lead.company || "N/A"}</p>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{lead.email || "No email provided"}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{lead.phone || "No phone provided"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Value</div>
                      <div className="font-medium">{lead.value || "Not specified"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Source</div>
                      <div>{lead.source || "Not specified"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Created</div>
                      <div>{new Date(lead.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-500">Notes</div>
                  <p className="mt-1 whitespace-pre-wrap">{lead.notes || "No notes added yet."}</p>
                </div>

                <div className="pt-4 flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    <Phone className="mr-2 h-4 w-4" /> Call Lead
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Mail className="mr-2 h-4 w-4" /> Email Lead
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadDetails;
