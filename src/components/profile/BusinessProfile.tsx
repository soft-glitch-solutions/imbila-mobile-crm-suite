
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Phone, Mail, Globe, Share2, Edit } from "lucide-react";

interface BusinessProfileProps {
  businessType: string;
}

const BusinessProfile = ({ businessType }: BusinessProfileProps) => {
  // Sample business profile data
  const businessProfile = {
    name: "Imbila Solutions",
    type: businessType,
    description: "Providing innovative solutions tailored to your business needs.",
    address: "123 Business Street, Johannesburg, South Africa",
    phone: "+27 12 345 6789",
    email: "info@imbilasolutions.com",
    website: "www.imbilasolutions.com",
    established: "2022",
    employees: "1-10",
    stats: {
      leads: 45,
      sales: "R98,500",
      completion: 87,
      clients: 22
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-imbila-dark">Business Profile</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
          <Button size="sm">
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-imbila-blue text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mb-3">
              {businessProfile.name.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold">{businessProfile.name}</h3>
            <div className="text-sm text-gray-500 flex items-center mt-1">
              <Briefcase className="h-4 w-4 mr-1" />
              {businessProfile.type.charAt(0).toUpperCase() + businessProfile.type.slice(1)} Business
            </div>
            <p className="mt-3 text-gray-600">{businessProfile.description}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessProfile.stats.leads}</div>
            <div className="mt-1 text-xs text-imbila-blue">View all leads →</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessProfile.stats.sales}</div>
            <div className="mt-1 text-xs text-imbila-blue">View details →</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessProfile.stats.completion}%</div>
            <div className="mt-1 text-xs text-imbila-blue">View details →</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessProfile.stats.clients}</div>
            <div className="mt-1 text-xs text-imbila-blue">View all clients →</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
            <span>{businessProfile.address}</span>
          </div>
          <div className="flex items-center">
            <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
            <span>{businessProfile.phone}</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
            <span>{businessProfile.email}</span>
          </div>
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
            <span>{businessProfile.website}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Established</div>
              <div className="font-medium">{businessProfile.established}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Employees</div>
              <div className="font-medium">{businessProfile.employees}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessProfile;
