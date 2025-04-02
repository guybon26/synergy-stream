
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Upload, AlertCircle, Server, MessageSquareText, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { analyzeDocuments } from '@/services/documentAnalysis';
import { DisruptionSimulationParams, ProtocolAnalysisResult, RiskAssessment, MultiDocumentAnalysisResult, AnalysisModelInfo } from '@/types/synergia';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState("upload");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([
    {role: "system", content: "I'm Synergia Assistant, ready to help analyze your clinical trial data."}
  ]);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll chat to bottom
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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

      // Add initial message to chat
      setChatHistory(prev => [
        ...prev, 
        {
          role: "assistant", 
          content: `I've analyzed ${files.length} document${files.length > 1 ? 's' : ''}. The documents contain information about ${result.keywords.sites.length} sites and ${result.keywords.products.length} products. Feel free to ask me questions about the logistics, regulatory requirements, CRO services, or any other aspects of your clinical trial.`
        }
      ]);
      
      // Switch to chat tab after analysis
      setActiveTab("chat");
      
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

  const handleAddMoreFiles = async () => {
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
      setAnalysisResult(prev => {
        // Merge the previous and new analysis results
        if (!prev) return result;
        
        return {
          ...result,
          sources: [...prev.sources, ...result.sources],
          keywords: {
            sites: [...new Set([...prev.keywords.sites, ...result.keywords.sites])],
            products: [...new Set([...prev.keywords.products, ...result.keywords.products])],
            dates: [...new Set([...prev.keywords.dates, ...result.keywords.dates])],
            procedures: [...new Set([...prev.keywords.procedures, ...result.keywords.procedures])],
            regulatoryBodies: prev.keywords.regulatoryBodies && result.keywords.regulatoryBodies 
              ? [...new Set([...prev.keywords.regulatoryBodies, ...result.keywords.regulatoryBodies])]
              : prev.keywords.regulatoryBodies || result.keywords.regulatoryBodies,
            countries: prev.keywords.countries && result.keywords.countries 
              ? [...new Set([...prev.keywords.countries, ...result.keywords.countries])]
              : prev.keywords.countries || result.keywords.countries,
          },
          extractedData: {
            logistics: [...(prev.extractedData?.logistics || []), ...(result.extractedData?.logistics || [])],
            patients: [...(prev.extractedData?.patients || []), ...(result.extractedData?.patients || [])],
            enrollment: [...(prev.extractedData?.enrollment || []), ...(result.extractedData?.enrollment || [])],
            regulatory: [...(prev.extractedData?.regulatory || []), ...(result.extractedData?.regulatory || [])],
            finance: [...(prev.extractedData?.finance || []), ...(result.extractedData?.finance || [])],
          }
        };
      });
      
      // Notify parent component of complete analysis
      if (onAnalysisComplete && analysisResult) {
        const updatedResult = {
          ...analysisResult,
          sources: [...analysisResult.sources, ...result.sources],
          extractedData: {
            logistics: [...(analysisResult.extractedData?.logistics || []), ...(result.extractedData?.logistics || [])],
            patients: [...(analysisResult.extractedData?.patients || []), ...(result.extractedData?.patients || [])],
            enrollment: [...(analysisResult.extractedData?.enrollment || []), ...(result.extractedData?.enrollment || [])],
            regulatory: [...(analysisResult.extractedData?.regulatory || []), ...(result.extractedData?.regulatory || [])],
            finance: [...(analysisResult.extractedData?.finance || []), ...(result.extractedData?.finance || [])],
          }
        };
        onAnalysisComplete(updatedResult);
      }

      // Add message to chat about the additional analysis
      setChatHistory(prev => [
        ...prev, 
        {
          role: "assistant", 
          content: `I've analyzed ${files.length} additional document${files.length > 1 ? 's' : ''}. The combined analysis now includes information about ${
            new Set([...(analysisResult?.keywords.sites || []), ...result.keywords.sites]).size
          } sites and ${
            new Set([...(analysisResult?.keywords.products || []), ...result.keywords.products]).size
          } products.`
        }
      ]);
      
      toast({
        title: "Additional Analysis Complete",
        description: `Successfully analyzed ${files.length} more document${files.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error("Document analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the additional documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !analysisResult) return;

    // Add user message to chat
    setChatHistory(prev => [...prev, {role: "user", content: chatMessage}]);
    setChatMessage("");
    setIsSendingChat(true);

    try {
      // In a real implementation, this would call an AI service with the chat message and analysis data
      // For now, we'll simulate a response based on the message content
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let response = "";
      const query = chatMessage.toLowerCase();
      
      if (query.includes("logistics") || query.includes("storage") || query.includes("transport")) {
        response = `Based on the analyzed documents, the trial requires ${analysisResult.protocolAnalysis.logistics.storageConditions} storage conditions. Key logistics challenges include ${analysisResult.protocolAnalysis.logistics.distributionChallenges.join(", ")}. The estimated monthly demand is ${analysisResult.protocolAnalysis.logistics.estimatedDemand.estimate}.`;
      } else if (query.includes("site") || query.includes("location")) {
        response = `The documents mention ${analysisResult.keywords.sites.length} sites: ${analysisResult.keywords.sites.join(", ")}. You can view detailed site information on the Site Map tab, including inventory levels and status for each location.`;
      } else if (query.includes("cro") || query.includes("patient") || query.includes("enrollment")) {
        response = `The trial protocol specifies ${analysisResult.protocolAnalysis.cro.visitSchedule.visitCount} patient visits over ${analysisResult.protocolAnalysis.cro.visitSchedule.durationWeeks} weeks. The staff requirements include ${analysisResult.protocolAnalysis.cro.staffingRequirements.staff.join(", ")}. The procedure complexity is rated ${analysisResult.protocolAnalysis.cro.procedureComplexity}/5.`;
      } else if (query.includes("regulatory") || query.includes("regulation") || query.includes("compliance")) {
        response = `Key regulatory considerations identified include potential compliance issues with GCP. The risk assessment shows ${analysisResult.riskAssessment.regulatory.length} regulatory risks, with the highest severity being ${analysisResult.riskAssessment.regulatory[0].severity}. The recommended mitigation strategy is to ${analysisResult.riskAssessment.regulatory[0].mitigation}.`;
      } else if (query.includes("risk") || query.includes("assessment")) {
        response = `The overall risk score for this trial is ${analysisResult.riskAssessment.overall.riskScore}/100. The risk mitigation strategies include ${analysisResult.riskAssessment.overall.mitigationStrategies.join(", ")}.`;
      } else {
        response = "I can provide information about logistics (storage, transportation), site locations, CRO services (patient enrollment, monitoring), regulatory requirements, and risk assessment. Please specify what aspects of the trial you'd like to know more about.";
      }
      
      setChatHistory(prev => [...prev, {role: "assistant", content: response}]);
      
      // Scroll to bottom of chat after adding new message
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Chat Error",
        description: "Could not process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingChat(false);
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="chat" disabled={!analysisResult}>AI Assistant</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-0">
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
            <div className="space-y-4 mt-4">
              {analysisResult ? (
                <Button
                  onClick={handleAddMoreFiles}
                  disabled={isAnalyzing}
                  className="w-full bg-synergia-500 hover:bg-synergia-600"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <PlusCircle size={16} className="mr-2" />
                      Analyze Additional Documents
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleAnalyzeDocuments}
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
                      Analyze Documents
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
          
          {analysisResult && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium mb-2">Analysis Summary:</h3>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• Analyzed {analysisResult.sources.length} document(s)</li>
                <li>• Identified {analysisResult.keywords.sites.length} site(s) and {analysisResult.keywords.products.length} product(s)</li>
                <li>• Generated {analysisResult.extractedData?.logistics.length || 0} logistics data points</li>
                <li>• Extracted {analysisResult.extractedData?.regulatory.length || 0} regulatory requirements</li>
              </ul>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="chat" className="mt-0">
          {analysisResult ? (
            <div className="flex flex-col space-y-4">
              <div className="border rounded-lg h-64 overflow-y-auto p-4 bg-gray-50">
                {chatHistory.filter(msg => msg.role !== "system").map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}
                  >
                    <div 
                      className={`inline-block px-3 py-2 rounded-lg ${
                        msg.role === "user" 
                          ? "bg-synergia-600 text-white" 
                          : "bg-white border border-gray-300"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              <form onSubmit={handleChatSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask about logistics, sites, CRO, regulatory..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  disabled={isSendingChat}
                />
                <Button 
                  type="submit" 
                  disabled={isSendingChat || !chatMessage.trim()}
                  className="bg-synergia-600 hover:bg-synergia-700"
                >
                  {isSendingChat ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <MessageSquareText size={16} />
                  )}
                </Button>
              </form>
              
              <div className="text-xs text-gray-500 mt-2">
                <p>Try asking about:</p>
                <ul className="list-disc pl-5 mt-1 grid grid-cols-2 gap-x-4">
                  <li>Logistics requirements & storage conditions</li>
                  <li>Site locations and their status</li>
                  <li>CRO services and patient enrollment</li>
                  <li>Regulatory requirements by location</li>
                  <li>Risk assessment and mitigation strategies</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquareText size={36} className="mx-auto mb-2 text-gray-400" />
              <p>Please analyze documents first to use the AI Assistant</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {modelInfo && activeTab === "upload" && (
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
