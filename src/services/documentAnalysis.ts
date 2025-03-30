
import { DisruptionSimulationParams } from '@/types/synergia';
import * as pdfjs from 'pdfjs-dist';
import { ProtocolAnalysisResult, RiskAssessment } from '@/types/synergia';

// Configure PDF.js worker
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface DocumentAnalysisResult {
  text: string;
  simulationParams: DisruptionSimulationParams;
  protocolAnalysis: ProtocolAnalysisResult;
  keywords: {
    sites: string[];
    products: string[];
    dates: string[];
    procedures: string[];
  };
  riskAssessment: RiskAssessment;
}

/**
 * Analyzes a document file to extract clinical trial information
 */
export async function analyzeDocument(file: File): Promise<DocumentAnalysisResult> {
  try {
    const fileType = getFileType(file);
    let fullText = '';
    
    // Extract text based on file type
    if (fileType === 'pdf') {
      fullText = await extractPdfText(file);
    } else if (fileType === 'excel') {
      // In a production app, use a library like SheetJS to parse Excel files
      fullText = await mockExcelExtraction(file);
    } else if (fileType === 'word') {
      // In a production app, use a library like Mammoth.js to parse Word files
      fullText = await mockWordExtraction(file);
    } else {
      throw new Error('Unsupported file type');
    }
    
    // Analyze the extracted text to generate simulation parameters
    const simulationParams = analyzeTrialText(fullText);
    
    // Extract key information
    const keywords = extractKeywords(fullText);
    
    // Analyze the protocol
    const protocolAnalysis = analyzeProtocol(fullText, keywords);
    
    // Generate risk assessment
    const riskAssessment = assessRisks(protocolAnalysis, keywords);
    
    return {
      text: fullText,
      simulationParams,
      protocolAnalysis,
      keywords,
      riskAssessment
    };
  } catch (error) {
    console.error('Error analyzing document:', error);
    throw new Error(`Failed to analyze document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Determine file type based on extension
 */
function getFileType(file: File): 'pdf' | 'excel' | 'word' | 'unknown' {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'pdf') return 'pdf';
  if (['xls', 'xlsx', 'csv'].includes(extension || '')) return 'excel';
  if (['doc', 'docx'].includes(extension || '')) return 'word';
  
  return 'unknown';
}

/**
 * Extract text from PDF files
 */
async function extractPdfText(file: File): Promise<string> {
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
  
  return fullText;
}

/**
 * Mock Excel file extraction (for demonstration)
 * In a real app, use a library like SheetJS
 */
async function mockExcelExtraction(file: File): Promise<string> {
  // This is a mock function - in a real app you would parse the Excel file
  return `Protocol ID: CLIN-2023-01
  Study Title: Phase II Study of Drug X in Patients with Condition Y
  Sites: Site 001, Site 002, Site 003
  Primary Endpoint: Response rate at 6 months
  Visits: Screening, Baseline, Week 4, Week 8, Week 12, Week 24
  Required Tests: Blood Draw, CT Scan, Quality of Life Assessment
  Product: Drug A, Drug B
  Logistics Requirements: Cold chain storage, Site temperature monitoring
  Staff Requirements: 2 research nurses, 1 principal investigator, 1 study coordinator
  Challenging Procedures: Liver biopsy at Screening and Week 24`;
}

/**
 * Mock Word file extraction (for demonstration)
 * In a real app, use a library like Mammoth.js
 */
async function mockWordExtraction(file: File): Promise<string> {
  // This is a mock function - in a real app you would parse the Word file
  return `CLINICAL TRIAL PROTOCOL
  Protocol Number: PROT-2023-005
  Title: A Randomized, Double-Blind Study to Evaluate the Safety and Efficacy of Drug C
  
  Site Information:
  - Site 002 (Los Angeles)
  - Site 004 (Boston)
  - Site 005 (Chicago)
  
  Visit Schedule:
  - Screening (Day -28 to -1)
  - Randomization (Day 0)
  - Treatment Period (Weeks 2, 4, 8, 12, 16)
  - Follow-up (Week 24)
  
  Drug Information:
  - Drug C: Supplied as 50mg tablets
  - Comparator: Placebo
  
  Storage Requirements:
  - Store at room temperature (15-30°C)
  - Protected from light and moisture
  
  Study Procedures:
  - MRI at Screening, Week 8, Week 16
  - Blood sampling at all visits
  - Quality of Life questionnaires at Weeks 0, 8, 16, 24`;
}

/**
 * Extract relevant keywords from the trial text
 */
function extractKeywords(text: string) {
  // Simple regex patterns to identify potential sites, products, dates, and procedures
  const sitePattern = /site\s+(\d+)/gi;
  const productPattern = /(drug|product|imp|medication)\s+([A-Za-z0-9-]+)/gi;
  const datePattern = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|week\s+\d+|day\s+[-]?\d+/gi;
  const procedurePattern = /(blood\s+draw|biopsy|scan|mri|ct|questionnaire|assessment)/gi;
  
  const sites: string[] = [];
  const products: string[] = [];
  const dates: string[] = [];
  const procedures: string[] = [];
  
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
  
  // Extract dates and timepoints
  let dateMatch;
  while ((dateMatch = datePattern.exec(text)) !== null) {
    if (!dates.includes(dateMatch[0])) {
      dates.push(dateMatch[0]);
    }
  }
  
  // Extract procedures
  let procedureMatch;
  while ((procedureMatch = procedurePattern.exec(text)) !== null) {
    if (!procedures.includes(procedureMatch[0])) {
      procedures.push(procedureMatch[0]);
    }
  }
  
  return { sites, products, dates, procedures };
}

/**
 * Analyze protocol to extract structured information
 */
function analyzeProtocol(text: string, keywords: any): ProtocolAnalysisResult {
  // Logistics analysis
  const logisticsAnalysis = {
    supplyRequirements: extractSupplyRequirements(text),
    storageConditions: extractStorageConditions(text),
    distributionChallenges: identifyDistributionChallenges(text, keywords),
    estimatedDemand: estimateProductDemand(text, keywords),
  };
  
  // CRO analysis
  const croAnalysis = {
    visitSchedule: extractVisitSchedule(text),
    procedureComplexity: assessProcedureComplexity(text, keywords),
    staffingRequirements: estimateStaffingNeeds(text),
    patientBurden: assessPatientBurden(text, keywords),
  };
  
  // Protocol challenges
  const protocolChallenges = identifyProtocolChallenges(text, keywords);
  
  return {
    logistics: logisticsAnalysis,
    cro: croAnalysis,
    protocolChallenges,
    complexity: calculateProtocolComplexity(logisticsAnalysis, croAnalysis, protocolChallenges),
  };
}

/**
 * Assess risks based on protocol analysis
 */
function assessRisks(protocolAnalysis: ProtocolAnalysisResult, keywords: any): RiskAssessment {
  const risks: RiskAssessment = {
    logistics: [],
    cro: [],
    regulatory: [],
    overall: {
      riskScore: 0,
      summary: '',
      mitigationStrategies: []
    }
  };
  
  // Logistics risks
  if (protocolAnalysis.logistics.storageConditions.includes('cold chain')) {
    risks.logistics.push({
      category: 'supply-chain',
      description: 'Cold chain requirements increase risk of temperature excursions',
      severity: 'high',
      probability: 'medium',
      impact: 'Potential product quality issues and site stock-outs',
      mitigation: 'Implement temperature monitoring systems and backup storage'
    });
  }
  
  if (protocolAnalysis.logistics.distributionChallenges.length > 2) {
    risks.logistics.push({
      category: 'distribution',
      description: 'Multiple distribution challenges identified',
      severity: 'medium',
      probability: 'high',
      impact: 'Delays in IMP delivery to sites',
      mitigation: 'Develop comprehensive distribution plan with contingency options'
    });
  }
  
  // CRO risks
  if (protocolAnalysis.cro.procedureComplexity > 7) {
    risks.cro.push({
      category: 'procedures',
      description: 'High procedure complexity may impact site performance',
      severity: 'medium',
      probability: 'high',
      impact: 'Protocol deviations and incomplete data collection',
      mitigation: 'Provide additional site training and monitoring'
    });
  }
  
  if (protocolAnalysis.cro.patientBurden > 6) {
    risks.cro.push({
      category: 'enrollment',
      description: 'High patient burden may impact recruitment and retention',
      severity: 'high',
      probability: 'medium',
      impact: 'Slow enrollment and high dropout rate',
      mitigation: 'Consider protocol amendments to reduce visit frequency or procedures'
    });
  }
  
  // Regulatory risks based on keywords
  if (keywords.procedures.some(p => p.includes('biopsy'))) {
    risks.regulatory.push({
      category: 'safety',
      description: 'Invasive procedures require additional regulatory scrutiny',
      severity: 'medium',
      probability: 'medium',
      impact: 'Potential IRB/EC delays or additional requirements',
      mitigation: 'Prepare comprehensive safety monitoring plan'
    });
  }
  
  // Calculate overall risk
  const logisticsRiskScore = risks.logistics.reduce((sum, risk) => {
    return sum + (risk.severity === 'high' ? 3 : risk.severity === 'medium' ? 2 : 1);
  }, 0);
  
  const croRiskScore = risks.cro.reduce((sum, risk) => {
    return sum + (risk.severity === 'high' ? 3 : risk.severity === 'medium' ? 2 : 1);
  }, 0);
  
  const regulatoryRiskScore = risks.regulatory.reduce((sum, risk) => {
    return sum + (risk.severity === 'high' ? 3 : risk.severity === 'medium' ? 2 : 1);
  }, 0);
  
  risks.overall.riskScore = (logisticsRiskScore + croRiskScore + regulatoryRiskScore) / 
    (risks.logistics.length + risks.cro.length + risks.regulatory.length || 1);
  
  // Generate overall risk summary
  if (risks.overall.riskScore > 2.5) {
    risks.overall.summary = 'High risk protocol with significant challenges';
    risks.overall.mitigationStrategies = [
      'Consider protocol amendments to reduce complexity',
      'Increase site support and monitoring',
      'Develop comprehensive contingency plans'
    ];
  } else if (risks.overall.riskScore > 1.5) {
    risks.overall.summary = 'Medium risk protocol with notable challenges';
    risks.overall.mitigationStrategies = [
      'Provide additional site training for complex procedures',
      'Implement enhanced supply chain monitoring',
      'Develop focused risk management plan'
    ];
  } else {
    risks.overall.summary = 'Low to moderate risk protocol';
    risks.overall.mitigationStrategies = [
      'Standard risk monitoring should be sufficient',
      'Regular review of logistics and enrollment metrics',
      'Proactive site communication'
    ];
  }
  
  return risks;
}

/**
 * Extract supply requirements from protocol text
 */
function extractSupplyRequirements(text: string): string[] {
  const requirements: string[] = [];
  
  if (text.match(/cold\s+chain|refrigerat|2-8°C|2-8\s*C|frozen/i)) {
    requirements.push('cold chain storage');
  }
  
  if (text.match(/controlled\s+substance|controlled\s+medication/i)) {
    requirements.push('controlled substance handling');
  }
  
  if (text.match(/reconstitution|preparation|compounding/i)) {
    requirements.push('on-site preparation');
  }
  
  if (text.match(/light\s+sensitive|protect\s+from\s+light/i)) {
    requirements.push('light protection');
  }
  
  if (text.match(/humidity|moisture/i)) {
    requirements.push('humidity control');
  }
  
  return requirements.length > 0 ? requirements : ['standard storage'];
}

/**
 * Extract storage conditions from protocol text
 */
function extractStorageConditions(text: string): string {
  if (text.match(/2-8°C|2-8\s*C|refrigerat/i)) {
    return 'cold chain (2-8°C)';
  }
  
  if (text.match(/frozen|-20°C|-20\s*C|-70°C|-70\s*C/i)) {
    return 'frozen storage';
  }
  
  if (text.match(/room\s+temperature|15-30°C|15-30\s*C|20-25°C|20-25\s*C/i)) {
    return 'room temperature (15-30°C)';
  }
  
  return 'standard conditions';
}

/**
 * Identify distribution challenges
 */
function identifyDistributionChallenges(text: string, keywords: any): string[] {
  const challenges: string[] = [];
  
  if (text.match(/cold\s+chain|refrigerat|2-8°C|2-8\s*C|frozen/i)) {
    challenges.push('temperature-controlled shipping required');
  }
  
  if (text.match(/limited\s+shelf\s+life|expir|stability/i)) {
    challenges.push('limited shelf life');
  }
  
  if (keywords.sites.length > 3) {
    challenges.push('multiple site distribution');
  }
  
  if (text.match(/import|export|customs|international|cross-border/i)) {
    challenges.push('international shipping requirements');
  }
  
  return challenges;
}

/**
 * Estimate product demand based on protocol info
 */
function estimateProductDemand(text: string, keywords: any): { high: boolean; estimate: string } {
  const patientEstimateMatch = text.match(/(\d+)\s+patients|\s+n\s*=\s*(\d+)/i);
  const patientCount = patientEstimateMatch ? parseInt(patientEstimateMatch[1] || patientEstimateMatch[2]) : 0;
  
  const durationMatch = text.match(/(\d+)\s+weeks|(\d+)\s+months/i);
  const durationValue = durationMatch ? parseInt(durationMatch[1] || durationMatch[2]) : 0;
  const durationUnit = durationMatch && durationMatch[0].includes('month') ? 'months' : 'weeks';
  
  const highDemand = patientCount > 100 || keywords.sites.length > 5;
  
  let estimate = 'Unknown demand';
  if (patientCount > 0) {
    estimate = `Estimated ${patientCount} patients over ${durationValue || 'unknown'} ${durationUnit || 'duration'}`;
  }
  
  return { high: highDemand, estimate };
}

/**
 * Extract visit schedule from protocol text
 */
function extractVisitSchedule(text: string): { visitCount: number; durationWeeks: number; complexity: number } {
  // Count mentions of visits, screening, baseline, etc.
  const visitMatches = text.match(/visit|screening|baseline|follow-up|week \d+|day \d+/gi);
  const visitCount = visitMatches ? new Set(visitMatches).size : 0;
  
  // Estimate study duration
  const weekMatch = text.match(/week\s+(\d+)/gi);
  let maxWeek = 0;
  
  if (weekMatch) {
    weekMatch.forEach(match => {
      const num = parseInt(match.replace(/week\s+/i, ''));
      if (num > maxWeek) maxWeek = num;
    });
  }
  
  const monthMatch = text.match(/month\s+(\d+)/gi);
  if (monthMatch) {
    monthMatch.forEach(match => {
      const num = parseInt(match.replace(/month\s+/i, '')) * 4;
      if (num > maxWeek) maxWeek = num;
    });
  }
  
  // Calculate schedule complexity
  const complexity = visitCount > 0 ? visitCount * (maxWeek > 0 ? maxWeek / visitCount : 1) / 4 : 1;
  
  return {
    visitCount,
    durationWeeks: maxWeek || 0,
    complexity: Math.min(10, complexity)
  };
}

/**
 * Assess procedure complexity
 */
function assessProcedureComplexity(text: string, keywords: any): number {
  let complexityScore = 0;
  
  // Add points for complex procedures
  if (text.match(/biopsy/i)) complexityScore += 3;
  if (text.match(/mri|magnetic\s+resonance/i)) complexityScore += 2;
  if (text.match(/ct\s+scan|computed\s+tomography/i)) complexityScore += 2;
  if (text.match(/pet\s+scan|positron/i)) complexityScore += 3;
  if (text.match(/spinal|lumbar\s+puncture/i)) complexityScore += 3;
  if (text.match(/infusion/i)) complexityScore += 1;
  if (text.match(/blood\s+draw|blood\s+sample|venipuncture/i)) complexityScore += 0.5;
  
  // Add based on number of unique procedures
  complexityScore += keywords.procedures.length * 0.5;
  
  // Cap at 10
  return Math.min(10, complexityScore);
}

/**
 * Estimate staffing needs
 */
function estimateStaffingNeeds(text: string): { staff: string[]; complexity: number } {
  const staff: string[] = [];
  let complexity = 0;
  
  if (text.match(/principal\s+investigator|pi/i)) {
    staff.push('Principal Investigator');
    complexity += 1;
  }
  
  if (text.match(/sub-investigator|sub\s+investigator/i)) {
    staff.push('Sub-Investigator');
    complexity += 1;
  }
  
  if (text.match(/research\s+nurse/i)) {
    staff.push('Research Nurse');
    complexity += 2;
  }
  
  if (text.match(/coordinator|crc/i)) {
    staff.push('Study Coordinator');
    complexity += 2;
  }
  
  if (text.match(/pharmacy|pharmacist/i)) {
    staff.push('Pharmacist');
    complexity += 2;
  }
  
  if (text.match(/radiolog|imaging/i)) {
    staff.push('Imaging Specialist');
    complexity += 2;
  }
  
  if (text.match(/laboratory|lab\s+technician/i)) {
    staff.push('Lab Technician');
    complexity += 1;
  }
  
  // Default staff if none detected
  if (staff.length === 0) {
    staff.push('Study Coordinator', 'Principal Investigator');
    complexity = 3;
  }
  
  // Cap complexity
  return { staff, complexity: Math.min(10, complexity) };
}

/**
 * Assess patient burden
 */
function assessPatientBurden(text: string, keywords: any): number {
  let burdenScore = 0;
  
  // Visit frequency
  const visitSchedule = extractVisitSchedule(text);
  burdenScore += visitSchedule.visitCount * 0.3;
  
  // Procedure burden
  if (text.match(/biopsy/i)) burdenScore += 2;
  if (text.match(/mri|magnetic\s+resonance/i)) burdenScore += 1.5;
  if (text.match(/ct\s+scan|computed\s+tomography/i)) burdenScore += 1.5;
  if (text.match(/questionnaire|survey|patient\s+reported/i)) burdenScore += 0.5;
  if (text.match(/diary|daily\s+record/i)) burdenScore += 1;
  if (text.match(/fasting|fast/i)) burdenScore += 1;
  if (text.match(/overnight|admission|hospital\s+stay/i)) burdenScore += 2;
  
  // Study duration burden
  if (visitSchedule.durationWeeks > 52) burdenScore += 2;
  else if (visitSchedule.durationWeeks > 24) burdenScore += 1.5;
  else if (visitSchedule.durationWeeks > 12) burdenScore += 1;
  
  // Cap at 10
  return Math.min(10, burdenScore);
}

/**
 * Identify protocol challenges
 */
function identifyProtocolChallenges(text: string, keywords: any): string[] {
  const challenges: string[] = [];
  
  // Complex eligibility
  if (text.match(/inclusion\s+criteria|exclusion\s+criteria/i) && 
      text.match(/inclusion|exclusion/gi)?.length > 10) {
    challenges.push('Complex eligibility criteria');
  }
  
  // Frequent visits
  const visitSchedule = extractVisitSchedule(text);
  if (visitSchedule.visitCount > 10) {
    challenges.push('High visit burden');
  }
  
  // Complex procedures
  if (keywords.procedures.length > 5) {
    challenges.push('Multiple complex procedures');
  }
  
  // Long duration
  if (visitSchedule.durationWeeks > 52) {
    challenges.push('Extended study duration');
  }
  
  // Invasive procedures
  if (text.match(/biopsy|spinal|lumbar/i)) {
    challenges.push('Invasive procedures');
  }
  
  // Special populations
  if (text.match(/pediatric|children|adolescent/i)) {
    challenges.push('Pediatric population');
  }
  
  if (text.match(/elderly|geriatric/i)) {
    challenges.push('Elderly population');
  }
  
  if (text.match(/rare\s+disease|orphan/i)) {
    challenges.push('Rare disease population');
  }
  
  return challenges;
}

/**
 * Calculate overall protocol complexity
 */
function calculateProtocolComplexity(
  logistics: any, 
  cro: any, 
  challenges: string[]
): number {
  let complexityScore = 0;
  
  // Logistics complexity
  if (logistics.supplyRequirements.includes('cold chain storage')) complexityScore += 2;
  if (logistics.distributionChallenges.length > 0) complexityScore += logistics.distributionChallenges.length;
  if (logistics.supplyRequirements.includes('controlled substance handling')) complexityScore += 2;
  
  // CRO complexity
  complexityScore += cro.procedureComplexity / 2;
  complexityScore += cro.staffingRequirements?.complexity || 0;
  complexityScore += cro.patientBurden / 2;
  
  // Challenge complexity
  complexityScore += challenges.length;
  
  // Scale to 1-10
  return Math.min(10, complexityScore / 4);
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

// Export the original PDF analysis function for backward compatibility
export { analyzePDF } from '@/services/pdfAnalysis';
