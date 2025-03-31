
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Upload, AlertCircle, Server } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { analyzeDocuments } from '@/services/documentAnalysis';
import { DisruptionSimulationParams, ProtocolAnalysisResult, RiskAssessment, MultiDocumentAnalysisResult, AnalysisModelInfo } from '@/types/synergia';

interface DocumentAnalyzerProps {
  onSimulationGenerated: (params: DisruptionSimulationParams) => void;
  onProtocolAnalysisGenerated: (analysis: ProtocolAnalysisResult) => void;
  onRiskAssessmentGenerated: (assessment: RiskAssessment) => void;
  onAnalysisComplete?: (result: MultiDocumentAnalysisResult) => void;
}

const DocumentAnalyzer: React.FC<DocumentAnalyzerProps> = ({
  onSimulationGenerated,
  onProtocolAnalysisGenerated,
  onRiskAssessmentGenerated,
  onAnalysisComplete
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MultiDocumentAnalysisResult | null>(null);
  const [modelInfo, setModelInfo] = useState<AnalysisModelInfo | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAnalyzeDocuments = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeDocuments(files);
      setAnalysisResult(result);
      setModelInfo(result.modelInfo);
      
      // Set the simulation parameters
      onSimulationGenerated(result.combinedSimulationParams);
      
      // Set the protocol analysis
      onProtocolAnalysisGenerated(result.protocolAnalysis);
      
      // Set the risk assessment
      onRiskAssessmentGenerated(result.riskAssessment);
      
      // Notify parent component of complete analysis
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${files.length} document${files.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error("Document analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="synergia-card mb-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="text-synergia-600 mr-2" size={20} />
          <h2 className="text-lg font-semibold">Multi-Document Trial Analysis</h2>
        </div>
        
        {modelInfo && (
          <div className="flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
            <Server size={12} className="mr-1 text-synergia-600" />
            <span>Model: {modelInfo.name} v{modelInfo.version} ({modelInfo.accuracyScore * 100}% accuracy)</span>
          </div>
        )}
      </div>
      
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {files.length > 0 ? (
          <div className="space-y-2 w-full">
            <h3 className="text-sm font-medium text-gray-700">Selected Files:</h3>
            <ul>
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="flex items-center">
                    <FileText size={20} className="text-gray-500 mr-2" />
                    <div>
                      <p className="font-medium text-gray-700">{file.name}</p>
                      <p className="text-sm text-gray-500">{Math.round(file.size / 1024)} KB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(index)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                className="cursor-pointer"
                onClick={triggerFileInput}
              >
                <Upload size={16} className="mr-2" />
                Add More Files
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <FileText size={36} className="mx-auto text-gray-400" />
            <p className="text-sm text-gray-500">Drag & drop files here or click to browse</p>
            <Button 
              variant="outline" 
              className="cursor-pointer"
              onClick={triggerFileInput}
            >
              <Upload size={16} className="mr-2" />
              Select Files
            </Button>
          </div>
        )}
        <input
          ref={fileInputRef}
          id="document-upload"
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <Button
          onClick={handleAnalyzeDocuments}
          disabled={isAnalyzing}
          className="w-full mt-4 bg-synergia-600 hover:bg-synergia-700"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Analyzing...
            </>
          ) : (
            <>
              <AlertCircle size={16} className="mr-2" />
              Analyze Documents
            </>
          )}
        </Button>
      )}
      
      {modelInfo && (
        <div className="mt-4 text-xs text-gray-500">
          <div className="font-medium mb-1">Analysis Model Capabilities:</div>
          <ul className="list-disc pl-4 grid grid-cols-2 gap-x-4">
            {modelInfo.capabilities.map((capability, index) => (
              <li key={index}>{capability}</li>
            ))}
          </ul>
          <div className="mt-1">Last updated: {modelInfo.lastUpdated}</div>
        </div>
      )}
    </div>
  );
};

export default DocumentAnalyzer;
