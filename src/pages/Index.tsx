
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/Header';
import AlertBanner from '@/components/AlertBanner';
import DisruptionSimulator from '@/components/DisruptionSimulator';
import LogisticsChart from '@/components/LogisticsChart';
import CROEnrollmentChart from '@/components/CROEnrollmentChart';
import ProtocolOptimizationChart from '@/components/ProtocolOptimizationChart';
import AIReasoningTree from '@/components/AIReasoningTree';
import PatientJourneyVisualizer from '@/components/PatientJourneyVisualizer';
import DisruptionLog from '@/components/DisruptionLog';
import { Users } from 'lucide-react';

import {
  simulateDisruption, 
  getPatientJourneys, 
  getReasoningSteps, 
  getLogisticsData, 
  getEnrollmentData, 
  getProtocolData, 
  getDisruptionLog,
  updatePatientJourneys
} from '@/services/api';

import { 
  TriggerResponse, 
  DisruptionSimulationParams, 
  PatientJourney, 
  ReasoningStep, 
  LogisticsData, 
  EnrollmentData, 
  ProtocolData, 
  DisruptionLogEntry 
} from '@/types/synergia';

const Index = () => {
  const [trigger, setTrigger] = useState<TriggerResponse | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const [patients, setPatients] = useState<PatientJourney[]>([]);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep | null>(null);
  const [logisticsData, setLogisticsData] = useState<LogisticsData[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData[]>([]);
  const [protocolData, setProtocolData] = useState<ProtocolData[]>([]);
  const [disruptionLog, setDisruptionLog] = useState<DisruptionLogEntry[]>([]);
  
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingReasoning, setLoadingReasoning] = useState(false);
  const [loadingLogistics, setLoadingLogistics] = useState(true);
  const [loadingEnrollment, setLoadingEnrollment] = useState(true);
  const [loadingProtocol, setLoadingProtocol] = useState(true);
  const [loadingLog, setLoadingLog] = useState(true);

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [patientData, logisticsResult, enrollmentResult, protocolResult, logResult] = await Promise.all([
          getPatientJourneys(),
          getLogisticsData(),
          getEnrollmentData(),
          getProtocolData(),
          getDisruptionLog()
        ]);
        
        setPatients(patientData);
        setLogisticsData(logisticsResult);
        setEnrollmentData(enrollmentResult);
        setProtocolData(protocolResult);
        setDisruptionLog(logResult);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoadingPatients(false);
        setLoadingLogistics(false);
        setLoadingEnrollment(false);
        setLoadingProtocol(false);
        setLoadingLog(false);
      }
    };
    
    loadInitialData();
  }, []);

  const handleSimulateDisruption = async (params: DisruptionSimulationParams) => {
    setIsSimulating(true);
    setLoadingReasoning(true);
    
    try {
      const response = await simulateDisruption(params);
      setTrigger(response);
      
      // Update patient journey with delay flags
      const updatedPatients = updatePatientJourneys(
        patients, 
        response.triggerId, 
        response.details.affectedEntity
      );
      setPatients(updatedPatients);
      
      // Fetch reasoning steps
      const reasoningData = await getReasoningSteps(response.triggerId);
      setReasoningSteps(reasoningData);
      
      // Add to disruption log
      const newLogEntry: DisruptionLogEntry = {
        id: `LOG${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        timestamp: new Date().toISOString(),
        message: response.message,
        type: params.disruptionType.toLowerCase().includes('imp') ? 'logistics' : 'cro',
        severity: params.severity,
        resolved: false
      };
      
      setDisruptionLog(prev => [newLogEntry, ...prev]);
    } catch (error) {
      console.error('Error simulating disruption:', error);
    } finally {
      setIsSimulating(false);
      setLoadingReasoning(false);
    }
  };

  const handleDismissAlert = () => {
    setTrigger(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 p-6">
        <AlertBanner trigger={trigger} onDismiss={handleDismissAlert} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="patient-journey" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="patient-journey">Patient Journey</TabsTrigger>
                <TabsTrigger value="logistics">Logistics</TabsTrigger>
                <TabsTrigger value="cro">CRO</TabsTrigger>
                <TabsTrigger value="protocol">Protocol</TabsTrigger>
                <TabsTrigger value="ai-reasoning">AI Reasoning</TabsTrigger>
              </TabsList>
              
              <TabsContent value="patient-journey" className="mt-0">
                <PatientJourneyVisualizer patients={patients} isLoading={loadingPatients} />
              </TabsContent>
              
              <TabsContent value="logistics" className="mt-0">
                <LogisticsChart data={logisticsData} />
              </TabsContent>
              
              <TabsContent value="cro" className="mt-0">
                <CROEnrollmentChart data={enrollmentData} />
              </TabsContent>
              
              <TabsContent value="protocol" className="mt-0">
                <ProtocolOptimizationChart data={protocolData} />
              </TabsContent>
              
              <TabsContent value="ai-reasoning" className="mt-0">
                <AIReasoningTree data={reasoningSteps} isLoading={loadingReasoning} />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <DisruptionSimulator onSimulate={handleSimulateDisruption} isLoading={isSimulating} />
            <DisruptionLog entries={disruptionLog} isLoading={loadingLog} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
