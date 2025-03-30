
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { Users } from 'lucide-react';
import { EnrollmentData } from '../types/synergia';

interface CROEnrollmentChartProps {
  data: EnrollmentData[];
}

const CROEnrollmentChart = ({ data }: CROEnrollmentChartProps) => {
  const formatData = data.map(item => ({
    ...item,
    name: `Site ${item.siteId.replace('SITE', '')}`,
    percentComplete: Math.round((item.actual / item.target) * 100)
  }));

  return (
    <div className="synergia-card h-full">
      <div className="mb-4 flex items-center">
        <Users className="text-synergia-600 mr-2" size={20} />
        <h2 className="text-lg font-semibold">CRO - Enrollment Progress</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-[300px]">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Enrollment Progress</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={formatData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Patients', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
              <Tooltip 
                formatter={(value, name) => [value, name === 'actual' ? 'Enrolled Patients' : 'Target Patients']}
              />
              <Legend />
              <Bar dataKey="actual" name="Enrolled" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="h-[300px]">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Enrollment Rate</h3>
          <ResponsiveContainer width="100%" height="90%">
            <ComposedChart data={formatData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                yAxisId="left" 
                label={{ value: 'Rate (patients/week)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} 
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                label={{ value: 'Completion %', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }} 
              />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="rate" name="Weekly Rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="percentComplete" name="% Complete" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CROEnrollmentChart;
