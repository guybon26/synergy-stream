
import {
  DisruptionSimulationParams,
  MultiDocumentAnalysisResult,
  DocumentSource,
  ProtocolAnalysisResult,
  RiskAssessment,
  LogisticsData,
  FinanceData,
  AnalysisModelInfo,
  EnrollmentData
} from '@/types/synergia';

// Helper function to determine file type
const determineFileType = (file: File): DocumentSource['fileType'] => {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.pdf')) return 'pdf';
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return 'excel';
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) return 'word';
  return 'unknown';
};

// Helper function to check if file might contain finance data
const containsFinanceData = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  return fileName.includes('finance') || 
         fileName.includes('budget') || 
         fileName.includes('cost') || 
         fileName.includes('expense');
};

// Helper function to check if file might contain protocol data
const containsProtocolData = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  return fileName.includes('protocol') || 
         fileName.includes('study') || 
         fileName.includes('clinical') || 
         fileName.includes('trial');
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
    const isFinanceFile = containsFinanceData(file);
    const isProtocolFile = containsProtocolData(file);
    
    // Generate finance data if file seems finance-related
    const financeData = isFinanceFile ? generateFinanceData(file) : [];
    
    // Generate sample extracted data based on file type
    return {
      fileName: file.name,
      fileType,
      fileSize: file.size,
      extractedContent: `Sample extracted content from ${file.name}`,
      sectorInsights: {
        logistics: ['Inventory levels identified', 'Supply chain requirements detected'],
        cro: ['Patient enrollment projections found', 'Visit schedule complexity analyzed'],
        regulatory: ['Regulatory submission deadlines detected'],
        finance: isFinanceFile ? ['Budget allocations identified', 'Cost centers detected'] : []
      },
      extractedData: {
        // Generate sample extracted logistics data from file
        logistics: generateLogisticsData(file),
        finance: financeData,
        enrollment: isProtocolFile ? generateEnrollmentData(file) : []
      }
    };
  });
  
  // Combine logistics data from all sources
  const extractedLogistics: LogisticsData[] = [];
  const extractedFinance: FinanceData[] = [];
  const extractedEnrollment: EnrollmentData[] = [];
  
  sources.forEach(source => {
    if (source.extractedData?.logistics) {
      extractedLogistics.push(...source.extractedData.logistics);
    }
    if (source.extractedData?.finance) {
      extractedFinance.push(...source.extractedData.finance);
    }
    if (source.extractedData?.enrollment) {
      extractedEnrollment.push(...source.extractedData.enrollment);
    }
  });
  
  // Generate model information
  const modelInfo: AnalysisModelInfo = {
    name: "SYNERGIA NLP Analyzer",
    version: "2.1.3",
    capabilities: [
      "Document text extraction",
      "Clinical trial terminology analysis",
      "Protocol risk assessment",
      "Supply chain disruption prediction",
      "Financial impact analysis"
    ],
    accuracyScore: 0.89,
    lastUpdated: "2023-10-15"
  };
  
  // Extract protocol storage conditions from protocol files
  const storageConditions = sources.some(source => 
    containsProtocolData(source.fileName)) 
    ? "2-8°C (Refrigerated)" 
    : "15-25°C (Room temperature)";
  
  // Generate combined simulation parameters from all files
  const combinedSimulationParams: DisruptionSimulationParams = {
    siteId: extractedLogistics.length > 0 ? extractedLogistics[0].siteId : 'SITE001',
    disruptionType: 'IMP Delay',
    severity: 'medium',
    product: extractedLogistics.length > 0 ? extractedLogistics[0].product : 'Drug A'
  };
  
  // Generate protocol analysis based on actual uploaded files
  const protocolAnalysis: ProtocolAnalysisResult = {
    logistics: {
      supplyRequirements: ['Refrigerated storage', 'Temperature monitoring'],
      storageConditions,
      distributionChallenges: ['Cold chain logistics', 'Customs clearance'],
      estimatedDemand: {
        high: extractedLogistics.some(item => item.inventory > 50),
        estimate: extractedLogistics.length > 0 
          ? `${Math.round(extractedLogistics.reduce((sum, item) => sum + item.inventory, 0) / extractedLogistics.length * 10)} units per month`
          : '1000 units per month'
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
  
  // Generate risk assessment based on actual data from files
  const riskAssessment: RiskAssessment = {
    logistics: [
      {
        category: 'Supply Chain',
        description: extractedLogistics.some(item => item.status === 'critical') 
          ? 'Critical supply shortage detected at multiple sites' 
          : extractedLogistics.some(item => item.status === 'warning')
            ? 'Potential supply issues at some sites'
            : 'Normal supply levels across sites',
        severity: extractedLogistics.some(item => item.status === 'critical') 
          ? 'high' 
          : extractedLogistics.some(item => item.status === 'warning') 
            ? 'medium' 
            : 'low',
        probability: extractedLogistics.some(item => item.status === 'critical') 
          ? 'high' 
          : extractedLogistics.some(item => item.status === 'warning') 
            ? 'medium' 
            : 'low',
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
  
  // Extract keywords from files
  const keywords = {
    sites: extractedLogistics.map(item => item.siteId).filter((v, i, a) => a.indexOf(v) === i),
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
      finance: extractedFinance,
      enrollment: extractedEnrollment,
      patients: [], // We could generate mock patient data here
      regulatory: []  // We could generate mock regulatory data here
    },
    modelInfo
  };
};

// Helper function to generate logistics data from a file
function generateLogisticsData(file: File): LogisticsData[] {
  // Extract product name from filename if possible
  const fileName = file.name;
  const productMatch = fileName.match(/([A-Za-z]+\d*)/);
  const productBase = productMatch ? productMatch[0] : 'Drug';
  
  // Generate between 2-4 products
  const numProducts = Math.floor(Math.random() * 3) + 2;
  const result: LogisticsData[] = [];
  
  for (let i = 0; i < numProducts; i++) {
    const product = `${productBase} ${String.fromCharCode(65 + i)}`; // Drug A, Drug B, etc.
    const inventory = Math.floor(Math.random() * 100) + 10;
    const reorderPoint = Math.floor(inventory * 0.6);
    const status = inventory > reorderPoint ? 'ok' : (inventory > reorderPoint * 0.5 ? 'warning' : 'critical');
    
    result.push({
      siteId: `SITE00${i + 1}`,
      product,
      inventory,
      reorderPoint,
      status
    });
  }
  
  return result;
}

// Helper function to generate finance data from a file
function generateFinanceData(file: File): FinanceData[] {
  const categories = ['Personnel', 'Equipment', 'Medication', 'Patient Compensation', 'Site Costs', 'Regulatory Fees'];
  const result: FinanceData[] = [];
  
  // Use parts of the filename to seed the data
  const fileName = file.name.toLowerCase();
  const hasOverbudget = fileName.includes('risk') || fileName.includes('issue');
  
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const baseAmount = (i + 1) * 10000;
    const variance = baseAmount * 0.3 * (Math.random() - 0.5);
    const amount = Math.round(baseAmount + variance);
    
    // Determine status based on filename hints
    let status: 'projected' | 'actual' | 'overbudget' = 'projected';
    if (fileName.includes('actual') || fileName.includes('report')) {
      status = 'actual';
    } 
    if (hasOverbudget && i === Math.floor(Math.random() * categories.length)) {
      status = 'overbudget';
    }
    
    // Determine budget impact
    const budgetImpact = status === 'overbudget' ? 'negative' : 
                        (Math.random() > 0.7 ? 'positive' : 'neutral');
    
    result.push({
      siteId: `SITE00${Math.floor(Math.random() * 3) + 1}`,
      category,
      description: `${category} costs for clinical trial`,
      amount,
      currency: 'USD',
      date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status,
      budgetImpact
    });
  }
  
  return result;
}

// Helper function to generate enrollment data from a file
function generateEnrollmentData(file: File): EnrollmentData[] {
  const result: EnrollmentData[] = [];
  
  // Generate data for 3 sites
  for (let i = 1; i <= 3; i++) {
    const target = Math.floor(Math.random() * 30) + 30; // 30-60
    const actual = Math.floor(Math.random() * target); // 0-target
    const rate = parseFloat((Math.random() * 3 + 1).toFixed(1)); // 1.0-4.0
    
    // Calculate predicted end date based on enrollment rate
    const remaining = target - actual;
    const weeksRemaining = Math.ceil(remaining / rate);
    const predictedEnd = new Date();
    predictedEnd.setDate(predictedEnd.getDate() + (weeksRemaining * 7));
    
    result.push({
      siteId: `SITE00${i}`,
      target,
      actual,
      rate,
      predictedEnd: predictedEnd.toISOString().split('T')[0]
    });
  }
  
  return result;
}
