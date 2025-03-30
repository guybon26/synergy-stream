
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText } from 'lucide-react';
import { ProtocolData } from '../types/synergia';

interface ProtocolOptimizationChartProps {
  data: ProtocolData[];
}

const ProtocolOptimizationChart = ({ data }: ProtocolOptimizationChartProps) => {
  const formatData = data.map(item => ({
    ...item,
    name: item.version
  }));

  return (
    <div className="synergia-card h-full">
      <div className="mb-4 flex items-center">
        <FileText className="text-synergia-600 mr-2" size={20} />
        <h2 className="text-lg font-semibold">Protocol - Optimization Scores</h2>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="optimizationScore" 
              name="Overall Score" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 6 }}
              activeDot={{ r: 8 }}
            />
            <Line 
              type="monotone" 
              dataKey="patientCompliance" 
              name="Patient Compliance" 
              stroke="#22c55e" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="siteFeedback" 
              name="Site Feedback" 
              stroke="#f97316" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProtocolOptimizationChart;
