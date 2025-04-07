
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash } from "lucide-react";
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Lead {
  id: string;
  business_id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

const LeadDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { businessProfile } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchLead = async () => {
      if (!businessProfile) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('id', id)
          .eq('business_id', businessProfile.id)
          .single();
          
        if (error) throw error;
        
        setLead(data);
      } catch (error) {
        console.error('Error fetching lead:', error);
        toast.error('Failed to load lead information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLead();
  }, [id, businessProfile]);
  
  const handleChange = (field: keyof Lead, value: string) => {
    if (lead) {
      setLead({ ...lead, [field]: value });
    }
  };
  
  const handleSave = async () => {
    if (!lead || !businessProfile) return;
    
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('leads')
        .update({ 
          ...lead,
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id);
        
      if (error) throw error;
      
      toast.success('Lead updated successfully');
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error('Failed to update lead');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!lead || !businessProfile) return;
    
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', lead.id);
        
      if (error) throw error;
      
      toast.success('Lead deleted successfully');
      navigate('/leads');
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading lead details...</div>;
  }

  if (!lead) {
    return (
      <div className="text-center py-10">
        <p className="mb-4">Lead not found.</p>
        <Button onClick={() => navigate('/leads')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Leads
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/leads')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Leads
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDelete} disabled={isSaving}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name"
                  value={lead.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={lead.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone"
                  value={lead.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={lead.status} 
                  onValueChange={(value) => handleChange('status', value)}
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
              
              <div>
                <Label htmlFor="source">Source</Label>
                <Select 
                  value={lead.source} 
                  onValueChange={(value) => handleChange('source', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="email">Email Campaign</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Created</Label>
                <div className="text-sm mt-1 text-gray-500">
                  {lead.created_at ? format(new Date(lead.created_at), 'PPP') : 'Unknown'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes"
              rows={4}
              value={lead.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadDetails;
