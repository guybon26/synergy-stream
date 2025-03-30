
import React from 'react';
import { HistoryIcon, AlertTriangle, CheckCircle2, XCircle, AlertCircle, Users } from 'lucide-react';
import { DisruptionLogEntry } from '../types/synergia';

interface DisruptionLogProps {
  entries: DisruptionLogEntry[];
  isLoading: boolean;
}

const DisruptionLog = ({ entries, isLoading }: DisruptionLogProps) => {
  if (isLoading) {
    return (
      <div className="synergia-card h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-8 w-8 border-4 border-synergia-500 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-600">Loading disruption log...</p>
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'logistics': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'cro': return <Users size={16} className="text-blue-500" />;
      default: return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getSeverityIndicator = (severity: string) => {
    switch(severity) {
      case 'high': return <div className="w-2 h-2 rounded-full bg-red-500"></div>;
      case 'medium': return <div className="w-2 h-2 rounded-full bg-amber-500"></div>;
      case 'low': return <div className="w-2 h-2 rounded-full bg-blue-500"></div>;
      default: return <div className="w-2 h-2 rounded-full bg-gray-500"></div>;
    }
  };

  return (
    <div className="synergia-card h-full">
      <div className="mb-4 flex items-center">
        <HistoryIcon className="text-synergia-600 mr-2" size={20} />
        <h2 className="text-lg font-semibold">Disruption Timeline</h2>
      </div>
      
      {entries.length > 0 ? (
        <div className="space-y-3">
          {entries.map(entry => (
            <div key={entry.id} className="border border-gray-200 rounded-md p-3">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-2">
                  {getTypeIcon(entry.type)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{entry.message}</span>
                      {getSeverityIndicator(entry.severity)}
                      <span className="text-xs text-gray-500">{entry.severity} severity</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div>
                  {entry.resolved ? (
                    <div className="flex items-center text-green-600 text-xs">
                      <CheckCircle2 size={14} className="mr-1" />
                      Resolved
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 text-xs">
                      <XCircle size={14} className="mr-1" />
                      Active
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No disruption logs available</p>
        </div>
      )}
    </div>
  );
};

export default DisruptionLog;
