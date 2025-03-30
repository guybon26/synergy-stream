
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Law, 
  Flag, 
  ShieldAlert, 
  Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RegulatoryData } from '@/types/synergia';

// Sample regulatory data for testing
const sampleRegulatoryData: RegulatoryData[] = [
  {
    id: "REG001",
    siteId: "SITE001",
    country: "United States",
    region: "Northeast",
    regulatoryBody: "FDA",
    requirementType: "approval",
    stage: "enrollment",
    status: "compliant",
    dueDate: "2023-12-15",
    description: "IND approval required before patient enrollment",
    impact: "high"
  },
  {
    id: "REG002",
    siteId: "SITE002",
    country: "United States",
    region: "West",
    regulatoryBody: "FDA",
    requirementType: "documentation",
    stage: "screening",
    status: "at-risk",
    dueDate: "2023-11-30",
    description: "Protocol amendments need IRB review",
    impact: "medium"
  },
  {
    id: "REG003",
    siteId: "SITE003",
    country: "United States",
    region: "Midwest",
    regulatoryBody: "IRB",
    requirementType: "reporting",
    stage: "treatment",
    status: "non-compliant",
    dueDate: "2023-10-25",
    description: "SAE reporting requirements not met",
    impact: "high"
  },
  {
    id: "REG004",
    siteId: "SITE004",
    country: "United States",
    region: "South",
    regulatoryBody: "FDA",
    requirementType: "inspection",
    stage: "follow-up",
    status: "pending",
    dueDate: "2023-12-10",
    description: "Site inspection scheduled",
    impact: "medium"
  },
  {
    id: "REG005",
    siteId: "SITE005",
    country: "United States",
    region: "Northeast",
    regulatoryBody: "IRB",
    requirementType: "documentation",
    stage: "close-out",
    status: "compliant",
    dueDate: "2024-01-15",
    description: "Final study report submission",
    impact: "low"
  },
  {
    id: "REG006",
    siteId: "SITE002",
    country: "United States",
    region: "West",
    regulatoryBody: "FDA",
    requirementType: "approval",
    stage: "treatment",
    status: "at-risk",
    dueDate: "2023-11-05",
    description: "Protocol deviation approval required",
    impact: "high"
  }
];

const stageLabels = {
  'screening': 'Screening',
  'enrollment': 'Enrollment',
  'treatment': 'Treatment',
  'follow-up': 'Follow-up',
  'close-out': 'Close-out'
};

interface RegulatoryBarriersProps {
  data?: RegulatoryData[];
  isLoading?: boolean;
}

const RegulatoryBarriers: React.FC<RegulatoryBarriersProps> = ({
  data = sampleRegulatoryData,
  isLoading = false
}) => {
  const [filterStage, setFilterStage] = useState<string>("all");
  const [filterSite, setFilterSite] = useState<string>("all");
  
  // Get unique sites from data
  const sites = [...new Set(data.map(item => item.siteId))];
  
  // Filter data based on selected filters
  const filteredData = data.filter(item => {
    const matchesStage = filterStage === "all" || item.stage === filterStage;
    const matchesSite = filterSite === "all" || item.siteId === filterSite;
    return matchesStage && matchesSite;
  });
  
  // Group data by stage for the accordion view
  const dataByStage = filteredData.reduce((acc, item) => {
    if (!acc[item.stage]) {
      acc[item.stage] = [];
    }
    acc[item.stage].push(item);
    return acc;
  }, {} as Record<string, RegulatoryData[]>);
  
  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-500">Compliant</Badge>;
      case 'at-risk':
        return <Badge className="bg-yellow-500">At Risk</Badge>;
      case 'non-compliant':
        return <Badge className="bg-red-500">Non-Compliant</Badge>;
      case 'pending':
        return <Badge className="bg-blue-500">Pending</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  // Helper function to get requirement type icon
  const getRequirementIcon = (type: string) => {
    switch (type) {
      case 'documentation':
        return <Flag className="h-4 w-4 text-blue-500" />;
      case 'approval':
        return <Law className="h-4 w-4 text-purple-500" />;
      case 'inspection':
        return <ShieldAlert className="h-4 w-4 text-yellow-500" />;
      case 'reporting':
        return <Shield className="h-4 w-4 text-green-500" />;
      default:
        return <Law className="h-4 w-4" />;
    }
  };
  
  // Helper to get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-500';
      default:
        return '';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold flex items-center">
            <Law className="mr-2 text-synergia-600" size={20} />
            Regulatory Barriers
          </CardTitle>
          
          <div className="flex space-x-2">
            <Select
              value={filterStage}
              onValueChange={setFilterStage}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="enrollment">Enrollment</SelectItem>
                <SelectItem value="treatment">Treatment</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
                <SelectItem value="close-out">Close-out</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filterSite}
              onValueChange={setFilterSite}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {sites.map(site => (
                  <SelectItem key={site} value={site}>
                    {site}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-synergia-600"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No regulatory barriers found for the selected filters.
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {Object.keys(dataByStage).sort().map(stage => (
              <AccordionItem key={stage} value={stage}>
                <AccordionTrigger className="text-lg font-medium">
                  <div className="flex items-center">
                    {stageLabels[stage as keyof typeof stageLabels]}
                    <Badge variant="outline" className="ml-2">
                      {dataByStage[stage].length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Site</TableHead>
                        <TableHead>Requirement</TableHead>
                        <TableHead>Regulatory Body</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Impact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataByStage[stage].map(item => (
                        <TableRow key={item.id}>
                          <TableCell>{item.siteId}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getRequirementIcon(item.requirementType)}
                              <span className="ml-2">{item.description}</span>
                            </div>
                          </TableCell>
                          <TableCell>{item.regulatoryBody}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>{new Date(item.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell className={getImpactColor(item.impact)}>
                            {item.impact.charAt(0).toUpperCase() + item.impact.slice(1)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default RegulatoryBarriers;
