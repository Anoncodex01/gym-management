import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MembershipMetrics } from '../../types/analytics.types';
import { Users, TrendingUp, UserCheck } from 'lucide-react';

interface MembershipOverviewProps {
  metrics: MembershipMetrics;
}

export const MembershipOverview: React.FC<MembershipOverviewProps> = ({ metrics }) => {
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Membership Overview</h2>
        <div className="flex items-center gap-4">
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value as any)}
            className="rounded-md border-gray-300 shadow-sm text-sm"
          >
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly</option>
            <option value="year">Yearly</option>
          </select>
          <div className="text-sm text-gray-500">
            <span className="font-medium text-green-600">+{metrics.retentionRate}%</span> retention rate
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600">Total Members</p>
              <p className="text-2xl font-bold">{metrics.totalMembers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <UserCheck className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600">Active Members</p>
              <p className="text-2xl font-bold">{metrics.activeMembers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600">New This Month</p>
              <p className="text-2xl font-bold">{metrics.newMembersThisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Membership Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.membershipsByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="corporate"
                name="Corporate"
                stackId="1"
                stroke="#4F46E5"
                fill="#4F46E5"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="single"
                name="Single"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="couple"
                name="Couple"
                stackId="1"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};