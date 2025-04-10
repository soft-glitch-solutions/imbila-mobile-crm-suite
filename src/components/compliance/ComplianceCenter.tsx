
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FileText, Upload, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ComplianceDocument {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  category: string;
  status: "pending" | "uploaded" | "approved" | "rejected";
  file_url?: string;
  uploaded_at?: string;
  updated_at?: string;
}

interface BusinessDocuments {
  [businessType: string]: ComplianceDocument[];
}

// Default required documents by business type
const businessDocuments: BusinessDocuments = {
  "restaurant": [
    { id: "health-certificate", name: "Health Certificate", description: "Health department certificate", required: true, category: "legal", status: "pending" },
    { id: "food-license", name: "Food Service License", description: "Local municipality food service license", required: true, category: "legal", status: "pending" },
    { id: "liquor-license", name: "Liquor License", description: "If you serve alcohol", required: false, category: "legal", status: "pending" },
    { id: "business-registration", name: "Business Registration", description: "Company registration document", required: true, category: "registration", status: "pending" },
    { id: "tax-clearance", name: "Tax Clearance Certificate", description: "SARS tax compliance status", required: true, category: "tax", status: "pending" },
  ],
  "retail": [
    { id: "business-registration", name: "Business Registration", description: "Company registration document", required: true, category: "registration", status: "pending" },
    { id: "tax-clearance", name: "Tax Clearance Certificate", description: "SARS tax compliance status", required: true, category: "tax", status: "pending" },
    { id: "zoning-permit", name: "Zoning Permit", description: "Municipal zoning approval", required: true, category: "legal", status: "pending" },
    { id: "trademark", name: "Trademark Registration", description: "If applicable", required: false, category: "legal", status: "pending" },
  ],
  "salon": [
    { id: "business-registration", name: "Business Registration", description: "Company registration document", required: true, category: "registration", status: "pending" },
    { id: "health-certificate", name: "Health Certificate", description: "Health department certificate", required: true, category: "legal", status: "pending" },
    { id: "tax-clearance", name: "Tax Clearance Certificate", description: "SARS tax compliance status", required: true, category: "tax", status: "pending" },
  ],
  "property": [
    { id: "business-registration", name: "Business Registration", description: "Company registration document", required: true, category: "registration", status: "pending" },
    { id: "tax-clearance", name: "Tax Clearance Certificate", description: "SARS tax compliance status", required: true, category: "tax", status: "pending" },
    { id: "estate-license", name: "Estate Agency License", description: "Property Practitioners Regulatory Authority certificate", required: true, category: "legal", status: "pending" },
    { id: "fidelity-fund", name: "Fidelity Fund Certificate", description: "PPRA fidelity fund certificate", required: true, category: "legal", status: "pending" },
  ],
  "construction": [
    { id: "business-registration", name: "Business Registration", description: "Company registration document", required: true, category: "registration", status: "pending" },
    { id: "tax-clearance", name: "Tax Clearance Certificate", description: "SARS tax compliance status", required: true, category: "tax", status: "pending" },
    { id: "cidb", name: "CIDB Registration", description: "Construction Industry Development Board registration", required: true, category: "legal", status: "pending" },
    { id: "liability-insurance", name: "Liability Insurance", description: "Professional indemnity insurance", required: true, category: "insurance", status: "pending" },
    { id: "safety-certificate", name: "Safety Compliance Certificate", description: "Occupational health and safety compliance", required: true, category: "legal", status: "pending" },
  ],
  "default": [
    { id: "business-registration", name: "Business Registration", description: "Company registration document", required: true, category: "registration", status: "pending" },
    { id: "tax-clearance", name: "Tax Clearance Certificate", description: "SARS tax compliance status", required: true, category: "tax", status: "pending" },
  ]
};

interface ComplianceCenterProps {
  businessType: string;
}

