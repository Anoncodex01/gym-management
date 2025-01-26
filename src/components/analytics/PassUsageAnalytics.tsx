import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PassUsageMetrics } from '../../types/analytics.types';

interface PassUsageAnalyticsProps {
  metrics: PassUsageMetrics;
}

export const PassUsageAnalytics: React.FC<PassUsageAnalyticsProps> = ({ metrics }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium mb-6">Pass Usage Analytics</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Active Day Passes</p>
          <p className="text-2xl font-bold">{metrics.activeDayPasses}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Active 10-Day Passes</p>
          <p className="text-2xl font-bold">{metrics.activeTenDayPasses}</p>
        </div>
      </div>

      <div className="h-64">
        <h3 className="text-sm font-medium mb-2">Pass Usage Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metrics.usageByDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="dayPasses" name="Day Passes" fill="#4F46E5" />
            <Bar dataKey="tenDayPasses" name="10-Day Passes" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}