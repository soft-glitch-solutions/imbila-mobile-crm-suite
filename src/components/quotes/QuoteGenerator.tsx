
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Send, Save, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    handleGenerate();
  };

  const handleSave = () => {
    if (!clientName) {
      toast.error("Please enter a client name before saving");
      return;
    }
    
    // Here we would typically save to a database
    // For now, we'll just show a success message
    toast.success("Quote saved successfully!");
  };

  const handleGenerate = () => {
    if (!clientName) {
      toast.error("Please enter a client name before generating");
      return;
    }
    
    // Generate quote logic would go here
    toast.success("Quote generated successfully!");
  };

  const handleGeneratePDF = () => {
    if (!clientName) {
      toast.error("Please enter a client name before generating PDF");
      return;
    }
    
    const currentDate = format(new Date(), "yyyy-MM-dd");
    const doc = new jsPDF();
    
    // Add company logo/header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // imbila-blue
    doc.text("IMBILA", 15, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Professional Business Quote", 15, 28);
    
    // Add date and reference
    doc.setFontSize(10);
    doc.text(`Date: ${currentDate}`, 15, 40);
    doc.text(`Reference: QT-${Math.floor(Math.random() * 10000)}`, 15, 45);
    
    // Client information
    doc.setFontSize(12);
    doc.text("Client Information:", 15, 55);
    doc.setFontSize(10);
    doc.text(`Name: ${clientName}`, 15, 62);
    if (clientEmail) {
      doc.text(`Email: ${clientEmail}`, 15, 67);
    }
    
    // Quote items table
    const tableRows = quoteItems.map(item => [
      item.description || "Item",
      item.quantity.toString(),
      `R${item.price.toFixed(2)}`,
      `R${(item.quantity * item.price).toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: 75,
      head: [["Description", "Quantity", "Unit Price", "Total"]],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
    });
    
    // Calculate the Y position after the table
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Summary
    doc.text(`Subtotal: R${calculateSubtotal().toFixed(2)}`, 130, finalY + 10);
    doc.text(`VAT (15%): R${calculateVAT().toFixed(2)}`, 130, finalY + 17);
    doc.setFontSize(12);
    doc.text(`Total: R${calculateTotal().toFixed(2)}`, 130, finalY + 25);
    
    // Add notes if available
    if (notes) {
      doc.setFontSize(10);
      doc.text("Notes:", 15, finalY + 40);
      
      const splitNotes = doc.splitTextToSize(notes, 180);
      doc.text(splitNotes, 15, finalY + 47);
    }
    
    // Add footer
    const pageCount = doc.internal.pages.length;
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Generated with IMBILA | ${currentDate}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }
    
    // Save PDF
    const filename = `quote-${clientName.replace(/\s+/g, '-').toLowerCase()}-${currentDate}.pdf`;
    doc.save(filename);
    
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
          <div className="fixed bottom-16 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-4 flex gap-2 justify-center">
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
