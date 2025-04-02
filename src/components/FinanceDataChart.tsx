
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { DollarSign } from 'lucide-react';
import { FinanceData } from '@/types/synergia';

interface FinanceDataChartProps {
  data: FinanceData[];
  title?: string;
  fromDocuments?: boolean;
}

const FinanceDataChart = ({ data, title = 'Finance - Budget Status', fromDocuments = false }: FinanceDataChartProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overbudget': return '#ef4444'; // Red
      case 'projected': return '#3b82f6'; // Blue
      default: return '#22c55e'; // Green
    }
  };

  // Group the finance data by category
  const formatData = data.map(item => ({
    ...item,
    name: item.category,
    color: getStatusColor(item.status)
  }));

  return (
    <div className="synergia-card h-full">
      <div className="mb-4 flex items-center">
        <DollarSign className="text-synergia-600 mr-2" size={20} />
        <h2 className="text-lg font-semibold">{title}</h2>
        {fromDocuments && (
          <span className="ml-2 px-2 py-0.5 bg-synergia-100 text-synergia-800 text-xs rounded-full">
            From Documents
          </span>
        )}
      </div>
      
      {data.length > 0 ? (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formatData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis 
                label={{ 
                  value: 'Amount (USD)', 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { textAnchor: 'middle' } 
                }} 
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'amount') {
                    return [`$${value.toLocaleString()}`, 'Budget Amount'];
                  }
                  return [value, name];
                }}
                labelFormatter={(label) => `Category: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="amount" 
                name="Budget Amount" 
                radius={[4, 4, 0, 0]}
              >
                {formatData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-gray-500">No finance data available</p>
        </div>
      )}
      
      {data.length > 0 && (
        <div className="mt-4 flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#22c55e] mr-1"></div>
            <span className="text-xs">Actual</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6] mr-1"></div>
            <span className="text-xs">Projected</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#ef4444] mr-1"></div>
            <span className="text-xs">Overbudget</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceDataChart;
