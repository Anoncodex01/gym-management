import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';

interface PassUsageAnalyticsProps {
  passUsage: {
    activeDayPasses: number;
    active10DayPasses: number;
    passDistribution: Array<{
      name: string;
      value: number;
    }>;
    classAttendance: {
      daily: Array<{
        time: string;
        Yoga: number;
        HIIT: number;
        Spinning: number;
        Pilates: number;
        Boxing: number;
      }>;
      monthly: Array<{
        month: string;
        Yoga: number;
        HIIT: number;
        Spinning: number;
        Pilates: number;
        Boxing: number;
      }>;
      yearly: Array<{
        year: string;
        Yoga: number;
        HIIT: number;
        Spinning: number;
        Pilates: number;
        Boxing: number;
      }>;
    };
    monthlyTrend: Array<{
      month: string;
      attendance: number;
    }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const CLASS_COLORS = {
  Yoga: '#8884d8',
  HIIT: '#82ca9d',
  Spinning: '#ffc658',
  Pilates: '#ff7300',
  Boxing: '#0088fe'
};

type TimeRange = 'daily' | 'monthly' | 'yearly';

export const PassUsageAnalytics: React.FC<PassUsageAnalyticsProps> = ({ passUsage }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');

  const getAttendanceData = () => {
    switch (timeRange) {
      case 'daily':
        return passUsage.classAttendance.daily;
      case 'monthly':
        return passUsage.classAttendance.monthly;
      case 'yearly':
        return passUsage.classAttendance.yearly;
    }
  };

  const getXAxisKey = () => {
    switch (timeRange) {
      case 'daily':
        return 'time';
      case 'monthly':
        return 'month';
      case 'yearly':
        return 'year';
    }
  };

  return (
    <div className="space-y-6">
      {/* Pass Usage Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Day Passes</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{passUsage.activeDayPasses}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active 10-Day Passes</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{passUsage.active10DayPasses}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pass Distribution and Class Attendance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pass Usage Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={passUsage.passDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {passUsage.passDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Class Attendance</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeRange('daily')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  timeRange === 'daily'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTimeRange('monthly')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  timeRange === 'monthly'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeRange('yearly')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  timeRange === 'yearly'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getAttendanceData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getXAxisKey()} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Yoga" stackId="a" fill={CLASS_COLORS.Yoga} />
                <Bar dataKey="HIIT" stackId="a" fill={CLASS_COLORS.HIIT} />
                <Bar dataKey="Spinning" stackId="a" fill={CLASS_COLORS.Spinning} />
                <Bar dataKey="Pilates" stackId="a" fill={CLASS_COLORS.Pilates} />
                <Bar dataKey="Boxing" stackId="a" fill={CLASS_COLORS.Boxing} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Monthly Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={passUsage.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="attendance"
                stroke="#0088FE"
                strokeWidth={2}
                dot={{ fill: '#0088FE' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};