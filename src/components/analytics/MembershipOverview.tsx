import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MembershipMetrics } from '../../types/analytics.types';
import { Users, TrendingUp, UserCheck } from 'lucide-react';

interface MembershipOverviewProps {
  metrics: MembershipMetrics;
}

export const MembershipOverview: React.FC<MembershipOverviewProps> = ({ metrics }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Membership Overview</h2>
        <div className="text-sm text-gray-500">
          <span className="font-medium text-green-600">+{metrics.retentionRate}%</span> retention rate
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
          <LineChart data={metrics.membershipsByType}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="count" 
              name="Members"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};