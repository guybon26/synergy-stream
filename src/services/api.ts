import { TriggerResponse, DisruptionSimulationParams, PatientJourney, ReasoningStep, LogisticsData, EnrollmentData, ProtocolData, DisruptionLogEntry } from '../types/synergia';

// Mock data and API responses
const mockPatientJourneys: PatientJourney[] = [
  {
    patientId: 'P001',
    siteId: 'SITE001',
    currentStage: 'Screening',
    nextVisitDate: '2023-05-15',
    isVisitDelayed: false,
    status: 'active',
    demographics: { age: 45, gender: 'F' }
  },
  {
    patientId: 'P002',
    siteId: 'SITE001',
    currentStage: 'Treatment',
    nextVisitDate: '2023-05-18',
    isVisitDelayed: true,
    status: 'active',
    demographics: { age: 62, gender: 'M' }
  },
  {
    patientId: 'P003',
    siteId: 'SITE002',
    currentStage: 'Follow-up',
    nextVisitDate: '2023-05-20',
    isVisitDelayed: false,
    status: 'active',
    demographics: { age: 29, gender: 'F' }
  },
  {
    patientId: 'P004',
    siteId: 'SITE002',
    currentStage: 'Treatment',
    nextVisitDate: '2023-05-16',
    isVisitDelayed: true,
    status: 'active',
    demographics: { age: 51, gender: 'M' }
  },
  {
    patientId: 'P005',
    siteId: 'SITE003',
    currentStage: 'Screening',
    nextVisitDate: '2023-05-22',
    isVisitDelayed: false,
    status: 'active',
    demographics: { age: 37, gender: 'F' }
  },
  {
    patientId: 'P006',
    siteId: 'SITE003',
    currentStage: 'Treatment',
    nextVisitDate: '2023-05-17',
    isVisitDelayed: false,
    status: 'active',
    demographics: { age: 44, gender: 'M' }
  }
];

const mockLogisticsData: LogisticsData[] = [
  { siteId: 'SITE001', product: 'Drug A', inventory: 78, reorderPoint: 50, status: 'ok' },
  { siteId: 'SITE001', product: 'Drug B', inventory: 35, reorderPoint: 40, status: 'warning' },
  { siteId: 'SITE002', product: 'Drug A', inventory: 92, reorderPoint: 50, status: 'ok' },
  { siteId: 'SITE002', product: 'Drug B', inventory: 12, reorderPoint: 40, status: 'critical' },
  { siteId: 'SITE003', product: 'Drug A', inventory: 68, reorderPoint: 50, status: 'ok' },
  { siteId: 'SITE003', product: 'Drug B', inventory: 55, reorderPoint: 40, status: 'ok' }
];

const mockEnrollmentData: EnrollmentData[] = [
  { siteId: 'SITE001', actual: 32, target: 50, rate: 2.3, predictedEnd: '2023-08-15' },
  { siteId: 'SITE002', actual: 28, target: 45, rate: 1.8, predictedEnd: '2023-09-10' },
  { siteId: 'SITE003', actual: 41, target: 40, rate: 3.2, predictedEnd: '2023-07-22' }
];

const mockProtocolData: ProtocolData[] = [
  { version: 'v1.0', optimizationScore: 72, patientCompliance: 68, siteFeedback: 76 },
  { version: 'v1.1', optimizationScore: 78, patientCompliance: 72, siteFeedback: 80 },
  { version: 'v1.2', optimizationScore: 85, patientCompliance: 84, siteFeedback: 88 }
];

const mockDisruptionLog: DisruptionLogEntry[] = [
  {
    id: 'LOG001',
    timestamp: '2023-05-10T09:34:21Z',
    message: 'Shipment delay at Site 2',
    type: 'logistics',
    severity: 'medium',
    resolved: true
  },
  {
    id: 'LOG002',
    timestamp: '2023-05-12T14:22:45Z',
    message: 'Enrollment pause at Site 3',
    type: 'cro',
    severity: 'high',
    resolved: false
  }
];

// Fix for the ReasoningStep mock data
const mockReasoningSteps: ReasoningStep = {
  id: 'step-1',
  title: 'Analyze Initial Disruption',
  description: 'Evaluating the impact of Site 2 IMP delay on patient visits',
  status: 'done',
  children: [
    {
      id: 'step-1-1',
      title: 'Logistics Assessment',
      description: 'Calculating IMP availability risk at affected site',
      status: 'done',
      children: [
        {
          id: 'step-1-1-1',
          title: 'Current Inventory Check',
          description: 'Site 2 has 12 units, below reorder point (40)',
          status: 'done'
        },
        {
          id: 'step-1-1-2',
          title: 'Supply Chain Analysis',
          description: 'Nearest resupply from Depot 3 will take 48 hours',
          status: 'done'
        }
      ]
    },
    {
      id: 'step-1-2',
      title: 'CRO Impact Evaluation',
      description: 'Determining effect on enrollment and patient visits',
      status: 'done',
      children: [
        {
          id: 'step-1-2-1',
          title: 'Visit Schedule Analysis',
          description: '4 patients scheduled in next 48 hours',
          status: 'done'
        },
        {
          id: 'step-1-2-2',
          title: 'Protocol Compliance Risk',
          description: 'Visit window may be exceeded for 2 patients',
          status: 'done'
        }
      ]
    }
  ]
};

