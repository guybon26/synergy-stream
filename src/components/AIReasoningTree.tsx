
import React from 'react';
import { BrainCircuit, Check, CircleDot, CircleDashed } from 'lucide-react';
import { ReasoningStep } from '../types/synergia';

interface AIReasoningTreeProps {
  data: ReasoningStep;
  isLoading: boolean;
}

const AIReasoningTree = ({ data, isLoading }: AIReasoningTreeProps) => {
  if (isLoading) {
    return (
      <div className="synergia-card h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-8 w-8 border-4 border-synergia-500 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-600">Loading reasoning data...</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'done': return <Check size={16} className="text-green-500" />;
      case 'active': return <CircleDot size={16} className="text-blue-500 animate-pulse" />;
      default: return <CircleDashed size={16} className="text-gray-400" />;
    }
  };

  const renderStep = (step: ReasoningStep, level = 0) => {
    return (
      <div key={step.id} className="mb-2">
        <div className={`flex items-start ${level > 0 ? 'ml-6' : ''}`}>
          <div className="mr-2 mt-1">{getStatusIcon(step.status)}</div>
          <div>
            <h4 className="font-medium">{step.title}</h4>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
        </div>
        
        {step.children && step.children.length > 0 && (
          <div className="tree-line">
            {step.children.map(child => renderStep(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="synergia-card h-full overflow-y-auto">
      <div className="mb-4 flex items-center">
        <BrainCircuit className="text-synergia-600 mr-2" size={20} />
        <h2 className="text-lg font-semibold">AI Reasoning Process</h2>
      </div>
      
      {data ? renderStep(data) : (
        <div className="text-center py-8 text-gray-500">
          <p>No reasoning data available</p>
        </div>
      )}
    </div>
  );
};

export default AIReasoningTree;
