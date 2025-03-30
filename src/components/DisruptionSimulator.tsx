
import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { DisruptionSimulationParams } from '../types/synergia';

interface DisruptionSimulatorProps {
  onSimulate: (params: DisruptionSimulationParams) => void;
  isLoading: boolean;
}

const DisruptionSimulator = ({ onSimulate, isLoading }: DisruptionSimulatorProps) => {
  const [params, setParams] = useState<DisruptionSimulationParams>({
    siteId: '002',
    disruptionType: 'IMP Delay',
    severity: 'medium',
    product: 'Drug B'
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSimulate(params);
  };

  return (
    <div className="synergia-card">
      <div className="mb-4 flex items-center">
        <AlertTriangle className="text-amber-500 mr-2" size={20} />
        <h2 className="text-lg font-semibold">Disruption Simulator</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site ID</label>
            <select
              name="siteId"
              value={params.siteId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-synergia-500"
            >
              <option value="001">Site 001</option>
              <option value="002">Site 002</option>
              <option value="003">Site 003</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disruption Type</label>
            <select
              name="disruptionType"
              value={params.disruptionType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-synergia-500"
            >
              <option value="IMP Delay">IMP Delay</option>
              <option value="Site Closure">Site Closure</option>
              <option value="Staff Shortage">Staff Shortage</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              name="severity"
              value={params.severity}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-synergia-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product (for IMP delays)</label>
            <select
              name="product"
              value={params.product}
              onChange={handleChange}
              disabled={params.disruptionType !== 'IMP Delay'}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-synergia-500 disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="Drug A">Drug A</option>
              <option value="Drug B">Drug B</option>
            </select>
          </div>
        </div>
        
        <div className="text-center pt-2">
          <button 
            type="submit" 
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-2 rounded-md transition-colors flex items-center justify-center w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Simulating...
              </>
            ) : (
              <>
                <AlertTriangle size={16} className="mr-2" />
                Simulate Disruption
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DisruptionSimulator;
