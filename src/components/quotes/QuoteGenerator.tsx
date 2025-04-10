
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash, FileText, Search, FileDown, User, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface QuoteItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
}

interface QuoteGeneratorProps {
  businessType: string;
}

const QuoteGenerator = ({ businessType }: QuoteGeneratorProps) => {
  const { businessProfile } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [quoteTitle, setQuoteTitle] = useState("New Quote");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [quoteNotes, setQuoteNotes] = useState("");
  const [vatRate, setVatRate] = useState(15); // South Africa's VAT rate
  
  useEffect(() => {
    if (businessProfile) {
      fetchCustomers();
    }
  }, [businessProfile]);
  
  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', businessProfile?.id)
        .order('name', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };
  
  const addItem = () => {
    const newItem: QuoteItem = {
      id: `item-${Date.now()}`,
      name: "",
      description: "",
      quantity: 1,
      price: 0
    };
    
    setQuoteItems([...quoteItems, newItem]);
  };
  
  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setQuoteItems(items => items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  const removeItem = (id: string) => {
    setQuoteItems(items => items.filter(item => item.id !== id));
  };
  
  const subtotal = quoteItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;
  
  const handleCreateQuote = async () => {
    if (!businessProfile) {
      toast.error("Business profile not found");
      return;
    }
    
    if (quoteItems.length === 0) {
      toast.error("Please add at least one item to the quote");
      return;
    }
    
    try {
      const quoteData = {
        business_id: businessProfile.id,
        title: quoteTitle,
        client_name: selectedCustomer ? selectedCustomer.name : "Client",
        client_email: selectedCustomer ? selectedCustomer.email : null,
        customer_id: selectedCustomer ? selectedCustomer.id : null,
        items: quoteItems,
        notes: quoteNotes,
        subtotal,
        vat: vatAmount,
        total
      };
      
      const { data, error } = await supabase
        .from('quotes')
        .insert(quoteData)
        .select();
        
      if (error) throw error;
      
      toast.success("Quote created successfully");
      
      // Reset form after successful creation
      setQuoteTitle("New Quote");
      setQuoteItems([]);
      setQuoteNotes("");
      setSelectedCustomer(null);
      
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error("Failed to create quote");
    }
  };
  
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add business info
    doc.setFontSize(20);
    doc.text(businessProfile?.business_name || "Business Name", 14, 22);
    
    doc.setFontSize(12);
    doc.text("QUOTE", 14, 32);
    doc.text(`Date: ${format(new Date(), 'dd/MM/yyyy')}`, 14, 38);
    doc.text(`Quote Title: ${quoteTitle}`, 14, 44);
    
    // Client info
    doc.text("Client:", 14, 54);
    doc.text(selectedCustomer ? selectedCustomer.name : "Client", 35, 54);
    
    if (selectedCustomer && selectedCustomer.email) {
      doc.text("Email:", 14, 60);
      doc.text(selectedCustomer.email, 35, 60);
    }
    
    // Items table
    const tableColumn = ["Item", "Description", "Qty", "Price (R)", "Total (R)"];
    const tableRows = quoteItems.map(item => [
      item.name,
      item.description,
      item.quantity.toString(),
      item.price.toFixed(2),
      (item.quantity * item.price).toFixed(2)
    ]);
    
    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
    });
    
    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Subtotal: R ${subtotal.toFixed(2)}`, 140, finalY);
    doc.text(`VAT (${vatRate}%): R ${vatAmount.toFixed(2)}`, 140, finalY + 6);
    doc.text(`Total: R ${total.toFixed(2)}`, 140, finalY + 12);
    
    // Notes
    if (quoteNotes) {
      doc.text("Notes:", 14, finalY + 25);
      doc.text(quoteNotes, 14, finalY + 31);
    }
    
    // Footer
    doc.text(businessProfile?.address || "", 14, 270);
    doc.text(businessProfile?.email || "", 14, 276);
    doc.text(businessProfile?.phone || "", 14, 282);
    
    doc.save(`Quote-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsSearchOpen(false);
    setSearchTerm("");
  };
  
  const clearCustomer = () => {
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create Quote</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quote Title */}
          <div>
            <Label htmlFor="quote-title">Quote Title</Label>
            <Input 
              id="quote-title" 
              value={quoteTitle}
              onChange={(e) => setQuoteTitle(e.target.value)}
              placeholder="Enter a title for this quote"
            />
          </div>
          
          {/* Client Information */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Client Information</Label>
              {selectedCustomer ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearCustomer}
                >
                  Clear Selection
                </Button>
              ) : (
                <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Find Customer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Search Customers</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input
                        placeholder="Search by name or email"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4"
                      />
                      
                      {filteredCustomers.length > 0 ? (
                        <div className="max-h-72 overflow-y-auto space-y-2">
                          {filteredCustomers.map(customer => (
                            <div 
                              key={customer.id} 
                              className="p-3 border rounded-md hover:bg-gray-100 cursor-pointer"
                              onClick={() => selectCustomer(customer)}
                            >
                              <div className="font-medium">{customer.name}</div>
                              {customer.email && (
                                <div className="text-sm text-gray-600">{customer.email}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          {searchTerm ? "No customers found" : "Search for a customer"}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center"
                          onClick={() => setSelectedCustomer({ id: "", name: "New Client", email: "" })}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Create Blank Quote
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            {selectedCustomer ? (
              <div className="p-4 border rounded-md bg-gray-50">
                <div className="flex items-center mb-2">
                  <User className="mr-2 h-5 w-5 text-gray-500" />
                  <span className="font-medium">{selectedCustomer.name}</span>
                </div>
                {selectedCustomer.email && (
                  <div className="text-sm text-gray-600 ml-7">{selectedCustomer.email}</div>
                )}
                {selectedCustomer.phone && (
                  <div className="text-sm text-gray-600 ml-7">{selectedCustomer.phone}</div>
                )}
                {selectedCustomer.address && (
                  <div className="text-sm text-gray-600 ml-7">{selectedCustomer.address}</div>
                )}
              </div>
            ) : (
              <div className="p-4 border rounded-md border-dashed flex items-center justify-center text-gray-500">
                No client selected. Create a blank quote or search for an existing client.
              </div>
            )}
          </div>
          
          {/* Quote Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Quote Items</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addItem}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
            
            {quoteItems.length > 0 ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500 px-2">
                  <div className="col-span-3">Item</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-1">Qty</div>
                  <div className="col-span-2">Price (R)</div>
                  <div className="col-span-1">Total</div>
                  <div className="col-span-1"></div>
                </div>
                
                {/* Item rows */}
                {quoteItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <Input 
                      className="col-span-3"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      placeholder="Item name"
                    />
                    <Input 
                      className="col-span-4"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Description"
                    />
                    <Input 
                      className="col-span-1"
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    />
                    <Input 
                      className="col-span-2"
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                    />
                    <div className="col-span-1 text-right">
                      R {(item.quantity * item.price).toFixed(2)}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeItem(item.id)}
                      className="col-span-1"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Separator className="my-4" />
                
                {/* Summary */}
                <div className="flex flex-col items-end space-y-1 text-right mr-10">
                  <div className="flex w-48 justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>R {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex w-48 justify-between">
                    <span className="text-gray-600">VAT ({vatRate}%):</span>
                    <span>R {vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex w-48 justify-between font-bold">
                    <span>Total:</span>
                    <span>R {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 border rounded-md border-dashed flex flex-col items-center justify-center text-gray-500">
                <FileText className="mb-2 h-10 w-10" />
                <p>No items added to this quote yet.</p>
                <Button variant="outline" size="sm" onClick={addItem} className="mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Item
                </Button>
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={quoteNotes}
              onChange={(e) => setQuoteNotes(e.target.value)}
              placeholder="Add any additional information or terms here..."
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          {quoteItems.length > 0 && (
            <Button variant="outline" onClick={generatePDF}>
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          )}
          
          <Button onClick={handleCreateQuote}>
            Create Quote
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuoteGenerator;
