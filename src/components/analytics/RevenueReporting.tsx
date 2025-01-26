import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { RevenueMetrics } from '../../types/analytics.types';
import { DollarSign, TrendingUp, CreditCard } from 'lucide-react';

interface RevenueReportingProps {
  metrics: RevenueMetrics;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const RevenueReporting: React.FC<RevenueReportingProps> = ({ metrics }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Revenue Overview</h2>
        <div className="text-sm text-gray-500">
          <span className="font-medium text-green-600">+12%</span> from last month
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600">Total Revenue</p>
              <p className="text-2xl font-bold">
                ${metrics.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600">Monthly Recurring</p>
              <p className="text-2xl font-bold">
                ${metrics.monthlyRecurring.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Revenue Distribution</h3>
        <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={metrics.revenueByType}
              dataKey="amount"
              nameKey="type"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              label
            >
              {metrics.revenueByType.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Outstanding Payments</h3>
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Total Outstanding</p>
              <p className="text-2xl font-bold text-red-700">
                ${metrics.outstandingPayments.toLocaleString()}
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};