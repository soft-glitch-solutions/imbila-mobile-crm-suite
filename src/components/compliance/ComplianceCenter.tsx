
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FileText, Upload, AlertCircle, CheckCircle, Clock, Calendar as CalendarIcon } from "lucide-react";

interface ComplianceItem {
  id: string;
  name: string;
  description: string;
  status: "valid" | "expiring" | "expired" | "missing";
  expiryDate?: string;
  progress?: number;
}

interface ComplianceCenterProps {
  businessType: string;
}

const ComplianceCenter = ({ businessType }: ComplianceCenterProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDocument, setSelectedDocument] = useState<ComplianceItem | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Sample data for compliance documents
  const complianceItems: ComplianceItem[] = [
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

  const handleDocumentView = (document: ComplianceItem) => {
    setSelectedDocument(document);
  };

  const handleUpload = () => {
    setIsUploadDialogOpen(false);
    // In a real app, this would handle file upload
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

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold ">Compliance Center</h2>
        <Button 
          className="bg-imbila-blue hover:bg-blue-700" 
          onClick={() => setIsUploadDialogOpen(true)}
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
              style={{ width: "75%" }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <span className="font-medium">Overall Compliance:</span> 75%
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
                    <span>{getStatusText(item.status)}</span>
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
                  >
                    <FileText className="h-4 w-4 mr-1" /> View
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-imbila-blue hover:bg-blue-700"
                    onClick={() => setIsUploadDialogOpen(true)}
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
                <div className="flex items-center p-2 bg-yellow-50 border border-yellow-100 rounded-md">
                  <CalendarIcon className="h-4 w-4 text-yellow-500 mr-2" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Tax Clearance Certificate</div>
                    <div className="text-xs text-gray-500">Due in 45 days</div>
                  </div>
                </div>
                <div className="flex items-center p-2 bg-red-50 border border-red-100 rounded-md">
                  <CalendarIcon className="h-4 w-4 text-red-500 mr-2" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">B-BBEE Certificate Renewal</div>
                    <div className="text-xs text-gray-500">Overdue by 60 days</div>
                  </div>
                </div>
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
        open={selectedDocument !== null}
        onOpenChange={(open) => !open && setSelectedDocument(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDocument?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-md">
            <FileText className="h-16 w-16 text-gray-400" />
            <p className="mt-4 text-center text-gray-500">
              Document preview would be displayed here in a real application.
            </p>
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-1" /> Download
            </Button>
            <Button className="bg-imbila-blue hover:bg-blue-700" onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-1" /> Upload New Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document or update an existing one.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Drag and drop a file here, or click to select a file
            </p>
            <Button variant="outline" className="mt-4">Select File</Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
            <Button className="bg-imbila-blue hover:bg-blue-700" onClick={handleUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplianceCenter;
