import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RevenueMetrics } from '../../types/analytics.types';
import { DollarSign, TrendingUp, CreditCard } from 'lucide-react';

interface RevenueReportingProps {
  metrics: RevenueMetrics;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const RevenueReporting: React.FC<RevenueReportingProps> = ({ metrics }) => {
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month' | 'quarter'>('month');

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Revenue Overview</h2>
        <div className="flex items-center gap-4">
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value as any)}
            className="rounded-md border-gray-300 shadow-sm text-sm"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly</option>
          </select>
          <div className="text-sm text-gray-500">
            <span className="font-medium text-green-600">+12%</span> from last period
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
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
        <h3 className="text-sm font-medium text-gray-700 mb-4">Revenue Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.revenueByPeriod}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Area
                type="monotone"
                dataKey="corporate"
                name="Corporate"
                stackId="1"
                stroke={COLORS[0]}
                fill={COLORS[0]}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="single"
                name="Single"
                stackId="1"
                stroke={COLORS[1]}
                fill={COLORS[1]}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="couple"
                name="Couple"
                stackId="1"
                stroke={COLORS[2]}
                fill={COLORS[2]}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Outstanding</p>
              <p className="text-2xl font-bold text-red-700">
                ${metrics.outstandingPayments.toLocaleString()}
              </p>
            </div>
            <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700">
              View
            </button>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Projected</p>
              <p className="text-2xl font-bold text-yellow-700">
                ${(metrics.totalRevenue * 1.1).toLocaleString()}
              </p>
            </div>
            <button className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700">
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};