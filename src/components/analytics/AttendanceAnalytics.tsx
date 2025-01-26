import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AttendanceMetrics } from '../../types/analytics.types';
import { Users, Clock, TrendingUp } from 'lucide-react';

interface AttendanceAnalyticsProps {
  metrics: AttendanceMetrics;
}

export const AttendanceAnalytics: React.FC<AttendanceAnalyticsProps> = ({ metrics }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Attendance Analytics</h2>
        <div className="text-sm text-gray-500">
          Daily average: <span className="font-medium">{metrics.dailyAverage}</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Peak Hours Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.peakHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="count" 
                name="Visitors"
                fill="#4F46E5"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Monthly Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="visits" 
                name="Total Visits"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Class Attendance</h3>
        <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metrics.classAttendance} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="className" type="category" />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="attendance" 
              name="Attendees"
              fill="#F59E0B"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};