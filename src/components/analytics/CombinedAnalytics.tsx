import React, { useState, useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MembershipMetrics, RevenueMetrics } from '../../types/analytics.types';
import { DollarSign, Users, TrendingUp } from 'lucide-react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, parseISO, isWithinInterval } from 'date-fns';

interface CombinedAnalyticsProps {
  membershipMetrics: MembershipMetrics;
  revenueMetrics: RevenueMetrics;
}

const COLORS = {
  corporate: '#4F46E5',
  single: '#10B981',
  couple: '#F59E0B',
  revenue: '#EF4444',
  attendance: '#8B5CF6'
};

export const CombinedAnalytics: React.FC<CombinedAnalyticsProps> = ({
  membershipMetrics,
  revenueMetrics,
}) => {
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month' | 'quarter'>('month');

  // Ensure we have valid data before processing
  if (!membershipMetrics?.membershipsByType || !revenueMetrics?.revenueByPeriod) {
    return (
      <div className="bg-white rounded-lg shadow p-6 min-h-[400px] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-lg text-gray-600 font-medium">Loading analytics data...</div>
        <div className="text-sm text-gray-500 mt-2">Please wait while we fetch your data</div>
      </div>
    );
  }

  // Filter data based on selected time frame
  const filteredData = useMemo(() => {
    const today = new Date();
    let interval: { start: Date; end: Date };

    switch (timeFrame) {
      case 'week':
        interval = {
          start: startOfWeek(today),
          end: endOfWeek(today)
        };
        break;
      case 'month':
        interval = {
          start: startOfMonth(today),
          end: endOfMonth(today)
        };
        break;
      case 'quarter':
        interval = {
          start: startOfQuarter(today),
          end: endOfQuarter(today)
        };
        break;
      default: // day
        interval = {
          start: today,
          end: today
        };
    }

    return membershipMetrics.membershipsByType
      .filter(item => {
        const date = parseISO(item.date);
        return isWithinInterval(date, interval);
      })
      .map((item, index) => {
        const revenueData = revenueMetrics.revenueByPeriod.find(r => r.date === item.date) || {
          corporate: 0,
          single: 0,
          couple: 0
        };

        return {
          date: item.date,
          // Membership data
          corporateMembers: item.corporate || 0,
          singleMembers: item.single || 0,
          coupleMembers: item.couple || 0,
          // Revenue data
          corporateRevenue: revenueData.corporate || 0,
          singleRevenue: revenueData.single || 0,
          coupleRevenue: revenueData.couple || 0,
          // Total line
          totalRevenue: (revenueData.corporate || 0) +
                       (revenueData.single || 0) +
                       (revenueData.couple || 0),
        };
      });
  }, [membershipMetrics.membershipsByType, revenueMetrics.revenueByPeriod, timeFrame]);

  // Calculate period totals
  const periodTotals = useMemo(() => {
    return filteredData.reduce((acc, curr) => ({
      totalRevenue: acc.totalRevenue + curr.totalRevenue,
      totalMembers: acc.totalMembers + curr.corporateMembers + curr.singleMembers + curr.coupleMembers,
      corporateMembers: acc.corporateMembers + curr.corporateMembers,
      singleMembers: acc.singleMembers + curr.singleMembers,
      coupleMembers: acc.coupleMembers + curr.coupleMembers
    }), {
      totalRevenue: 0,
      totalMembers: 0,
      corporateMembers: 0,
      singleMembers: 0,
      coupleMembers: 0
    });
  }, [filteredData]);

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Gym Analytics Overview</h2>
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
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600">Period Members</p>
              <p className="text-2xl font-bold">{periodTotals.totalMembers}</p>
              <p className="text-xs text-blue-600">
                Corporate: {periodTotals.corporateMembers} | 
                Single: {periodTotals.singleMembers} | 
                Couple: {periodTotals.coupleMembers}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600">Period Revenue</p>
              <p className="text-2xl font-bold">TZS {periodTotals.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600">Monthly: TZS {revenueMetrics.monthlyRecurring.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600">Growth Rate</p>
              <p className="text-2xl font-bold">+{membershipMetrics.retentionRate}%</p>
              <p className="text-xs text-purple-600">New: {membershipMetrics.newMembersThisMonth}</p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="text-sm text-indigo-600">Sign Ups This Month</p>
              <p className="text-2xl font-bold">{membershipMetrics.newMembersThisMonth}</p>
              <p className="text-xs text-indigo-600">Monthly Growth</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-600">Current Members</p>
              <p className="text-2xl font-bold">{membershipMetrics.totalMembers}</p>
              <p className="text-xs text-yellow-600">Active Now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Stacked Graph */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}ly Membership & Revenue Analysis
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#666" />
              <YAxis yAxisId="right" orientation="right" stroke="#666" />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name.indexOf('Revenue') !== -1) {
                    return [`TZS ${value.toLocaleString()}`, name];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              
              {/* Membership Bars */}
              <Bar
                yAxisId="left"
                dataKey="corporateMembers"
                name="Corporate Members"
                stackId="members"
                fill={COLORS.corporate}
                fillOpacity={0.6}
              />
              <Bar
                yAxisId="left"
                dataKey="singleMembers"
                name="Single Members"
                stackId="members"
                fill={COLORS.single}
                fillOpacity={0.6}
              />
              <Bar
                yAxisId="left"
                dataKey="coupleMembers"
                name="Couple Members"
                stackId="members"
                fill={COLORS.couple}
                fillOpacity={0.6}
              />

              {/* Revenue Line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalRevenue"
                name="Total Revenue"
                stroke={COLORS.revenue}
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Outstanding Payments</p>
              <p className="text-2xl font-bold text-red-700">
                TZS {revenueMetrics.outstandingPayments.toLocaleString()}
              </p>
            </div>
            <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700">
              View Details
            </button>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Projected Revenue</p>
              <p className="text-2xl font-bold text-yellow-700">
                TZS {(periodTotals.totalRevenue * 1.1).toLocaleString()}
              </p>
            </div>
            <button className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700">
              View Forecast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