// Sample regulatory data for testing
const sampleRegulatoryData = [
  {
    id: "REG001",
    siteId: "SITE001",
    country: "United States",
    region: "Northeast",
    regulatoryBody: "FDA",
    requirementType: "approval",
    stage: "enrollment",
    status: "compliant",
    dueDate: "2023-12-15",
    description: "IND approval required before patient enrollment",
    impact: "high"
  },
  {
    id: "REG002",
    siteId: "SITE002",
    country: "United States",
    region: "West",
    regulatoryBody: "FDA",
    requirementType: "documentation",
    stage: "screening",
    status: "at-risk",
    dueDate: "2023-11-30",
    description: "Protocol amendments need IRB review",
    impact: "medium"
  },
  {
    id: "REG003",
    siteId: "SITE003",
    country: "United States",
    region: "Midwest",
    regulatoryBody: "IRB",
    requirementType: "reporting",
    stage: "treatment",
    status: "non-compliant",
    dueDate: "2023-10-25",
    description: "SAE reporting requirements not met",
    impact: "high"
  },
  {
    id: "REG004",
    siteId: "SITE004",
    country: "United States",
    region: "South",
    regulatoryBody: "FDA",
    requirementType: "inspection",
    stage: "follow-up",
    status: "pending",
    dueDate: "2023-12-10",
    description: "Site inspection scheduled",
    impact: "medium"
  },
  {
    id: "REG005",
    siteId: "SITE005",
    country: "United States",
    region: "Northeast",
    regulatoryBody: "IRB",
    requirementType: "documentation",
    stage: "close-out",
    status: "compliant",
    dueDate: "2024-01-15",
    description: "Final study report submission",
    impact: "low"
  },
  {
    id: "REG006",
    siteId: "SITE002",
    country: "United States",
    region: "West",
    regulatoryBody: "FDA",
    requirementType: "approval",
    stage: "treatment",
    status: "at-risk",
    dueDate: "2023-11-05",
    description: "Protocol deviation approval required",
    impact: "high"
  }
];

// Function to get regulatory data
export const getRegulatoryData = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real application, this would be an API call to fetch data
  return sampleRegulatoryData;
};

// Mock API functions
export const simulateDisruption = async (params: DisruptionSimulationParams): Promise<TriggerResponse> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const triggerId = `TRIG-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
  
  return {
    triggerId,
    message: `${params.disruptionType} at Site ${params.siteId} with ${params.severity} severity`,
    details: {
      affectedEntity: `Site ${params.siteId}`,
      impactType: params.disruptionType,
      estimatedImpact: params.severity === 'high' ? '72+ hours' : params.severity === 'medium' ? '48 hours' : '24 hours',
      confidence: params.severity === 'high' ? 0.95 : params.severity === 'medium' ? 0.85 : 0.75,
      proposedAction: params.disruptionType === 'IMP Delay' 
        ? 'Reroute supplies from backup depot' 
        : params.disruptionType === 'Site Closure' 
          ? 'Temporarily redistribute patients to nearby sites'
          : 'Adjust patient visit schedule'
    },
    modulesTriggered: {
      logistics: {
        predictedDelay: params.severity === 'high' ? '72h' : params.severity === 'medium' ? '48h' : '24h',
        confidence: params.severity === 'high' ? 0.92 : params.severity === 'medium' ? 0.82 : 0.72,
      },
      cro: {
        enrollmentAction: params.severity === 'high' ? 'Pause enrollment' : params.severity === 'medium' ? 'Reduce enrollment rate' : 'Monitor enrollment',
        rationale: params.disruptionType === 'IMP Delay' 
          ? 'Insufficient product available for new patients' 
          : params.disruptionType === 'Site Closure' 
            ? 'Site temporarily unable to process new patients'
            : 'Staffing constraints may impact patient management'
      }
    }
  };
};

export const getPatientJourneys = async (): Promise<PatientJourney[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockPatientJourneys;
};

export const getReasoningSteps = async (triggerId: string): Promise<ReasoningStep> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockReasoningSteps;
};

export const getLogisticsData = async (): Promise<LogisticsData[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 700));
  return mockLogisticsData;
};

export const getEnrollmentData = async (): Promise<EnrollmentData[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 700));
  return mockEnrollmentData;
};

export const getProtocolData = async (): Promise<ProtocolData[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockProtocolData;
};

export const getDisruptionLog = async (): Promise<DisruptionLogEntry[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockDisruptionLog;
};

export const updatePatientJourneys = (patients: PatientJourney[], triggerId: string, affectedSite: string): PatientJourney[] => {
  return patients.map(patient => {
    if (patient.siteId === affectedSite) {
      return {
        ...patient,
        isVisitDelayed: true
      };
    }
    return patient;
  });
};
