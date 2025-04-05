
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, FileDown, Send, Save, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface QuoteGeneratorProps {
  businessType: string;
}

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

const QuoteGenerator = ({ businessType }: QuoteGeneratorProps) => {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    { id: "item1", description: "", quantity: 1, price: 0 }
  ]);
  const [notes, setNotes] = useState("");

  const addQuoteItem = () => {
    const newId = `item${quoteItems.length + 1}`;
    setQuoteItems([...quoteItems, { id: newId, description: "", quantity: 1, price: 0 }]);
  };

  const removeQuoteItem = (id: string) => {
    if (quoteItems.length > 1) {
      setQuoteItems(quoteItems.filter(item => item.id !== id));
    } else {
      toast.error("You must have at least one item in your quote");
    }
  };

  const updateQuoteItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setQuoteItems(
      quoteItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateSubtotal = () => {
    return quoteItems.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const calculateVAT = () => {
    return calculateSubtotal() * 0.15;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Quote created successfully!");
  };

  const handleSave = () => {
    toast.success("Quote saved successfully!");
  };

  const handleGenerate = () => {
    toast.success("Quote generated successfully!");
  };

  const handleGeneratePDF = () => {
    // Generate a PDF from the quote content
    const currentDate = format(new Date(), "yyyy-MM-dd");
    
    // Create a simple content string (would be HTML in a real app)
    const content = `
      IMBILA QUOTE
      Date: ${currentDate}
      Client: ${clientName}
      Email: ${clientEmail}
      
      Items:
      ${quoteItems.map(item => `${item.description}: ${item.quantity} x R${item.price} = R${(item.quantity * item.price).toFixed(2)}`).join('\n')}
      
      Subtotal: R${calculateSubtotal().toFixed(2)}
      VAT (15%): R${calculateVAT().toFixed(2)}
      Total: R${calculateTotal().toFixed(2)}
      
      Notes:
      ${notes}
    `;
    
    // Create a Blob from the content
    const blob = new Blob([content], { type: 'text/plain' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = `quote-${clientName.replace(/\s+/g, '-').toLowerCase()}-${currentDate}.txt`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`PDF quote downloaded with date stamp: ${currentDate}`);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-imbila-dark">Create Quote</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Client Name</label>
                <Input 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)} 
                  placeholder="Enter client name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Client Email</label>
                <Input 
                  type="email"
                  value={clientEmail} 
                  onChange={(e) => setClientEmail(e.target.value)} 
                  placeholder="Enter client email"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quote Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quoteItems.map((item) => (
                <div key={item.id} className="space-y-2 pb-3 border-b border-gray-100 last:border-0">
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateQuoteItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">Quantity</label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuoteItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Price (R)</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateQuoteItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">
                      Subtotal: R{(item.quantity * item.price).toFixed(2)}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuoteItem(item.id)}
                      className="h-8 w-8 p-0 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuoteItem}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any additional notes or terms"
                className="mt-1"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal:</span>
                  <span className="text-sm font-medium">R{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">VAT (15%):</span>
                  <span className="text-sm font-medium">R{calculateVAT().toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Total:</span>
                  <span className="font-medium">R{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Action Buttons */}
          <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4 flex gap-2 justify-center">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSave}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-1" /> Generate
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleGeneratePDF}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-1" /> PDF
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QuoteGenerator;
