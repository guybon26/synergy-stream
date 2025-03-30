
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PackageOpen } from 'lucide-react';
import { LogisticsData } from '../types/synergia';

interface LogisticsChartProps {
  data: LogisticsData[];
}

const LogisticsChart = ({ data }: LogisticsChartProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#22c55e';
    }
  };

  const formatData = data.map(item => ({
    ...item,
    name: `Site ${item.siteId.replace('SITE', '')} - ${item.product}`,
    color: getStatusColor(item.status)
  }));

  return (
    <div className="synergia-card h-full">
      <div className="mb-4 flex items-center">
        <PackageOpen className="text-synergia-600 mr-2" size={20} />
        <h2 className="text-lg font-semibold">Logistics - Inventory Levels</h2>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis label={{ value: 'Units', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
            <Tooltip
              formatter={(value, name) => [value, name === 'inventory' ? 'Current Inventory' : 'Reorder Point']}
              labelFormatter={(label) => `${label}`}
            />
            <Legend />
            <Bar dataKey="inventory" name="Current Inventory" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="reorderPoint" name="Reorder Point" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            {formatData.map((entry, index) => (
              <ReferenceLine
                key={index}
                x={entry.name}
                stroke={entry.color}
                strokeWidth={entry.status !== 'ok' ? 2 : 0}
                strokeDasharray={entry.status !== 'ok' ? "3 3" : "0"}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LogisticsChart;
