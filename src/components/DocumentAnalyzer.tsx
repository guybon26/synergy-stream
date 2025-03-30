
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, FileType, Upload, AlertCircle, FileCheck } from 'lucide-react';
import { analyzeDocument } from '@/services/documentAnalysis';
import { useToast } from '@/hooks/use-toast';
import { DisruptionSimulationParams, ProtocolAnalysisResult, RiskAssessment } from '@/types/synergia';
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DocumentAnalyzerProps {
  onSimulationGenerated: (params: DisruptionSimulationParams) => void;
  onRiskAssessmentGenerated?: (riskAssessment: RiskAssessment) => void;
  onProtocolAnalysisGenerated?: (protocolAnalysis: ProtocolAnalysisResult) => void;
}

const DocumentAnalyzer: React.FC<DocumentAnalyzerProps> = ({ 
  onSimulationGenerated,
  onRiskAssessmentGenerated,
  onProtocolAnalysisGenerated
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setExtractedText('');
      setRiskAssessment(null);
    }
  };

  const getFileIcon = (file: File | null) => {
    if (!file) return <FileText size={36} className="text-gray-400" />;
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') return <FileText size={32} className="text-red-500" />;
    if (['xls', 'xlsx', 'csv'].includes(extension || '')) return <FileSpreadsheet size={32} className="text-green-500" />;
    if (['doc', 'docx'].includes(extension || '')) return <FileType size={32} className="text-blue-500" />;
    
    return <FileText size={32} className="text-gray-500" />;
  };

  const simulateProgress = () => {
    setAnalysisProgress(0);
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 200);
    
    return () => clearInterval(interval);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a protocol document to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    const cleanup = simulateProgress();
    
    try {
      const result = await analyzeDocument(file);
      setExtractedText(result.text.substring(0, 500) + "...");
      setRiskAssessment(result.riskAssessment);
      
      // Complete the progress bar
      setAnalysisProgress(100);
      
      // Generate simulation parameters from analysis
      const simulationParams = result.simulationParams;
      
      toast({
        title: "Protocol Analysis Complete",
        description: `Successfully analyzed "${file.name}" and generated simulation parameters`,
      });
      
      // Pass the simulation parameters to the parent component
      onSimulationGenerated(simulationParams);
      
      // If handlers provided, pass risk assessment and protocol analysis
      if (onRiskAssessmentGenerated) {
        onRiskAssessmentGenerated(result.riskAssessment);
      }
      
      if (onProtocolAnalysisGenerated) {
        onProtocolAnalysisGenerated(result.protocolAnalysis);
      }
    } catch (error) {
      console.error("Document analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the document. Please try a different file.",
        variant: "destructive"
      });
      setAnalysisProgress(0);
    } finally {
      setIsAnalyzing(false);
      cleanup();
    }
  };

  const renderSeverityBadge = (severity: 'low' | 'medium' | 'high') => {
    const colorClass = severity === 'high' 
      ? 'bg-red-100 text-red-800' 
      : severity === 'medium' 
        ? 'bg-amber-100 text-amber-800' 
        : 'bg-green-100 text-green-800';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {severity}
      </span>
    );
  };

  return (
    <div className="synergia-card mb-6">
      <div className="mb-4 flex items-center">
        <FileCheck className="text-synergia-600 mr-2" size={20} />
        <h2 className="text-lg font-semibold">Protocol Document Analysis</h2>
      </div>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
          {file ? (
            <div className="text-center space-y-2">
              {getFileIcon(file)}
              <p className="font-medium text-gray-700">{file.name}</p>
              <p className="text-sm text-gray-500">{Math.round(file.size / 1024)} KB</p>
              <Button 
                variant="outline" 
                onClick={() => setFile(null)}
                className="mt-2"
              >
                Remove
              </Button>
            </div>
          ) : (
            <>
              <FileText size={36} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-4">Upload a clinical trial protocol document</p>
              <p className="text-xs text-gray-400 mb-4">Supported file types: PDF, Excel, Word</p>
              <label htmlFor="document-upload">
                <Button 
                  variant="outline" 
                  className="cursor-pointer"
                  onClick={() => document.getElementById('document-upload')?.click()}
                >
                  <Upload size={16} className="mr-2" />
                  Browse Files
                </Button>
              </label>
              <input 
                id="document-upload"
                type="file" 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" 
                onChange={handleFileChange}
                className="hidden" 
              />
            </>
          )}
        </div>

        {file && (
          <>
            {isAnalyzing && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Analyzing document...</span>
                  <span>{analysisProgress}%</span>
                </div>
                <Progress value={analysisProgress} className="h-2" />
              </div>
            )}
            
            <Button 
              onClick={handleUpload}
              disabled={isAnalyzing}
              className="w-full bg-synergia-600 hover:bg-synergia-700"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Analyzing Protocol...
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="mr-2" />
                  Analyze Protocol & Generate Simulation
                </>
              )}
            </Button>
          </>
        )}

        {(extractedText || riskAssessment) && (
          <div className="mt-4">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Document Preview</TabsTrigger>
                <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="mt-4">
                <h3 className="text-sm font-medium mb-2">Extracted Content Preview:</h3>
                <div className="bg-gray-50 p-3 rounded-md text-xs max-h-32 overflow-y-auto text-gray-700">
                  {extractedText}
                </div>
              </TabsContent>
              
              <TabsContent value="risks" className="mt-4">
                {riskAssessment ? (
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="text-sm font-medium mb-2">Overall Assessment:</h3>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">Risk Score:</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${riskAssessment.overall.riskScore > 2 
                              ? 'bg-red-500' 
                              : riskAssessment.overall.riskScore > 1 
                                ? 'bg-amber-500' 
                                : 'bg-green-500'}`}
                            style={{ width: `${Math.min(100, riskAssessment.overall.riskScore * 33)}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-xs font-medium">{riskAssessment.overall.summary}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Key Risks:</h3>
                      {[...riskAssessment.logistics, ...riskAssessment.cro, ...riskAssessment.regulatory]
                        .filter(risk => risk.severity !== 'low')
                        .slice(0, 3)
                        .map((risk, i) => (
                          <div key={i} className="bg-gray-50 p-2 rounded-md">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium">{risk.category}</span>
                              {renderSeverityBadge(risk.severity)}
                            </div>
                            <p className="text-xs text-gray-700">{risk.description}</p>
                          </div>
                        ))}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-1">Mitigation Strategies:</h3>
                      <ul className="text-xs list-disc pl-4 space-y-1">
                        {riskAssessment.overall.mitigationStrategies.map((strategy, i) => (
                          <li key={i} className="text-gray-700">{strategy}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 text-gray-500 text-sm">
                    Risk assessment will appear after analysis
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentAnalyzer;
