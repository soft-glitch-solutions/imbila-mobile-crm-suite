import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FileUp, AlertTriangle, Check, FileText, Download, ExternalLink, File } from "lucide-react";
import { format, parseISO, addMonths, isPast, isAfter, isBefore } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ComplianceItem {
  id: string;
  name: string;
  description: string;
  status: "valid" | "expiring" | "expired" | "missing";
  document_url: string;
  expiryDate: string;
  progress: number;
}

interface ComplianceCenterProps {
  businessType: string;
}

const ComplianceCenter = ({ businessType }: ComplianceCenterProps) => {
  const { businessProfile } = useAuth();
  const [documents, setDocuments] = useState<ComplianceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<ComplianceItem | null>(null);
  const [dialogMode, setDialogMode] = useState<"view" | "upload">("upload");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form data for document upload
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    expiryDate: ""
  });

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!businessProfile) return;
      
      try {
        setIsLoading(true);
        
        // Check if there's a document storage bucket
        const { data: buckets, error: bucketsError } = await supabase
          .storage
          .listBuckets();
          
        if (bucketsError) throw bucketsError;
        
        let documentsBucket = buckets.find(b => b.name === 'documents');
        
        if (!documentsBucket) {
          // Create the bucket if it doesn't exist
          const { data: newBucket, error: createError } = await supabase
            .storage
            .createBucket('documents', {
              public: false,
              fileSizeLimit: 10485760, // 10MB
            });
            
          if (createError) throw createError;
        }
        
        // Get files from the business's folder
        let files: any[] = [];
        try {
          const { data: fileData, error: filesError } = await supabase
            .storage
            .from('documents')
            .list(`${businessProfile.id}`, {
              sortBy: { column: 'name', order: 'asc' },
            });
            
          if (!filesError && fileData) {
            files = fileData;
          }
        } catch (error) {
          console.log("Error fetching files or folder doesn't exist yet:", error);
        }
        
        // Since we don't have a document_metadata table, we'll use sample data
        const sampleDocuments = getSampleComplianceItems(businessType);
        
        // Update documents with file information if available
        const compiledDocuments = sampleDocuments.map(doc => {
          const fileExists = files?.some(f => f.name.includes(doc.name.replace(/\s+/g, '-').toLowerCase()));
          let status: "valid" | "expiring" | "expired" | "missing" = doc.status;
          let progress = doc.progress;
          
          if (fileExists) {
            status = "valid";
            progress = 100;
            
            if (doc.expiryDate) {
              const expiryDate = parseISO(doc.expiryDate);
              const threeMonthsFromNow = addMonths(new Date(), 3);
              
              if (isPast(expiryDate)) {
                status = "expired";
                progress = 25;
              } else if (isBefore(expiryDate, threeMonthsFromNow)) {
                status = "expiring";
                progress = 75;
              }
            }
          }
          
          return {
            ...doc,
            status,
            progress,
            document_url: fileExists ? `${businessProfile.id}/${doc.name.replace(/\s+/g, '-').toLowerCase()}` : ""
          };
        });
        
        setDocuments(compiledDocuments);
      } catch (error) {
        console.error("Error loading compliance documents:", error);
        toast.error("Failed to load compliance documents");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [businessProfile, businessType]);

  const getSampleComplianceItems = (businessType: string): ComplianceItem[] => {
    const today = new Date();
    const futureDate = addMonths(today, 6);
    const pastDate = addMonths(today, -1);
    const expiringDate = addMonths(today, 2);
    
    let items: ComplianceItem[] = [
      {
        id: "1",
        name: "Business Registration",
        description: "Certificate of business registration",
        status: "valid",
        document_url: "",
        expiryDate: futureDate.toISOString(),
        progress: 0
      },
      {
        id: "2",
        name: "Tax Clearance Certificate",
        description: "Current tax clearance from SARS",
        status: "expired",
        document_url: "",
        expiryDate: pastDate.toISOString(),
        progress: 0
      },
      {
        id: "3",
        name: "Business License",
        description: "Local business operating license",
        status: "expiring",
        document_url: "",
        expiryDate: expiringDate.toISOString(),
        progress: 0
      }
    ];
    
    // Add business type specific documents
    if (businessType === "restaurant" || businessType === "food") {
      items.push({
        id: "4",
        name: "Food Safety Certificate",
        description: "Health department food safety certification",
        status: "missing",
        document_url: "",
        expiryDate: "",
        progress: 0
      });
    } else if (businessType === "construction" || businessType === "trades") {
      items.push({
        id: "4",
        name: "Construction Industry Certificate",
        description: "CIDB registration documents",
        status: "missing",
        document_url: "",
        expiryDate: "",
        progress: 0
      });
    }
    
    return items;
  };

  const handleDocumentView = async (document: ComplianceItem) => {
    setSelectedDocument(document);
    setDialogMode("view");
    
    if (document.document_url && businessProfile) {
      try {
        const { data, error } = await supabase.storage
          .from('documents')
          .createSignedUrl(document.document_url, 60);
          
        if (error) throw error;
        
        if (data && data.signedUrl) {
          // Update the document with the signed URL
          setSelectedDocument({
            ...document,
            document_url: data.signedUrl
          });
        }
      } catch (error) {
        console.error("Error getting signed URL:", error);
        toast.error("Failed to load document preview");
      }
    }
  };

  const handleUploadClick = (document?: ComplianceItem) => {
    setDialogMode("upload");
    if (document) {
      setSelectedDocument(document);
      setFormData({
        name: document.name,
        description: document.description,
        expiryDate: document.expiryDate ? format(parseISO(document.expiryDate), 'yyyy-MM-dd') : ''
      });
    } else {
      setSelectedDocument(null);
      setFormData({
        name: "",
        description: "",
        expiryDate: ""
      });
    }
    setUploadProgress(0);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !businessProfile) return;
    
    // Validate file (e.g., size, type)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File is too large. Maximum size is 10MB.");
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(interval);
            return 90;
          }
          return newProgress;
        });
      }, 300);
      
      // Generate a unique file name
      const safeName = formData.name.replace(/\s+/g, '-').toLowerCase();
      const fileName = `${safeName}-${Date.now()}${getFileExtension(file.name)}`;
      const filePath = `${businessProfile.id}/${fileName}`;
      
      // Upload the file with progress tracking
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          upsert: true,
        });
        
      if (error) throw error;
      
      // Get public URL (or signed URL for private files)
      const docUrl = filePath;
      
      // Save metadata - in a real app, store this in a database table
      const documentData = {
        id: selectedDocument?.id || `doc-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        status: "valid" as const,
        document_url: docUrl,
        expiryDate: formData.expiryDate,
        progress: 100
      };
      
      // Update the documents list
      if (selectedDocument) {
        // Update existing document
        setDocuments(docs => docs.map(doc => 
          doc.id === selectedDocument.id ? documentData : doc
        ));
      } else {
        // Add new document
        setDocuments(docs => [...docs, documentData]);
      }
      
      // Complete the progress
      clearInterval(interval);
      setUploadProgress(100);
      
      toast.success("Document uploaded successfully!");
      
      // Reset the form
      setTimeout(() => {
        setSelectedDocument(null);
        setFormData({
          name: "",
          description: "",
          expiryDate: ""
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const getStatusDetails = (status: string) => {
    switch (status) {
      case "valid":
        return {
          color: "bg-green-100 text-green-800",
          icon: <Check className="h-4 w-4 mr-1" />,
          text: "Valid"
        };
      case "expiring":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: <AlertTriangle className="h-4 w-4 mr-1" />,
          text: "Expiring Soon"
        };
      case "expired":
        return {
          color: "bg-red-100 text-red-800",
          icon: <AlertTriangle className="h-4 w-4 mr-1" />,
          text: "Expired"
        };
      case "missing":
        return {
          color: "bg-gray-100 text-gray-800",
          icon: <AlertTriangle className="h-4 w-4 mr-1" />,
          text: "Missing"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: null,
          text: status
        };
    }
  };
  
  const getDocumentIcon = (filename: string) => {
    if (!filename) return <FileText className="h-10 w-10 text-gray-400" />;
    
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <File className="h-10 w-10 text-red-500" />;
      default:
        return <FileText className="h-10 w-10 text-blue-500" />;
    }
  };
  
  const getDocumentType = (url: string) => {
    if (!url) return '';
    
    const filename = url.split('/').pop() || '';
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'Image';
      default:
        return extension?.toUpperCase() || 'Document';
    }
  };
  
  const getFileExtension = (filename: string): string => {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot) : '';
  };

  const complianceProgress = Math.round(
    (documents.filter(doc => doc.status === "valid").length / documents.length) * 100
  ) || 0;
  
  const expiredDocuments = documents.filter(doc => doc.status === "expired");
  const expiringDocuments = documents.filter(doc => doc.status === "expiring");
  const missingDocuments = documents.filter(doc => doc.status === "missing");

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold ">Compliance Center</h2>
        <Button onClick={() => handleUploadClick()}>
          <FileUp className="h-4 w-4 mr-1" /> Upload Document
        </Button>
      </div>

      {/* Compliance Overview */}
      {isLoading ? (
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Compliance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall Compliance: {complianceProgress}%</span>
                  <span>{documents.filter(doc => doc.status === "valid").length} of {documents.length} documents valid</span>
                </div>
                <Progress value={complianceProgress} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-500">{expiredDocuments.length}</div>
                  <div className="text-xs text-gray-500">Expired Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-500">{expiringDocuments.length}</div>
                  <div className="text-xs text-gray-500">Expiring Soon</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-500">{missingDocuments.length}</div>
                  <div className="text-xs text-gray-500">Missing Documents</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document List */}
      <div className="space-y-4">
        <h3 className="font-medium">Required Documents</h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-72" />
                    </div>
                    <Skeleton className="h-9 w-24 rounded" />
                  </div>
                  <div className="mt-2">
                    <Skeleton className="h-2 w-full rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((document) => {
              const statusDetails = getStatusDetails(document.status);
              
              return (
                <Card key={document.id} className={document.status === "expired" ? "border-red-200" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="hidden md:block">
                        {document.document_url 
                          ? getDocumentIcon(document.document_url)
                          : <FileText className="h-10 w-10 text-gray-400" />
                        }
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{document.name}</h4>
                        <p className="text-sm text-gray-500">{document.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                          <Badge className={statusDetails.color}>
                            <div className="flex items-center">
                              {statusDetails.icon}
                              {statusDetails.text}
                            </div>
                          </Badge>
                          
                          {document.expiryDate && (
                            <span className="text-gray-500">
                              Expires: {format(parseISO(document.expiryDate), 'MMM dd, yyyy')}
                            </span>
                          )}
                          
                          {document.document_url && (
                            <span className="text-gray-500">
                              {getDocumentType(document.document_url)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        {document.document_url ? (
                          <Button 
                            variant="outline"
                            onClick={() => handleDocumentView(document)}
                          >
                            View
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            onClick={() => handleUploadClick(document)}
                          >
                            Upload
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Progress value={document.progress} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Dialog for document upload and viewing */}
      <Dialog>
        <DialogTrigger asChild>
          <span className="hidden">Open Dialog</span>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          {dialogMode === "upload" ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedDocument ? `Update ${selectedDocument.name}` : "Upload Document"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="docName">Document Name</Label>
                  <Input 
                    id="docName" 
                    value={formData.name} 
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    placeholder="Enter document name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="docDescription">Description (Optional)</Label>
                  <Textarea 
                    id="docDescription" 
                    value={formData.description} 
                    onChange={(e) => handleFormChange("description", e.target.value)}
                    placeholder="Enter document description"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="docExpiry">Expiry Date (Optional)</Label>
                  <Input 
                    id="docExpiry" 
                    type="date"
                    value={formData.expiryDate} 
                    onChange={(e) => handleFormChange("expiryDate", e.target.value)}
                  />
                </div>
                
                <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <Button
                    variant="outline"
                    onClick={handleFileSelect}
                    disabled={isUploading}
                    className="w-full"
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading..." : "Select File"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Maximum file size: 10MB. Supported formats: PDF, Word, JPEG, PNG
                  </p>
                </div>
                
                {isUploading && (
                  <div className="space-y-2">
                    <div className="text-sm text-center">Uploading... {uploadProgress}%</div>
                    <Progress value={uploadProgress} className="h-1.5" />
                  </div>
                )}
              </div>
            </>
          ) : selectedDocument ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedDocument.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500">{selectedDocument.description}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusDetails(selectedDocument.status).color}>
                      <div className="flex items-center">
                        {getStatusDetails(selectedDocument.status).icon}
                        {getStatusDetails(selectedDocument.status).text}
                      </div>
                    </Badge>
                    
                    {selectedDocument.expiryDate && (
                      <span className="text-xs text-gray-500">
                        Expires: {format(parseISO(selectedDocument.expiryDate), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                
                {selectedDocument.document_url ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="border rounded-md p-6 bg-gray-50 text-center w-full">
                      {getDocumentIcon(selectedDocument.document_url)}
                      <div className="mt-2 text-sm font-medium">{getDocumentType(selectedDocument.document_url)}</div>
                    </div>
                    
                    <div className="flex gap-2 w-full">
                      <Button 
                        className="flex-1"
                        onClick={() => window.open(selectedDocument.document_url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" /> Open
                      </Button>
                      
                      <Button variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Document file not available. Please upload a new version.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => handleUploadClick(selectedDocument)}
                  className="w-full"
                >
                  <FileUp className="h-4 w-4 mr-2" /> Update Document
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplianceCenter;
