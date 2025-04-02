
import React from 'react';
import { ProtocolAnalysisResult } from '@/types/synergia';
import { Dna, FileCheck, Users, Clock, AlertTriangle, CheckCircle, Braces } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProtocolAnalysisVisualizerProps {
  data: ProtocolAnalysisResult | null;
  isLoading?: boolean;
}

const ProtocolAnalysisVisualizer: React.FC<ProtocolAnalysisVisualizerProps> = ({ 
  data,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="synergia-card animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="synergia-card">
        <div className="text-center py-10">
          <FileCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Protocol Analysis Available</h3>
          <p className="mt-2 text-sm text-gray-500">
            Upload a protocol document and run the analysis to see detailed insights here.
          </p>
        </div>
      </div>
    );
  }

  const renderProgressBar = (value: number, max: number = 10) => {
    const percentage = (value / max) * 100;
    const colorClass = 
      percentage > 75 ? 'bg-red-500' : 
      percentage > 50 ? 'bg-amber-500' : 
      'bg-green-500';
    
    return (
      <div className="w-full mt-1">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Low</span>
          <span>High</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colorClass}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="synergia-card">
      <div className="mb-4 flex items-center">
        <Braces className="text-synergia-600 mr-2" size={20} />
        <h2 className="text-lg font-semibold">Protocol Analysis</h2>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Overall Protocol Complexity</h3>
          <span className="text-sm font-medium">
            {data.complexity < 3.5 ? 'Low' : 
             data.complexity < 7 ? 'Medium' : 'High'} Complexity
          </span>
        </div>
        {renderProgressBar(data.complexity)}
      </div>
      
      <Tabs defaultValue="logistics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logistics">Logistics</TabsTrigger>
          <TabsTrigger value="cro">CRO</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logistics" className="pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Supply Requirements</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 text-sm">
                  {data.logistics.supplyRequirements.map((req, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="capitalize">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Storage Conditions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-3">
                  <p className="text-lg font-medium text-synergia-600 capitalize">
                    {data.logistics.storageConditions}
                  </p>
                </div>
                
                <p className="text-sm text-gray-600">
                  {data.logistics.storageConditions.includes('cold chain') 
                    ? 'Requires temperature-controlled environment and monitoring'
                    : data.logistics.storageConditions.includes('frozen')
                    ? 'Requires freezer storage and temperature monitoring'
                    : 'Standard room temperature storage is sufficient'}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Distribution Challenges</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {data.logistics.distributionChallenges.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {data.logistics.distributionChallenges.map((challenge, i) => (
                    <li key={i} className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                      <span className="capitalize">{challenge}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">
                  No significant distribution challenges identified
                </p>
              )}
              
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Estimated Demand:</p>
                  <span className={`text-xs ${data.logistics.estimatedDemand.high ? 'text-amber-600' : 'text-green-600'}`}>
                    {data.logistics.estimatedDemand.high ? 'High Volume' : 'Standard Volume'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {data.logistics.estimatedDemand.estimate}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cro" className="pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Visit Schedule</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Visit Count:</span>
                    <span className="font-medium">{data.cro.visitSchedule.visitCount}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {data.cro.visitSchedule.durationWeeks} weeks
                      {data.cro.visitSchedule.durationWeeks > 52 && ` (${Math.round(data.cro.visitSchedule.durationWeeks/52)} years)`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Schedule Complexity:</span>
                    <span className="font-medium">
                      {data.cro.visitSchedule.complexity < 3 ? 'Low' : 
                       data.cro.visitSchedule.complexity < 7 ? 'Medium' : 'High'}
                    </span>
                  </div>
                </div>
                
                {renderProgressBar(data.cro.visitSchedule.complexity)}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Procedure Complexity</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-3">
                  <span className="text-lg font-medium text-synergia-600">
                    {data.cro.procedureComplexity < 3 ? 'Low' : 
                     data.cro.procedureComplexity < 7 ? 'Medium' : 'High'} Complexity
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {data.cro.procedureComplexity < 3 
                      ? 'Standard procedures with minimal complexity'
                      : data.cro.procedureComplexity < 7
                      ? 'Some specialized procedures requiring training'
                      : 'Complex procedures requiring specialized staff and equipment'}
                  </p>
                </div>
                
                {renderProgressBar(data.cro.procedureComplexity)}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Staffing Requirements</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {data.cro.staffingRequirements.staff.map((role, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Staffing Complexity:</span>
                  <span className="font-medium">
                    {data.cro.staffingRequirements.complexity < 3.5 ? 'Low' : 
                     data.cro.staffingRequirements.complexity < 7 ? 'Medium' : 'High'}
                  </span>
                </div>
                {renderProgressBar(data.cro.staffingRequirements.complexity)}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Patient Burden</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-3">
                  <span className="text-lg font-medium text-synergia-600">
                    {data.cro.patientBurden < 3.5 ? 'Low' : 
                     data.cro.patientBurden < 7 ? 'Medium' : 'High'} Burden
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {data.cro.patientBurden < 3.5 
                      ? 'Minimal patient time and effort required'
                      : data.cro.patientBurden < 7
                      ? 'Moderate time commitment and procedures'
                      : 'Significant time commitment and potentially challenging procedures'}
                  </p>
                </div>
                
                {renderProgressBar(data.cro.patientBurden)}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="challenges" className="pt-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Protocol Challenges</CardTitle>
              <CardDescription>
                {data.protocolChallenges.length} challenges identified
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {data.protocolChallenges.length > 0 ? (
                <div className="space-y-3">
                  {data.protocolChallenges.map((challenge, i) => (
                    <div key={i} className="flex p-2 bg-gray-50 rounded-md">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{challenge}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {challenge.includes('eligibility') 
                            ? 'May impact enrollment rate and screening failure rate'
                            : challenge.includes('visit burden')
                            ? 'May impact patient retention and compliance'
                            : challenge.includes('duration')
                            ? 'May impact dropout rates and overall timeline'
                            : challenge.includes('complex procedures')
                            ? 'May require specialized training and increase protocol deviations'
                            : challenge.includes('Invasive')
                            ? 'May increase adverse events and impact patient acceptance'
                            : 'May require additional planning and monitoring'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <p className="text-sm text-gray-600">
                    No significant protocol challenges identified
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProtocolAnalysisVisualizer;
