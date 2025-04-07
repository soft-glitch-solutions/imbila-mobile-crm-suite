
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, FileText, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const QuoteHistory = () => {
  const navigate = useNavigate();
  const { businessProfile } = useAuth();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!businessProfile) return;

    const fetchQuotes = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .eq('business_id', businessProfile.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setQuotes(data || []);
        setFilteredQuotes(data || []);
      } catch (error) {
        console.error('Error fetching quotes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, [businessProfile]);

  useEffect(() => {
    // Apply filters when search term or status filter changes
    let filtered = quotes;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(quote => 
        quote.title.toLowerCase().includes(search) ||
        quote.client_name.toLowerCase().includes(search) ||
        (quote.client_email && quote.client_email.toLowerCase().includes(search))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }
    
    setFilteredQuotes(filtered);
  }, [searchTerm, statusFilter, quotes]);

  const handleCreateQuote = () => {
    navigate('/quotes/new');
  };

  const handleViewQuote = (id: string) => {
    navigate(`/quotes/${id}`);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
      case 'expired':
        return <Badge className="bg-yellow-100 text-yellow-800">Expired</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quote History</h2>
        <Button className="bg-imbila-blue hover:bg-blue-700" onClick={handleCreateQuote}>
          <Plus className="h-4 w-4 mr-1" /> New Quote
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading quotes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuotes.length > 0 ? (
            filteredQuotes.map((quote) => (
              <Card key={quote.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{quote.title}</h3>
                        <p className="text-sm text-gray-500">{quote.client_name}</p>
                      </div>
                      {getStatusBadge(quote.status || 'draft')}
                    </div>
                    
                    <div className="text-sm my-2">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-medium">
                          R{Number(quote.total).toLocaleString('en-ZA', { 
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {format(new Date(quote.created_at), 'PPP')}
                      </p>
                    </div>
                    
                    <div className="mt-auto pt-3 border-t flex justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewQuote(quote.id)}
                      >
                        <FileText className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Mail className="h-4 w-4 mr-1" /> Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center py-8">
              <p className="text-gray-500">No quotes found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuoteHistory;
