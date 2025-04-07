
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FileText, Upload, AlertCircle, CheckCircle, Clock, Calendar as CalendarIcon, Trash } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ComplianceItem {
  id: string;
  name: string;
  description: string;
  status: "valid" | "expiring" | "expired" | "missing";
  expiryDate?: string;
  document_url?: string;
  progress?: number;
}

interface ComplianceCenterProps {
  businessType: string;
}

const ComplianceCenter = ({ businessType }: ComplianceCenterProps) => {
  const { businessProfile } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDocument, setSelectedDocument] = useState<ComplianceItem | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentExpiryDate, setDocumentExpiryDate] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);

  useEffect(() => {
    const fetchComplianceDocuments = async () => {
      if (!businessProfile) return;

      try {
        setIsLoading(true);
        
        // Sample compliance items - in a real app, these would come from a database
        const defaultComplianceItems: ComplianceItem[] = [
          {
            id: "cipc-reg",
            name: "CIPC Registration",
            description: "Company registration document",
            status: "valid",
            expiryDate: "2026-04-01",
            progress: 100
          },
          {
            id: "tax-clearance",
            name: "Tax Clearance Certificate",
            description: "Valid tax compliance status",
            status: "expiring",
            expiryDate: "2025-05-15",
            progress: 65
          },
          {
            id: "bbbee",
            name: "B-BBEE Certificate",
            description: "Broad-Based Black Economic Empowerment",
            status: "expired",
            expiryDate: "2025-01-20",
            progress: 0
          },
          {
            id: "business-license",
            name: "Business License",
            description: "Municipal business license",
            status: "valid",
            expiryDate: "2025-09-30",
            progress: 100
          },
          {
            id: "coida",
            name: "COIDA Registration",
            description: "Compensation for Occupational Injuries",
            status: "missing",
            progress: 0
          }
        ];
        
        // In a real app, fetch documents from a documents table
        // and update the status based on expiry dates
        
        setComplianceItems(defaultComplianceItems);
      } catch (error) {
        console.error("Error fetching compliance documents:", error);
        toast.error("Failed to load compliance documents");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComplianceDocuments();
  }, [businessProfile]);

  const handleDocumentView = (document: ComplianceItem) => {
    setSelectedDocument(document);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !businessProfile || !documentName) {
      toast.error("Please provide a file name and select a file");
      return;
    }

    try {
      setUploadingDocument(true);
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${documentName.replace(/\s+/g, '-').toLowerCase()}.${fileExt}`;
      const filePath = `${businessProfile.id}/${fileName}`;
      
      // Upload to Supabase Storage
      // Note: In a real app, you would create a "compliance_documents" bucket first
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('compliance_documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL for the file
      const { data: urlData } = await supabase.storage
        .from('compliance_documents')
        .getPublicUrl(filePath);
      
      const publicUrl = urlData?.publicUrl;
      
      // In a real app, you would save the document details to a documents table
      toast.success("Document uploaded successfully!");
      
      // Update the compliance items with the new document URL
      const updatedItems = complianceItems.map(item => {
        if (item.name === documentName || item.id === selectedDocument?.id) {
          return {
            ...item,
            document_url: publicUrl,
            status: "valid",
            progress: 100,
            expiryDate: documentExpiryDate || undefined
          };
        }
        return item;
      });
      
      setComplianceItems(updatedItems);
      setIsUploadDialogOpen(false);
      setFile(null);
      setDocumentName("");
      setDocumentDescription("");
      setDocumentExpiryDate("");
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document. Please try again.");
    } finally {
      setUploadingDocument(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "expiring":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "expired":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "missing":
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "valid":
        return "Valid";
      case "expiring":
        return "Expiring Soon";
      case "expired":
        return "Expired";
      case "missing":
        return "Missing";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800";
      case "expiring":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "missing":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading compliance data...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Compliance Center</h2>
        <Button 
          className="bg-imbila-blue hover:bg-blue-700" 
          onClick={() => {
            setSelectedDocument(null);
            setDocumentName("");
            setDocumentDescription("");
            setDocumentExpiryDate("");
            setFile(null);
            setIsUploadDialogOpen(true);
          }}
        >
          <Upload className="h-4 w-4 mr-1" /> Upload Document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-100 h-7 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" 
              style={{ width: `${complianceItems.reduce((sum, item) => sum + (item.progress || 0), 0) / complianceItems.length}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <span className="font-medium">Overall Compliance:</span> 
              {Math.round(complianceItems.reduce((sum, item) => sum + (item.progress || 0), 0) / complianceItems.length)}%
            </div>
            <div className="text-yellow-600">Action Needed</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {complianceItems.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <div className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                    <span className="ml-1">{getStatusText(item.status)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-gray-500">{item.description}</p>
                {item.expiryDate && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Expiry Date:</span> {new Date(item.expiryDate).toLocaleDateString()}
                  </div>
                )}
                {item.document_url && (
                  <div className="mt-2">
                    <a 
                      href={item.document_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View uploaded document
                    </a>
                  </div>
                )}
                {item.progress !== undefined && (
                  <div className="mt-3">
                    <Progress value={item.progress} className="h-2" />
                    <div className="mt-1 text-xs text-gray-500 text-right">{item.progress}% valid</div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex space-x-2 w-full">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDocumentView(item)}
                    disabled={!item.document_url}
                  >
                    <FileText className="h-4 w-4 mr-1" /> View
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-imbila-blue hover:bg-blue-700"
                    onClick={() => {
                      setSelectedDocument(item);
                      setDocumentName(item.name);
                      setDocumentDescription(item.description);
                      setDocumentExpiryDate(item.expiryDate || "");
                      setIsUploadDialogOpen(true);
                    }}
                  >
                    <Upload className="h-4 w-4 mr-1" /> Update
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
              <div className="mt-4 space-y-2">
                {complianceItems
                  .filter(item => item.expiryDate && new Date(item.expiryDate) > new Date())
                  .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime())
                  .slice(0, 3)
                  .map(item => {
                    const daysLeft = Math.ceil(
                      (new Date(item.expiryDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const isNearExpiry = daysLeft <= 30;
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`flex items-center p-2 rounded-md ${
                          isNearExpiry ? "bg-yellow-50 border border-yellow-100" : "bg-blue-50 border border-blue-100"
                        }`}
                      >
                        <CalendarIcon className={`h-4 w-4 mr-2 ${
                          isNearExpiry ? "text-yellow-500" : "text-blue-500"
                        }`} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-500">
                            Due in {daysLeft} days
                          </div>
                        </div>
                      </div>
                    );
                  })}
                
                {complianceItems
                  .filter(item => item.expiryDate && new Date(item.expiryDate) <= new Date())
                  .slice(0, 2)
                  .map(item => {
                    const daysOverdue = Math.ceil(
                      (new Date().getTime() - new Date(item.expiryDate!).getTime()) / (1000 * 60 * 60 * 24)
                    );
                    
                    return (
                      <div 
                        key={item.id} 
                        className="flex items-center p-2 bg-red-50 border border-red-100 rounded-md"
                      >
                        <CalendarIcon className="h-4 w-4 text-red-500 mr-2" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-500">
                            Overdue by {daysOverdue} days
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                    <FileText className="h-4 w-4 mr-2 text-imbila-blue" />
                    <span className="text-sm">CIPC Filing Guidelines</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                    <FileText className="h-4 w-4 mr-2 text-imbila-blue" />
                    <span className="text-sm">Tax Compliance Requirements</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                    <FileText className="h-4 w-4 mr-2 text-imbila-blue" />
                    <span className="text-sm">B-BBEE Certification Process</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                    <FileText className="h-4 w-4 mr-2 text-imbila-blue" />
                    <span className="text-sm">Business Licensing Guide</span>
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Document Dialog */}
      <Dialog 
        open={selectedDocument !== null && !isUploadDialogOpen}
        onOpenChange={(open) => !open && setSelectedDocument(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDocument?.name}</DialogTitle>
          </DialogHeader>
          {selectedDocument?.document_url ? (
            <div className="flex flex-col items-center justify-center">
              {selectedDocument.document_url.endsWith('.pdf') ? (
                <iframe 
                  src={selectedDocument.document_url} 
                  className="w-full h-96 border rounded-md"
                  title={selectedDocument.name}
                />
              ) : (
                <img 
                  src={selectedDocument.document_url}
                  alt={selectedDocument.name}
                  className="max-w-full max-h-96 object-contain"
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-md">
              <FileText className="h-16 w-16 text-gray-400" />
              <p className="mt-4 text-center text-gray-500">
                No document has been uploaded yet.
              </p>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            {selectedDocument?.document_url && (
              <Button variant="outline" as="a" href={selectedDocument.document_url} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-1" /> Download
              </Button>
            )}
            <Button 
              className="bg-imbila-blue hover:bg-blue-700"
              onClick={() => {
                if (selectedDocument) {
                  setDocumentName(selectedDocument.name);
                  setDocumentDescription(selectedDocument.description);
                  setDocumentExpiryDate(selectedDocument.expiryDate || "");
                  setIsUploadDialogOpen(true);
                }
              }}
            >
              <Upload className="h-4 w-4 mr-1" /> Upload New Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDocument ? `Update ${selectedDocument.name}` : "Upload Document"}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument 
                ? "Upload a new version of this document." 
                : "Upload a new compliance document."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="documentName">Document Name</Label>
              <Input
                id="documentName"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter document name"
              />
            </div>
            
            <div>
              <Label htmlFor="documentDescription">Description</Label>
              <Input
                id="documentDescription"
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                placeholder="Enter document description"
              />
            </div>
            
            <div>
              <Label htmlFor="expiryDate">Expiry Date (if applicable)</Label>
              <Input
                id="expiryDate"
                type="date"
                value={documentExpiryDate}
                onChange={(e) => setDocumentExpiryDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="documentUpload">Select File</Label>
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
                <Input
                  id="documentUpload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label htmlFor="documentUpload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    {file ? file.name : "Drag and drop a file here, or click to select a file"}
                  </p>
                </label>
                {file && (
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-gray-600 truncate max-w-xs">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 w-6 p-0"
                      onClick={() => setFile(null)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
            <Button 
              className="bg-imbila-blue hover:bg-blue-700" 
              onClick={handleUpload}
              disabled={!file || !documentName || uploadingDocument}
            >
              {uploadingDocument ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplianceCenter;
