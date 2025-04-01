import {
  DisruptionSimulationParams,
  MultiDocumentAnalysisResult,
  DocumentSource,
  ProtocolAnalysisResult,
  RiskAssessment,
  LogisticsData,
  FinanceData,
  AnalysisModelInfo,
  EnrollmentData,
  RegulatoryData
} from '@/types/synergia';

const determineFileType = (file: File): DocumentSource['fileType'] => {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.pdf')) return 'pdf';
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return 'excel';
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) return 'word';
  return 'unknown';
};

const containsFinanceData = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  return fileName.includes('finance') || 
         fileName.includes('budget') || 
         fileName.includes('cost') || 
         fileName.includes('expense');
};

const containsProtocolData = (fileOrName: File | string): boolean => {
  const fileName = typeof fileOrName === 'string' 
    ? fileOrName.toLowerCase() 
    : fileOrName.name.toLowerCase();
    
  return fileName.includes('protocol') || 
         fileName.includes('study') || 
         fileName.includes('clinical') || 
         fileName.includes('trial');
};

export const analyzeDocuments = async (
  files: File[]
): Promise<MultiDocumentAnalysisResult> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log(`Processing ${files.length} files for analysis`);
  
  const sources: DocumentSource[] = files.map(file => {
    const fileType = determineFileType(file);
    const isFinanceFile = containsFinanceData(file);
    const isProtocolFile = containsProtocolData(file);
    
    const financeData = isFinanceFile ? generateFinanceData(file) : [];
    
    return {
      fileName: file.name,
      fileType,
      fileSize: file.size,
      extractedContent: `Sample extracted content from ${file.name}`,
      sectorInsights: {
        logistics: ['Inventory levels identified', 'Supply chain requirements detected', 'Temperature monitoring requirements found'],
        cro: ['Patient enrollment projections found', 'Visit schedule complexity analyzed', 'Monitoring requirements detected'],
        regulatory: ['Regulatory submission deadlines detected', 'Import/export requirements identified', 'Local representative requirements found'],
        finance: isFinanceFile ? ['Budget allocations identified', 'Cost centers detected'] : []
      },
      extractedData: {
        logistics: generateEnhancedLogisticsData(file),
        finance,
        enrollment: isProtocolFile ? generateEnrollmentData(file) : [],
        regulatory: isProtocolFile ? generateRegulatoryData(file) : []
      }
    };
  });
  
  const extractedLogistics: LogisticsData[] = [];
  const extractedFinance: FinanceData[] = [];
  const extractedEnrollment: EnrollmentData[] = [];
  const extractedRegulatory: RegulatoryData[] = [];
  
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
    if (source.extractedData?.regulatory) {
      extractedRegulatory.push(...source.extractedData.regulatory);
    }
  });
  
  const modelInfo: AnalysisModelInfo = {
    name: "SYNERGIA NLP Analyzer",
    version: "2.1.3",
    capabilities: [
      "Document text extraction",
      "Clinical trial terminology analysis",
      "Protocol risk assessment",
      "Supply chain disruption prediction",
      "Financial impact analysis",
      "Regulatory compliance analysis",
      "Site logistics evaluation",
      "Interactive Q&A on trial data"
    ],
    accuracyScore: 0.89,
    lastUpdated: "2023-10-15"
  };
  
  const storageConditions = sources.some(source => 
    containsProtocolData(source.fileName)) 
    ? "2-8°C (Refrigerated)" 
    : "15-25°C (Room temperature)";
  
  const combinedSimulationParams: DisruptionSimulationParams = {
    siteId: extractedLogistics.length > 0 ? extractedLogistics[0].siteId : 'SITE001',
    disruptionType: 'IMP Delay',
    severity: 'medium',
    product: extractedLogistics.length > 0 ? extractedLogistics[0].product : 'Drug A'
  };
  
  const protocolAnalysis: ProtocolAnalysisResult = {
    logistics: {
      supplyRequirements: ['Refrigerated storage', 'Temperature monitoring', 'Controlled shipment'],
      storageConditions,
      distributionChallenges: ['Cold chain logistics', 'Customs clearance', 'Local distribution restrictions'],
      estimatedDemand: {
        high: extractedLogistics.some(item => item.inventory > 50),
        estimate: extractedLogistics.length > 0 
          ? `${Math.round(extractedLogistics.reduce((sum, item) => sum + item.inventory, 0) / extractedLogistics.length * 10)} units per month`
          : '1000 units per month'
      },
      shippingFrequency: "Bi-weekly",
      temperatureMonitoring: "Continuous electronic monitoring required",
      packagingRequirements: ["Triple layer insulation", "Temperature indicators", "Shock-resistant outer packaging"],
      importRequirements: ["Import licenses required for EU, Asia", "Customs documentation", "Local representative"]
    },
    cro: {
      visitSchedule: {
        visitCount: 12,
        durationWeeks: 48,
        complexity: 3
      },
      procedureComplexity: 4,
      staffingRequirements: {
        staff: ['Physician', 'Nurse', 'Technician', 'Clinical Research Associate', 'Data Manager'],
        complexity: 3
      },
      patientBurden: 3,
      monitoringFrequency: "Bi-weekly remote, monthly on-site",
      dataManagement: {
        complexity: 4,
        electronicSystems: ["EDC", "ePRO", "CTMS", "RTSM"]
      },
      recruitmentStrategy: ["Patient advocacy groups", "Digital advertising", "Physician referrals"]
    },
    protocolChallenges: ['Complex inclusion/exclusion criteria', 'Extensive data collection', 'Multiple product administrations'],
    complexity: 4,
    siteSpecificRequirements: {
      'SITE001': {
        regulatoryNotes: ["IRB approval expedited", "Local ethics review required"],
        logisticsNotes: ["Direct-to-site shipping approved", "Backup storage facility required"],
        staffingNotes: ["Additional pharmacy staff needed", "24/7 on-call physician required"]
      },
      'SITE002': {
        regulatoryNotes: ["Full FDA submission required", "Import permits pending"],
        logisticsNotes: ["Temperature excursions reported in summer", "Alternative courier needed"],
        staffingNotes: ["Staff shortage identified", "Remote monitoring limitations"]
      }
    }
  };
  
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
      },
      {
        category: 'Temperature Control',
        description: 'Risk of temperature excursions during transit',
        severity: 'high',
        probability: 'medium',
        impact: 'Product degradation and patient safety',
        mitigation: 'Implement continuous temperature monitoring and alert system'
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
      },
      {
        category: 'Data Quality',
        description: 'Risk of incomplete or inaccurate data collection',
        severity: 'medium',
        probability: 'low',
        impact: 'Regulatory submissions and analysis',
        mitigation: 'Implement additional data validation steps and site training'
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
      },
      {
        category: 'Import/Export',
        description: 'Customs delays for international sites',
        severity: 'medium',
        probability: 'high',
        impact: 'Site activation and supply chain',
        mitigation: 'Engage local customs brokers and prepare documentation in advance'
      }
    ],
    overall: {
      riskScore: 65,
      summary: 'Moderate risk profile identified',
      mitigationStrategies: [
        'Implement risk mitigation plan', 
        'Monitor key risk indicators',
        'Establish backup suppliers for critical components',
        'Develop contingency plans for potential site closures',
        'Increase monitoring frequency for high-risk sites'
      ]
    }
  };
  
  const keywords = {
    sites: extractedLogistics.map(item => item.siteId).filter((v, i, a) => a.indexOf(v) === i),
    products: extractedLogistics.map(item => item.product).filter((v, i, a) => a.indexOf(v) === i),
    dates: ['2023-06-15', '2023-08-30', '2023-12-01'],
    procedures: ['Blood Draw', 'ECG', 'MRI', 'Physical Exam'],
    regulatoryBodies: ['FDA', 'EMA', 'PMDA', 'ANVISA', 'Health Canada'],
    countries: ['United States', 'Canada', 'Brazil', 'United Kingdom', 'Germany', 'Japan', 'Australia']
  };
  
  const tabAnalysis = {
    logistics: {
      summary: "The trial requires refrigerated storage (2-8°C) for all products with continuous temperature monitoring. Bi-weekly shipments are recommended with triple-layer insulation packaging.",
      keyFindings: [
        "Temperature excursions identified as high-risk factor",
        "International shipping requires import licenses and customs documentation",
        "Site SITE002 has reported temperature control issues",
        "Backup suppliers needed for critical components"
      ],
      recommendations: [
        "Implement continuous temperature monitoring system",
        "Establish backup supply chain for all critical materials",
        "Increase inventory levels at sites with historical supply issues",
        "Develop contingency plans for cold chain failures"
      ]
    },
    cro: {
      summary: "The protocol requires 12 patient visits over 48 weeks with moderate complexity procedures. Staff requirements include physicians, nurses, and technicians with specialized training.",
      keyFindings: [
        "Patient recruitment projected to be challenging",
        "Data collection complexity rated as high (4/5)",
        "Staff shortages identified at Site SITE002",
        "Remote monitoring limitations at some sites"
      ],
      recommendations: [
        "Increase site support for patient recruitment",
        "Simplify data collection procedures where possible",
        "Provide additional training for site staff",
        "Implement enhanced monitoring for sites with identified issues"
      ]
    },
    regulatory: {
      summary: "Multiple regulatory bodies involved with varying submission requirements. Import permits required for international sites with local representatives needed in some regions.",
      keyFindings: [
        "FDA and EMA submissions require different documentation",
        "Import permits pending for some international sites",
        "Local ethics committee approval variations by country",
        "Customs clearance identified as potential delay factor"
      ],
      recommendations: [
        "Engage local regulatory consultants in each region",
        "Prepare customs documentation well in advance",
        "Establish communication channel with regulatory authorities",
        "Develop timeline tracking system for all regulatory submissions"
      ]
    },
    locations: {
      summary: "The trial includes sites across 7 countries with varying regulatory, logistics, and staffing requirements. Site-specific challenges have been identified and documented.",
      siteNotes: {
        "SITE001": [
          "Northeast Medical Center with expedited IRB approval",
          "Direct-to-site shipping approved",
          "Additional pharmacy staff needed"
        ],
        "SITE002": [
          "Pacific Research Institute with temperature control issues",
          "Full FDA submission required",
          "Staff shortage identified"
        ],
        "SITE003": [
          "Midwest Clinical Center with good enrollment performance",
          "Temperature monitoring system in place",
          "Adequate staffing levels"
        ],
        "SITE004": [
          "Southern Medical Research with customs clearance challenges",
          "Local representative required",
          "Remote monitoring capabilities limited"
        ],
        "SITE005": [
          "Capital Region Hospital with strong regulatory compliance",
          "Backup storage facility available",
          "24/7 on-call physician available"
        ]
      }
    }
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
      patients: [],
      regulatory: extractedRegulatory
    },
    modelInfo,
    tabAnalysis
  };
};

