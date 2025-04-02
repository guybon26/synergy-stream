export interface TriggerResponse {
  triggerId: string;
  message: string;
  details: {
    affectedEntity: string;
    impactType: string;
    estimatedImpact: string;
    confidence: number;
    proposedAction: string;
  };
  modulesTriggered: {
    logistics: LogisticsModule;
    cro: CROModule;
  };
}

export interface LogisticsModule {
  predictedDelay: string;
  confidence: number;
}

export interface CROModule {
  enrollmentAction: string;
  rationale: string;
}

export interface ReasoningStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'done';
  children?: ReasoningStep[];
}

export interface DisruptionSimulationParams {
  siteId: string;
  disruptionType: string;
  severity: 'low' | 'medium' | 'high';
  product?: string;
}

export interface PatientJourney {
  patientId: string;
  siteId: string;
  currentStage: string;
  nextVisitDate: string;
  isVisitDelayed: boolean;
  status: 'active' | 'completed' | 'withdrawn';
  demographics: {
    age: number;
    gender: string;
  };
}

export interface LogisticsData {
  siteId: string;
  product: string;
  inventory: number;
  reorderPoint: number;
  status: 'ok' | 'warning' | 'critical';
  shipmentFrequency?: string;
  transportationType?: string;
  storageType?: string;
  temperatureRequirements?: string;
  handlingInstructions?: string;
  leadTime?: number;
}

export interface EnrollmentData {
  siteId: string;
  actual: number;
  target: number;
  rate: number;
  predictedEnd: string;
}

export interface ProtocolData {
  version: string;
  optimizationScore: number;
  patientCompliance: number;
  siteFeedback: number;
}

export interface DisruptionLogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: string;
  severity: string;
  resolved: boolean;
}

export interface RegulatoryData {
  id: string;
  siteId: string;
  country: string;
  region: string;
  regulatoryBody: string;
  requirementType: 'documentation' | 'approval' | 'inspection' | 'reporting';
  stage: 'screening' | 'enrollment' | 'treatment' | 'follow-up' | 'close-out';
  status: 'compliant' | 'at-risk' | 'non-compliant' | 'pending';
  dueDate: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  importerOfRecord?: string;
  customsRequirements?: string[];
  localRepresentative?: string;
  submissionTimeline?: string;
}

export interface FinanceData {
  siteId: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  status: 'projected' | 'actual' | 'overbudget';
  budgetImpact: 'positive' | 'neutral' | 'negative';
}

export interface ProtocolAnalysisResult {
  logistics: {
    supplyRequirements: string[];
    storageConditions: string;
    distributionChallenges: string[];
    estimatedDemand: {
      high: boolean;
      estimate: string;
    };
    shippingFrequency?: string;
    temperatureMonitoring?: string;
    packagingRequirements?: string[];
    importRequirements?: string[];
  };
  cro: {
    visitSchedule: {
      visitCount: number;
      durationWeeks: number;
      complexity: number;
    };
    procedureComplexity: number;
    staffingRequirements: {
      staff: string[];
      complexity: number;
    };
    patientBurden: number;
    monitoringFrequency?: string;
    dataManagement?: {
      complexity: number;
      electronicSystems: string[];
    };
    recruitmentStrategy?: string[];
  };
  protocolChallenges: string[];
  complexity: number;
  siteSpecificRequirements?: Record<string, {
    regulatoryNotes: string[];
    logisticsNotes: string[];
    staffingNotes: string[];
  }>;
}

export interface Risk {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  probability: 'low' | 'medium' | 'high';
  impact: string;
  mitigation: string;
}

export interface RiskAssessment {
  logistics: Risk[];
  cro: Risk[];
  regulatory: Risk[];
  overall: {
    riskScore: number;
    summary: string;
    mitigationStrategies: string[];
  };
}

export interface DocumentSource {
  fileName: string;
  fileType: 'pdf' | 'excel' | 'word' | 'unknown';
  fileSize: number;
  extractedContent: string;
  sectorInsights: {
    logistics?: string[];
    cro?: string[];
    regulatory?: string[];
    finance?: string[];
  };
  extractedData?: {
    logistics?: LogisticsData[];
    patients?: PatientJourney[];
    enrollment?: EnrollmentData[];
    regulatory?: RegulatoryData[];
    finance?: FinanceData[];
  };
}

export interface AnalysisModelInfo {
  name: string;
  version: string;
  capabilities: string[];
  accuracyScore: number;
  lastUpdated: string;
}

export interface MultiDocumentAnalysisResult {
  combinedSimulationParams: DisruptionSimulationParams;
  protocolAnalysis: ProtocolAnalysisResult;
  riskAssessment: RiskAssessment;
  sources: DocumentSource[];
  keywords: {
    sites: string[];
    products: string[];
    dates: string[];
    procedures: string[];
    regulatoryBodies?: string[];
    countries?: string[];
  };
  extractedData?: {
    logistics: LogisticsData[];
    patients: PatientJourney[];
    enrollment: EnrollmentData[];
    regulatory: RegulatoryData[];
    finance: FinanceData[];
  };
  modelInfo: AnalysisModelInfo;
  tabAnalysis?: {
    logistics: {
      summary: string;
      keyFindings: string[];
      recommendations: string[];
    };
    cro: {
      summary: string;
      keyFindings: string[];
      recommendations: string[];
    };
    regulatory: {
      summary: string;
      keyFindings: string[];
      recommendations: string[];
    };
    locations: {
      summary: string;
      siteNotes: Record<string, string[]>;
    };
  };
}
