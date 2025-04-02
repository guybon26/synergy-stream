
import React from 'react';
import { Users, AlertCircle } from 'lucide-react';
import { PatientJourney } from '../types/synergia';

interface PatientJourneyVisualizerProps {
  patients: PatientJourney[];
  isLoading: boolean;
}

const stages = ['Screening', 'Treatment', 'Follow-up', 'Completed'];

const PatientJourneyVisualizer = ({ patients, isLoading }: PatientJourneyVisualizerProps) => {
  if (isLoading) {
    return (
      <div className="synergia-card h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-8 w-8 border-4 border-synergia-500 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  const getAvatarColor = (patientId: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500'
    ];
    const index = parseInt(patientId.replace('P', '')) % colors.length;
    return colors[index];
  };

  const getAvatarInitials = (patientId: string, gender: string) => {
    return gender.charAt(0);
  };

  const patientsByStage = stages.map(stage => {
    return patients.filter(p => p.currentStage === stage);
  });

  return (
    <div className="synergia-card h-full">
      <div className="mb-4 flex items-center">
        <Users className="text-synergia-600 mr-2" size={20} />
        <h2 className="text-lg font-semibold">Patient Journey Visualization</h2>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {stages.map((stage, stageIndex) => (
          <div key={stage} className="flex flex-col">
            <div className="text-center mb-2 font-medium bg-gray-100 py-1 rounded-md">
              {stage}
            </div>
            
            <div className="flex flex-col items-center space-y-3 p-2 min-h-[200px]">
              {patientsByStage[stageIndex].length > 0 ? (
                patientsByStage[stageIndex].map(patient => (
                  <div 
                    key={patient.patientId} 
                    className={`patient-journey-step ${patient.isVisitDelayed ? 'border-red-300 bg-red-50' : 'border-gray-200'} w-full`}
                  >
                    <div className="flex items-center w-full p-1">
                      <div className={`patient-avatar ${getAvatarColor(patient.patientId)} mr-2`}>
                        {getAvatarInitials(patient.patientId, patient.demographics.gender)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">{patient.patientId}</span>
                        <span className="text-xs text-gray-500">Site {patient.siteId.replace('SITE', '')}</span>
                      </div>
                      {patient.isVisitDelayed && (
                        <AlertCircle size={16} className="text-red-500 ml-auto animate-pulse-opacity" />
                      )}
                    </div>
                    <div className="text-xs mt-1 text-center w-full">
                      {patient.isVisitDelayed ? (
                        <span className="text-red-600 font-medium">Visit delayed</span>
                      ) : (
                        <span className="text-gray-500">Next: {new Date(patient.nextVisitDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No patients
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientJourneyVisualizer;