function generateEnhancedLogisticsData(file: File): LogisticsData[] {
  const fileName = file.name;
  const productMatch = fileName.match(/([A-Za-z]+\d*)/);
  const productBase = productMatch ? productMatch[0] : 'Drug';
  
  const numProducts = Math.floor(Math.random() * 3) + 2;
  const result: LogisticsData[] = [];
  
  const storageTypes = ['Refrigerated', 'Frozen', 'Controlled Room Temperature', 'Ultra-cold'];
  const tempRequirements = ['2-8°C', '-20°C', '15-25°C', '-70°C'];
  const transportTypes = ['Air Freight', 'Temperature-controlled Vehicle', 'Express Courier', 'Maritime Shipping'];
  const frequencies = ['Weekly', 'Bi-weekly', 'Monthly', 'On-demand'];
  
  for (let i = 0; i < numProducts; i++) {
    const product = `${productBase} ${String.fromCharCode(65 + i)}`;
    const inventory = Math.floor(Math.random() * 100) + 10;
    const reorderPoint = Math.floor(inventory * 0.6);
    const status = inventory > reorderPoint ? 'ok' : (inventory > reorderPoint * 0.5 ? 'warning' : 'critical');
    
    const fileNameLower = fileName.toLowerCase();
    let storageTypeIndex = 0;
    if (fileNameLower.includes('frozen') || fileNameLower.includes('cold')) {
      storageTypeIndex = 1;
    } else if (fileNameLower.includes('room') || fileNameLower.includes('ambient')) {
      storageTypeIndex = 2;
    } else if (fileNameLower.includes('ultra') || fileNameLower.includes('-70')) {
      storageTypeIndex = 3;
    }
    
    result.push({
      siteId: `SITE00${i + 1}`,
      product,
      inventory,
      reorderPoint,
      status,
      shipmentFrequency: frequencies[Math.floor(Math.random() * frequencies.length)],
      transportationType: transportTypes[Math.floor(Math.random() * transportTypes.length)],
      storageType: storageTypes[storageTypeIndex],
      temperatureRequirements: tempRequirements[storageTypeIndex],
      handlingInstructions: "Handle with care. Keep upright. Protect from light.",
      leadTime: Math.floor(Math.random() * 14) + 7
    });
  }
  
  return result;
}

