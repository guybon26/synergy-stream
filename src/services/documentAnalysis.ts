import {
  DisruptionSimulationParams,
  MultiDocumentAnalysisResult,
  DocumentSource,
  ProtocolAnalysisResult,
  RiskAssessment,
  LogisticsData
} from '@/types/synergia';

// Helper function to determine file type
const determineFileType = (file: File): DocumentSource['fileType'] => {
  if (file.name.endsWith('.pdf')) return 'pdf';
  if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) return 'excel';
  if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) return 'word';
  return 'unknown';
};

// Update the analyzeDocuments function to extract logistics data from files
export const analyzeDocuments = async (
  files: File[]
): Promise<MultiDocumentAnalysisResult> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real implementation, this would process the files and extract data
  console.log(`Processing ${files.length} files for analysis`);
  
  // Generate mock document sources based on uploaded files
  const sources: DocumentSource[] = files.map(file => {
    const fileType = determineFileType(file);
    return {
      fileName: file.name,
      fileType,
      fileSize: file.size,
      extractedContent: `Sample extracted content from ${file.name}`,
      sectorInsights: {
        logistics: ['Inventory levels identified', 'Supply chain requirements detected'],
        cro: ['Patient enrollment projections found', 'Visit schedule complexity analyzed'],
        regulatory: ['Regulatory submission deadlines detected']
      },
      extractedData: {
        // Generate sample extracted logistics data from file
        logistics: [
          { 
            siteId: 'SITE001', 
            product: `${file.name.includes('Drug') ? file.name.split('.')[0] : 'Drug X'}`, 
            inventory: Math.floor(Math.random() * 100) + 20, 
            reorderPoint: 50, 
            status: Math.random() > 0.7 ? 'warning' : 'ok' 
          },
          { 
            siteId: 'SITE002', 
            product: `${file.name.includes('Drug') ? file.name.split('.')[0] : 'Drug Y'}`, 
            inventory: Math.floor(Math.random() * 40) + 10, 
            reorderPoint: 40, 
            status: Math.random() > 0.5 ? 'critical' : 'warning' 
          },
          { 
            siteId: 'SITE003', 
            product: `${file.name.includes('Drug') ? file.name.split('.')[0] : 'Drug Z'}`, 
            inventory: Math.floor(Math.random() * 80) + 40, 
            reorderPoint: 45, 
            status: 'ok' 
          }
        ]
      }
    };
  });
  
  // Combine logistics data from all sources
  const extractedLogistics: LogisticsData[] = [];
  sources.forEach(source => {
    if (source.extractedData?.logistics) {
      extractedLogistics.push(...source.extractedData.logistics);
    }
  });
  
  // Generate combined simulation parameters from all files
  const combinedSimulationParams: DisruptionSimulationParams = {
    siteId: 'SITE001',
    disruptionType: 'IMP Delay',
    severity: 'medium',
    product: sources.length > 0 && sources[0].extractedData?.logistics?.[0]?.product || 'Drug A'
  };
  
  // Generate protocol analysis
  const protocolAnalysis: ProtocolAnalysisResult = {
    logistics: {
      supplyRequirements: ['Refrigerated storage', 'Temperature monitoring'],
      storageConditions: '2-8°C',
      distributionChallenges: ['Cold chain logistics', 'Customs clearance'],
      estimatedDemand: {
        high: true,
        estimate: '1000 units per month'
      }
    },
    cro: {
      visitSchedule: {
        visitCount: 12,
        durationWeeks: 48,
        complexity: 3
      },
      procedureComplexity: 4,
      staffingRequirements: {
        staff: ['Physician', 'Nurse', 'Technician'],
        complexity: 3
      },
      patientBurden: 3
    },
    protocolChallenges: ['Complex inclusion/exclusion criteria', 'Extensive data collection'],
    complexity: 4
  };
  
  // Generate risk assessment
  const riskAssessment: RiskAssessment = {
    logistics: [
      {
        category: 'Supply Chain',
        description: 'Potential disruption in IMP supply',
        severity: 'medium',
        probability: 'medium',
        impact: 'Study delay',
        mitigation: 'Establish backup supply'
      }
    ],
    cro: [
      {
        category: 'Enrollment',
        description: 'Slow patient recruitment',
        severity: 'medium',
        probability: 'medium',
        impact: 'Study timeline extension',
        mitigation: 'Increase site activation'
      }
    ],
    regulatory: [
      {
        category: 'Compliance',
        description: 'Risk of non-compliance with GCP',
        severity: 'high',
        probability: 'low',
        impact: 'Regulatory action',
        mitigation: 'Enhance training and monitoring'
      }
    ],
    overall: {
      riskScore: 65,
      summary: 'Moderate risk profile identified',
      mitigationStrategies: ['Implement risk mitigation plan', 'Monitor key risk indicators']
    }
  };
  
  const keywords = {
    sites: ['SITE001', 'SITE002', 'SITE003'],
    products: extractedLogistics.map(item => item.product).filter((v, i, a) => a.indexOf(v) === i),
    dates: ['2023-06-15', '2023-08-30', '2023-12-01'],
    procedures: ['Blood Draw', 'ECG', 'MRI', 'Physical Exam']
  };
  
  return {
    combinedSimulationParams,
    protocolAnalysis,
    riskAssessment,
    sources,
    keywords,
    extractedData: {
      logistics: extractedLogistics,
      patients: [], // We could generate mock patient data here
      enrollment: [], // We could generate mock enrollment data here
      regulatory: []  // We could generate mock regulatory data here
    }
  };
};
