
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Mail, FileText, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalSpent: string;
  invoicesDue: number;
  quotesActive: number;
  lastPurchase: string;
}

interface CustomerListProps {
  businessType: string;
}

const CustomerList = ({ businessType }: CustomerListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Sample data
  const customers: Customer[] = [
    {
      id: 1,
      name: "Tech Solutions Ltd",
      email: "contact@techsolutions.com",
      phone: "(011) 555-1234",
      totalSpent: "R42,500",
      invoicesDue: 0,
      quotesActive: 1,
      lastPurchase: "2025-04-01",
    },
    {
      id: 2,
      name: "Brown Consulting",
      email: "info@brownconsulting.com",
      phone: "(012) 555-5678",
      totalSpent: "R28,000",
      invoicesDue: 1,
      quotesActive: 0,
      lastPurchase: "2025-03-28",
    },
    {
      id: 3,
      name: "Innovate Inc",
      email: "hello@innovate.com",
      phone: "(021) 555-9012",
      totalSpent: "R65,750",
      invoicesDue: 2,
      quotesActive: 1,
      lastPurchase: "2025-03-25",
    },
    {
      id: 4,
      name: "Wilson Group",
      email: "contact@wilsongroup.com",
      phone: "(031) 555-3456",
      totalSpent: "R18,300",
      invoicesDue: 0,
      quotesActive: 0,
      lastPurchase: "2025-03-20",
    },
    {
      id: 5,
      name: "Creative Solutions",
      email: "info@creativesolutions.com",
      phone: "(041) 555-7890",
      totalSpent: "R8,750",
      invoicesDue: 1,
      quotesActive: 2,
      lastPurchase: "2025-03-15",
    }
  ];

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = () => {
    toast.info("Add customer form would open here");
  };

  const handleViewCustomer = (customerId: number) => {
    toast.info(`Viewing customer ${customerId} details`);
  };

  const handleViewInvoices = (customerId: number) => {
    toast.info(`Viewing invoices for customer ${customerId}`);
  };

  const handleViewQuotes = (customerId: number) => {
    toast.info(`Viewing quotes for customer ${customerId}`);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-imbila-dark">Customers</h2>
        <Button className="bg-imbila-blue hover:bg-blue-700" onClick={handleAddCustomer}>
          <Plus className="h-4 w-4 mr-1" /> Add Customer
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList className="flex justify-start overflow-auto">
          <TabsTrigger value="all">All Customers</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <Card key={customer.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col h-full">
                      <div className="mb-2">
                        <h3 className="font-medium">{customer.name}</h3>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                        <p className="text-sm text-gray-500">{customer.phone}</p>
                      </div>
                      
                      <div className="flex justify-between text-sm my-2">
                        <span>Total Spent:</span>
                        <span className="font-medium">{customer.totalSpent}</span>
                      </div>
                      
                      <div className="flex space-x-2 my-2">
                        {customer.invoicesDue > 0 && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                            {customer.invoicesDue} {customer.invoicesDue === 1 ? 'Invoice' : 'Invoices'} Due
                          </Badge>
                        )}
                        {customer.quotesActive > 0 && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                            {customer.quotesActive} {customer.quotesActive === 1 ? 'Quote' : 'Quotes'} Active
                          </Badge>
                        )}
                      </div>
                      
                      <div className="mt-auto pt-3 border-t grid grid-cols-3 gap-1">
                        <Button variant="ghost" size="sm" className="w-full" onClick={() => handleViewCustomer(customer.id)}>
                          <User className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full" onClick={() => handleViewInvoices(customer.id)}>
                          <FileText className="h-4 w-4 mr-1" /> Invoices
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full" onClick={() => handleViewQuotes(customer.id)}>
                          <Mail className="h-4 w-4 mr-1" /> Quotes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">No customers found matching your search.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="mt-6 text-center text-gray-500 py-8">
            <p>Filter view for Active customers would appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="inactive">
          <div className="mt-6 text-center text-gray-500 py-8">
            <p>Filter view for Inactive customers would appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerList;