function generateFinanceData(file: File): FinanceData[] {
  const categories = ['Personnel', 'Equipment', 'Medication', 'Patient Compensation', 'Site Costs', 'Regulatory Fees'];
  const result: FinanceData[] = [];
  
  const fileName = file.name.toLowerCase();
  const hasOverbudget = fileName.includes('risk') || fileName.includes('issue');
  
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const baseAmount = (i + 1) * 10000;
    const variance = baseAmount * 0.3 * (Math.random() - 0.5);
    const amount = Math.round(baseAmount + variance);
    
    let status: 'projected' | 'actual' | 'overbudget' = 'projected';
    if (fileName.includes('actual') || fileName.includes('report')) {
      status = 'actual';
    } 
    if (hasOverbudget && i === Math.floor(Math.random() * categories.length)) {
      status = 'overbudget';
    }
    
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

function generateEnrollmentData(file: File): EnrollmentData[] {
  const result: EnrollmentData[] = [];
  
  for (let i = 1; i <= 3; i++) {
    const target = Math.floor(Math.random() * 30) + 30;
    const actual = Math.floor(Math.random() * target);
    const rate = parseFloat((Math.random() * 3 + 1).toFixed(1));
    
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

function generateRegulatoryData(file: File): RegulatoryData[] {
  const regulatoryBodies = ['FDA', 'EMA', 'PMDA', 'ANVISA', 'Health Canada'];
  const countries = ['United States', 'European Union', 'Japan', 'Brazil', 'Canada'];
  const regions = ['North America', 'Europe', 'Asia', 'South America', 'Global'];
  const requirementTypes: ('documentation' | 'approval' | 'inspection' | 'reporting')[] = ['documentation', 'approval', 'inspection', 'reporting'];
  const stages: ('screening' | 'enrollment' | 'treatment' | 'follow-up' | 'close-out')[] = ['screening', 'enrollment', 'treatment', 'follow-up', 'close-out'];
  const statuses: ('compliant' | 'at-risk' | 'non-compliant' | 'pending')[] = ['compliant', 'at-risk', 'non-compliant', 'pending'];
  const impacts: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
  
  const result: RegulatoryData[] = [];
  
  const numRequirements = Math.floor(Math.random() * 4) + 5;
  
  for (let i = 0; i < numRequirements; i++) {
    const countryIndex = i % countries.length;
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 180) + 30);
    
    const requirementType = requirementTypes[Math.floor(Math.random() * requirementTypes.length)];
    let description = '';
    
    switch (requirementType) {
      case 'documentation':
        description = `${["Protocol", "IB", "ICF", "CRF", "IND"][Math.floor(Math.random() * 5)]} submission for ${countries[countryIndex]}`;
        break;
      case 'approval':
        description = `${["Regulatory", "Ethics", "Site", "Protocol Amendment"][Math.floor(Math.random() * 4)]} approval required for ${countries[countryIndex]}`;
        break;
      case 'inspection':
        description = `${["Site", "Manufacturing", "Sponsor", "CRO"][Math.floor(Math.random() * 4)]} inspection scheduled in ${countries[countryIndex]}`;
        break;
      case 'reporting':
        description = `${["Safety", "Annual", "Interim", "Final"][Math.floor(Math.random() * 4)]} report submission required`;
        break;
    }
    
    const customsRequirements = [];
    if (countries[countryIndex] !== 'United States') {
      customsRequirements.push('Import license required');
      customsRequirements.push('Commercial invoice required');
      
      if (countries[countryIndex] === 'Brazil' || countries[countryIndex] === 'Japan') {
        customsRequirements.push('Product registration required');
        customsRequirements.push('Import permit per shipment required');
      }
      
      if (countries[countryIndex] === 'European Union') {
        customsRequirements.push('EU customs declaration form required');
        customsRequirements.push('GDP compliance documentation required');
      }
    }
    
    result.push({
      id: `REG${String(i + 1).padStart(3, '0')}`,
      siteId: `SITE00${Math.floor(Math.random() * 5) + 1}`,
      country: countries[countryIndex],
      region: regions[countryIndex],
      regulatoryBody: regulatoryBodies[countryIndex],
      requirementType,
      stage: stages[Math.floor(Math.random() * stages.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      dueDate: dueDate.toISOString().split('T')[0],
      description,
      impact: impacts[Math.floor(Math.random() * impacts.length)],
      importerOfRecord: countries[countryIndex] !== 'United States' ? 'Global Clinical Logistics Partner' : undefined,
      customsRequirements: customsRequirements.length > 0 ? customsRequirements : undefined,
      localRepresentative: countries[countryIndex] !== 'United States' ? `${countries[countryIndex]} Regulatory Services LLC` : undefined,
      submissionTimeline: `${Math.floor(Math.random() * 30) + 30} days prior to ${stages[Math.floor(Math.random() * stages.length)]}`
    });
  }
  
  return result;
}
