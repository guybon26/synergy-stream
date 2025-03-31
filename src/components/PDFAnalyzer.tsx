
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Upload, AlertCircle } from 'lucide-react';
import { analyzePDF } from '@/services/pdfAnalysis';
import { useToast } from '@/hooks/use-toast';
import { DisruptionSimulationParams } from '@/types/synergia';

interface PDFAnalyzerProps {
  onSimulationGenerated: (params: DisruptionSimulationParams) => void;
}

const PDFAnalyzer: React.FC<PDFAnalyzerProps> = ({ onSimulationGenerated }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setExtractedText('');
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzePDF(file);
      setExtractedText(result.text.substring(0, 500) + "...");
      
      // Generate simulation parameters from analysis
      const simulationParams = result.simulationParams;
      
      toast({
        title: "PDF Analysis Complete",
        description: `Successfully analyzed "${file.name}" and generated simulation parameters`,
      });
      
      // Pass the simulation parameters to the parent component
      onSimulationGenerated(simulationParams);
    } catch (error) {
      console.error("PDF analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the PDF. Please try a different file.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="synergia-card mb-6">
      <div className="mb-4 flex items-center">
        <FileText className="text-synergia-600 mr-2" size={20} />
        <h2 className="text-lg font-semibold">PDF Trial Analysis</h2>
      </div>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
          {file ? (
            <div className="text-center space-y-2">
              <FileText size={32} className="mx-auto text-synergia-500" />
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
              <p className="text-sm text-gray-500 mb-4">Upload a clinical trial protocol PDF</p>
              <Button 
                variant="outline" 
                className="cursor-pointer"
                onClick={triggerFileInput}
              >
                <Upload size={16} className="mr-2" />
                Browse Files
              </Button>
              <input 
                ref={fileInputRef}
                id="pdf-upload"
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange}
                className="hidden" 
              />
            </>
          )}
        </div>

        {file && (
          <Button 
            onClick={handleUpload}
            disabled={isAnalyzing}
            className="w-full bg-synergia-600 hover:bg-synergia-700"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <AlertCircle size={16} className="mr-2" />
                Analyze Protocol & Generate Simulation
              </>
            )}
          </Button>
        )}

        {extractedText && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Extracted Content Preview:</h3>
            <div className="bg-gray-50 p-3 rounded-md text-xs max-h-32 overflow-y-auto text-gray-700">
              {extractedText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFAnalyzer;
