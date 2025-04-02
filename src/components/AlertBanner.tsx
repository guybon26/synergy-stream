
import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { TriggerResponse } from '../types/synergia';

interface AlertBannerProps {
  trigger: TriggerResponse | null;
  onDismiss: () => void;
}

const AlertBanner = ({ trigger, onDismiss }: AlertBannerProps) => {
  if (!trigger) return null;

  const getSeverityColor = (impact: string) => {
    if (impact.includes('72+')) return 'bg-red-100 border-red-300 text-red-800';
    if (impact.includes('48')) return 'bg-amber-100 border-amber-300 text-amber-800';
    return 'bg-blue-100 border-blue-300 text-blue-800';
  };

  return (
    <div className={`mb-4 border rounded-lg p-3 ${getSeverityColor(trigger.details.estimatedImpact)}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">{trigger.message}</h3>
            <p className="text-sm mt-1">
              Estimated impact: {trigger.details.estimatedImpact} 
              <span className="mx-1">•</span>
              Confidence: {Math.round(trigger.details.confidence * 100)}%
            </p>
            <p className="text-sm font-medium mt-1">
              Proposed action: {trigger.details.proposedAction}
            </p>
          </div>
        </div>
        <button onClick={onDismiss} className="text-gray-500 hover:text-gray-700">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default AlertBanner;
