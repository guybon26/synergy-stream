
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
