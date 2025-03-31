
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, FileType, Upload, AlertCircle, FileCheck, Plus, X, FileIcon, FilesIcon } from 'lucide-react';
import { analyzeDocument, analyzeMultipleDocuments } from '@/services/documentAnalysis';
import { useToast } from '@/hooks/use-toast';
import { DisruptionSimulationParams, ProtocolAnalysisResult, RiskAssessment, DocumentSource, MultiDocumentAnalysisResult } from '@/types/synergia';
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [documentSources, setDocumentSources] = useState<DocumentSource[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to Array and append to existing files
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      setExtractedText('');
      setRiskAssessment(null);
      setDocumentSources([]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select protocol documents to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    const cleanup = simulateProgress();
    
    try {
      // Use the multi-document analysis for multiple files
      if (files.length > 1) {
        const result: MultiDocumentAnalysisResult = await analyzeMultipleDocuments(files);
        
        // Set document sources for display
        setDocumentSources(result.sources);
        
        // Set risk assessment
        setRiskAssessment(result.riskAssessment);
        
        // Complete the progress bar
        setAnalysisProgress(100);
        
        toast({
          title: "Protocol Analysis Complete",
          description: `Successfully analyzed ${files.length} documents and generated insights`,
        });
        
        // Pass the combined simulation parameters to the parent component
        onSimulationGenerated(result.combinedSimulationParams);
        
        // If handlers provided, pass risk assessment and protocol analysis
        if (onRiskAssessmentGenerated) {
          onRiskAssessmentGenerated(result.riskAssessment);
        }
        
        if (onProtocolAnalysisGenerated) {
          onProtocolAnalysisGenerated(result.protocolAnalysis);
        }
      } else {
        // Use single document analysis for backward compatibility
        const result = await analyzeDocument(files[0]);
        setExtractedText(result.text.substring(0, 500) + "...");
        setRiskAssessment(result.riskAssessment);
        
        // Complete the progress bar
        setAnalysisProgress(100);
        
        toast({
          title: "Protocol Analysis Complete",
          description: `Successfully analyzed "${files[0].name}" and generated simulation parameters`,
        });
        
        // Pass the simulation parameters to the parent component
        onSimulationGenerated(result.simulationParams);
        
        // If handlers provided, pass risk assessment and protocol analysis
        if (onRiskAssessmentGenerated) {
          onRiskAssessmentGenerated(result.riskAssessment);
        }
        
        if (onProtocolAnalysisGenerated) {
          onProtocolAnalysisGenerated(result.protocolAnalysis);
        }
      }
    } catch (error) {
      console.error("Document analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the documents. Please try different files.",
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
        <FilesIcon className="text-synergia-600 mr-2" size={20} />
        <h2 className="text-lg font-semibold">Multi-Document Protocol Analysis</h2>
      </div>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Selected Documents ({files.length})</h3>
              <label htmlFor="document-upload">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => document.getElementById('document-upload')?.click()}
                >
                  <Plus size={16} className="mr-1" />
                  Add Files
                </Button>
              </label>
              <input 
                id="document-upload"
                type="file" 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" 
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
            </div>
            
            {files.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <div className="flex items-center">
                      {getFileIcon(file)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700 truncate max-w-[180px]">{file.name}</p>
                        <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveFile(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X size={16} className="text-gray-500" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 border border-gray-200 rounded-md">
                <FileText size={36} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-2">Upload multiple clinical trial protocol documents</p>
                <p className="text-xs text-gray-400 mb-2">Supported file types: PDF, Excel, Word</p>
                <label htmlFor="document-upload-empty">
                  <Button 
                    variant="outline" 
                    className="cursor-pointer mt-2"
                    onClick={() => document.getElementById('document-upload-empty')?.click()}
                  >
                    <Upload size={16} className="mr-2" />
                    Browse Files
                  </Button>
                </label>
                <input 
                  id="document-upload-empty"
                  type="file" 
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" 
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
              </div>
            )}
          </div>

          {files.length > 0 && (
            <>
              {isAnalyzing && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Analyzing documents...</span>
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
                    Analyzing Documents...
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="mr-2" />
                    Analyze {files.length > 1 ? `${files.length} Documents` : "Protocol"} & Generate Insights
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {(documentSources.length > 0 || extractedText || riskAssessment) && (
          <div className="mt-4">
            <Tabs defaultValue={documentSources.length > 0 ? "sources" : "text"} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {documentSources.length > 0 && <TabsTrigger value="sources">Document Sources</TabsTrigger>}
                {extractedText && <TabsTrigger value="text">Document Preview</TabsTrigger>}
                <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
              </TabsList>
              
              {documentSources.length > 0 && (
                <TabsContent value="sources" className="mt-4">
                  <h3 className="text-sm font-medium mb-3">Analysis Sources:</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {documentSources.map((source, index) => (
                      <div key={index} className="border rounded-md p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {source.fileType === 'pdf' ? (
                              <FileText size={20} className="text-red-500 mr-2" />
                            ) : source.fileType === 'excel' ? (
                              <FileSpreadsheet size={20} className="text-green-500 mr-2" />
                            ) : source.fileType === 'word' ? (
                              <FileType size={20} className="text-blue-500 mr-2" />
                            ) : (
                              <FileIcon size={20} className="text-gray-500 mr-2" />
                            )}
                            <span className="font-medium text-sm">{source.fileName}</span>
                          </div>
                          <Badge variant="outline">{Math.round(source.fileSize / 1024)} KB</Badge>
                        </div>
                        
                        <div className="grid gap-2">
                          {source.sectorInsights.logistics && (
                            <div>
                              <p className="text-xs font-medium text-blue-600 mb-1">Logistics Insights:</p>
                              <ul className="text-xs list-disc pl-5 space-y-1">
                                {source.sectorInsights.logistics.map((insight, i) => (
                                  <li key={i}>{insight}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {source.sectorInsights.cro && (
                            <div>
                              <p className="text-xs font-medium text-purple-600 mb-1">CRO Insights:</p>
                              <ul className="text-xs list-disc pl-5 space-y-1">
                                {source.sectorInsights.cro.map((insight, i) => (
                                  <li key={i}>{insight}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {source.sectorInsights.regulatory && (
                            <div>
                              <p className="text-xs font-medium text-amber-600 mb-1">Regulatory Insights:</p>
                              <ul className="text-xs list-disc pl-5 space-y-1">
                                {source.sectorInsights.regulatory.map((insight, i) => (
                                  <li key={i}>{insight}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">Content preview:</p>
                          <div className="text-xs text-gray-700 mt-1 max-h-20 overflow-y-auto">
                            {source.extractedContent}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}
              
              {extractedText && (
                <TabsContent value="text" className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Extracted Content Preview:</h3>
                  <div className="bg-gray-50 p-3 rounded-md text-xs max-h-32 overflow-y-auto text-gray-700">
                    {extractedText}
                  </div>
                </TabsContent>
              )}
              
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
