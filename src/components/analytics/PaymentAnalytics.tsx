import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { CreditCard, DollarSign, AlertCircle } from 'lucide-react';

interface PaymentAnalyticsProps {
  metrics: {
    totalRevenue: number;
    monthlyRecurring: number;
    outstandingPayments: number;
    paymentsByMethod: {
      method: string;
      amount: number;
    }[];
    recentTransactions: {
      date: string;
      amount: number;
      method: string;
    }[];
  };
}

export const PaymentAnalytics: React.FC<PaymentAnalyticsProps> = ({ metrics }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Payment Analytics</h2>
        <div className="text-sm text-gray-500">
          <span className="font-medium text-green-600">+15%</span> from last month
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600">Total Revenue</p>
              <p className="text-2xl font-bold">
                TZS {metrics.totalRevenue.toLocaleString()}
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
                TZS {metrics.monthlyRecurring.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-red-600">Outstanding</p>
              <p className="text-2xl font-bold">
                TZS {metrics.outstandingPayments.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Payment Methods Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.paymentsByMethod}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="method" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" name="Amount (TZS)" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Recent Transactions</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.recentTransactions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="amount" 
                name="Amount (TZS)"
                stroke="#10B981"
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