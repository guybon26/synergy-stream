
import { DisruptionSimulationParams } from '@/types/synergia';
import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface PDFAnalysisResult {
  text: string;
  simulationParams: DisruptionSimulationParams;
  keywords: {
    sites: string[];
    products: string[];
    dates: string[];
  };
}

/**
 * Analyzes a PDF file to extract clinical trial information
 */
export async function analyzePDF(file: File): Promise<PDFAnalysisResult> {
  try {
    // Convert the file to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Extract text from all pages
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => 
        item.str).join(' ');
      fullText += pageText + ' ';
    }
    
    // Analyze the extracted text to generate simulation parameters
    const simulationParams = analyzeTrialText(fullText);
    
    // Extract key information
    const keywords = extractKeywords(fullText);
    
    return {
      text: fullText,
      simulationParams,
      keywords
    };
  } catch (error) {
    console.error('Error analyzing PDF:', error);
    throw new Error('Failed to analyze PDF');
  }
}

/**
 * Extract relevant keywords from the trial text
 */
function extractKeywords(text: string) {
  // Simple regex patterns to identify potential sites, products, and dates
  const sitePattern = /site\s+(\d+)/gi;
  const productPattern = /(drug|product|imp)\s+([A-Za-z0-9-]+)/gi;
  const datePattern = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/g;
  
  const sites: string[] = [];
  const products: string[] = [];
  const dates: string[] = [];
  
  // Extract site IDs
  let siteMatch;
  while ((siteMatch = sitePattern.exec(text)) !== null) {
    if (siteMatch[1] && !sites.includes(siteMatch[1])) {
      sites.push(siteMatch[1]);
    }
  }
  
  // Extract product names
  let productMatch;
  while ((productMatch = productPattern.exec(text)) !== null) {
    if (productMatch[2] && !products.includes(productMatch[2])) {
      products.push(productMatch[2]);
    }
  }
  
  // Extract dates
  let dateMatch;
  while ((dateMatch = datePattern.exec(text)) !== null) {
    if (!dates.includes(dateMatch[0])) {
      dates.push(dateMatch[0]);
    }
  }
  
  return { sites, products, dates };
}

/**
 * Analyze trial text to generate simulation parameters
 */
function analyzeTrialText(text: string): DisruptionSimulationParams {
  // Default values
  let simulationParams: DisruptionSimulationParams = {
    siteId: '001',
    disruptionType: 'IMP Delay',
    severity: 'medium',
    product: 'Drug A'
  };
  
  // Check for site mentions
  const siteMatches = text.match(/site\s+(\d+)/i);
  if (siteMatches && siteMatches[1]) {
    simulationParams.siteId = siteMatches[1].padStart(3, '0');
  }
  
  // Determine disruption type based on keyword frequency
  const impDelayMatches = (text.match(/delay|shipment|supply|inventory/gi) || []).length;
  const siteClosureMatches = (text.match(/closure|close|shut|suspend/gi) || []).length;
  const staffShortageMatches = (text.match(/staff|personnel|shortage|resource/gi) || []).length;
  
  // Set disruption type based on most frequently mentioned issue
  if (siteClosureMatches > impDelayMatches && siteClosureMatches > staffShortageMatches) {
    simulationParams.disruptionType = 'Site Closure';
  } else if (staffShortageMatches > impDelayMatches && staffShortageMatches > siteClosureMatches) {
    simulationParams.disruptionType = 'Staff Shortage';
  } else {
    simulationParams.disruptionType = 'IMP Delay';
  }
  
  // Determine severity based on language
  const highSeverityMatches = (text.match(/critical|severe|urgent|high|major/gi) || []).length;
  const lowSeverityMatches = (text.match(/minor|low|slight|minimal/gi) || []).length;
  
  if (highSeverityMatches > lowSeverityMatches * 2) {
    simulationParams.severity = 'high';
  } else if (lowSeverityMatches > highSeverityMatches) {
    simulationParams.severity = 'low';
  } else {
    simulationParams.severity = 'medium';
  }
  
  // Extract product name
  const productMatches = text.match(/(drug|product|imp)\s+([A-Za-z])/i);
  if (productMatches && productMatches[2]) {
    simulationParams.product = `Drug ${productMatches[2]}`;
  }
  
  return simulationParams;
}