const ComplianceCenter = ({ businessType }: ComplianceCenterProps) => {
  const { businessProfile } = useAuth();
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  
  useEffect(() => {
    if (businessProfile) {
      fetchDocuments();
    }
  }, [businessProfile]);
  
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const actualBusinessType = businessProfile?.business_type || "default";
      
      // Get the default documents for this business type
      const defaultDocs = businessDocuments[actualBusinessType] || businessDocuments.default;
      
      // Get any documents already uploaded from database
      const { data: storedDocs, error } = await supabase
        .from('compliance_documents')
        .select('*')
        .eq('business_id', businessProfile?.id);
      
      if (error) {
        console.error("Error loading compliance documents:", error);
        toast.error("Failed to load compliance documents");
        setDocuments(defaultDocs);
        return;
      }
      
      // Merge stored documents with default documents
      let mergedDocs: ComplianceDocument[] = [];
      
      if (storedDocs && storedDocs.length > 0) {
        // Use documents from database
        mergedDocs = defaultDocs.map(defaultDoc => {
          const foundDoc = storedDocs.find(doc => doc.id === defaultDoc.id);
          return foundDoc ? { ...defaultDoc, ...foundDoc } : defaultDoc;
        });
      } else {
        mergedDocs = defaultDocs;
      }
      
      setDocuments(mergedDocs);
      
      // Calculate progress
      const requiredDocs = mergedDocs.filter(doc => doc.required);
      const completedDocs = requiredDocs.filter(doc => doc.status === 'approved' || doc.status === 'uploaded');
      const calculatedProgress = requiredDocs.length > 0 ? (completedDocs.length / requiredDocs.length) * 100 : 0;
      
      setProgress(calculatedProgress);
    } catch (error) {
      console.error("Error loading compliance documents:", error);
      toast.error("Failed to load compliance documents");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUploadDocument = async (documentId: string, file: File) => {
    try {
      if (!businessProfile) {
        toast.error("Business profile not found");
        return;
      }
      
      setIsUploading(documentId);
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentId}-${Date.now()}.${fileExt}`;
      const filePath = `${businessProfile.id}/${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('compliance-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('compliance-documents')
        .getPublicUrl(filePath);
      
      // Update document status in database
      const documentToUpdate = documents.find(doc => doc.id === documentId);
      if (!documentToUpdate) throw new Error("Document not found");
      
      const updatedDocument = {
        business_id: businessProfile.id,
        id: documentId,
        name: documentToUpdate.name,
        category: documentToUpdate.category,
        required: documentToUpdate.required,
        status: 'uploaded',
        file_url: publicUrl,
        uploaded_at: new Date().toISOString(),
        description: documentToUpdate.description,
      };
      
      const { error: dbError } = await supabase
        .from('compliance_documents')
        .upsert(updatedDocument);
        
      if (dbError) throw dbError;
      
      // Update local state
      setDocuments(prevDocs => prevDocs.map(doc => 
        doc.id === documentId ? { ...doc, status: 'uploaded', file_url: publicUrl } : doc
      ));
      
      // Recalculate progress
      const requiredDocs = documents.filter(doc => doc.required);
      const completedDocs = requiredDocs.filter(doc => doc.status === 'approved' || doc.status === 'uploaded');
      const calculatedProgress = requiredDocs.length > 0 ? (completedDocs.length / requiredDocs.length) * 100 : 0;
      
      setProgress(calculatedProgress);
      
      toast.success(`Document "${documentToUpdate.name}" uploaded successfully`);
      
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(null);
    }
  };
  
  const handleFileChange = (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 10MB.");
      return;
    }
    
    // Accept only PDF, PNG, JPEG
    const acceptedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!acceptedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload PDF, PNG or JPEG files.");
      return;
    }
    
    handleUploadDocument(documentId, file);
  };
  
  // Filter documents based on active tab
  const filteredDocuments = activeTab === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === activeTab);
  
  const documentCategories = Array.from(new Set(documents.map(doc => doc.category)));
  
  const getStatusDetails = (status: string) => {
    switch(status) {
      case 'approved':
        return { icon: <CheckCircle className="h-5 w-5 text-green-500" />, text: "Approved", color: "text-green-500" };
      case 'rejected':
        return { icon: <AlertCircle className="h-5 w-5 text-red-500" />, text: "Rejected", color: "text-red-500" };
      case 'uploaded':
        return { icon: <Clock className="h-5 w-5 text-amber-500" />, text: "Pending Review", color: "text-amber-500" };
      default:
        return { icon: <FileText className="h-5 w-5 text-gray-400" />, text: "Not Uploaded", color: "text-gray-400" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Compliance Center</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Compliance Overview</CardTitle>
          <CardDescription>
            Track your compliance status and manage required documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Compliance Status</span>
                <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium">Completed</div>
                      <div className="text-2xl font-bold">
                        {documents.filter(doc => doc.status === 'approved' || doc.status === 'uploaded').length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-amber-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium">In Review</div>
                      <div className="text-2xl font-bold">
                        {documents.filter(doc => doc.status === 'uploaded').length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium">Required</div>
                      <div className="text-2xl font-bold">
                        {documents.filter(doc => doc.required && doc.status === 'pending').length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>
            Upload and manage documents required for your business type
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="w-2/3">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  </div>
                  <div className="w-24">
                    <div className="h-9 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  {documentCategories.map(category => (
                    <TabsTrigger key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <TabsContent value={activeTab}>
                  <div className="space-y-4">
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((document) => {
                        const status = getStatusDetails(document.status);
                        
                        return (
                          <div key={document.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-md">
                            <div className="mb-3 md:mb-0">
                              <div className="flex items-center">
                                <div className="mr-3">{status.icon}</div>
                                <div>
                                  <h3 className="font-medium">
                                    {document.name}
                                    {document.required && (
                                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                        Required
                                      </span>
                                    )}
                                  </h3>
                                  {document.description && (
                                    <p className="text-sm text-gray-500">{document.description}</p>
                                  )}
                                  <p className={`text-sm ${status.color} mt-1`}>{status.text}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {document.file_url && (
                                <a 
                                  href={document.file_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  View Document
                                </a>
                              )}
                              
                              <label
                                htmlFor={`upload-${document.id}`}
                                className={`
                                  inline-flex items-center justify-center rounded-md text-sm font-medium 
                                  transition-colors focus-visible:outline-none focus-visible:ring-2 
                                  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 
                                  disabled:pointer-events-none ring-offset-background
                                  border border-input hover:bg-accent hover:text-accent-foreground
                                  h-10 px-4 py-2 w-full md:w-auto cursor-pointer
                                `}
                              >
                                {isUploading === document.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {document.status === 'pending' ? 'Upload' : 'Replace'}
                                  </>
                                )}
                                <input
                                  id={`upload-${document.id}`}
                                  type="file"
                                  accept="application/pdf,image/png,image/jpeg"
                                  className="hidden"
                                  onChange={(e) => handleFileChange(document.id, e)}
                                  disabled={isUploading !== null}
                                />
                              </label>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No documents found in this category
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceCenter;
