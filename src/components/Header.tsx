
import React from 'react';
import { Activity, BrainCircuit } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="bg-synergia-600 text-white p-2 rounded-lg">
          <BrainCircuit size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-synergia-800 flex items-center">
            Synergia<span className="text-synergia-500 ml-1">AI</span>
          </h1>
          <p className="text-xs text-gray-500">Clinical Trial Orchestration Platform</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center">
          <Activity size={14} className="mr-1" />
          System Operational
        </div>
        <div className="text-sm text-gray-600">
          Last update: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </header>
  );
};

export default Header;
