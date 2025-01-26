import React, { useState, useEffect } from 'react';
import { MembershipOverview } from './MembershipOverview';
import { AttendanceAnalytics } from './AttendanceAnalytics';
import { RevenueReporting } from './RevenueReporting';
import { PaymentAnalytics } from './PaymentAnalytics';
import { PassUsageAnalytics } from './PassUsageAnalytics';
import { analyticsService } from '../../services/analytics/analyticsService';

export const AnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<{
    membership: MembershipMetrics;
    attendance: AttendanceMetrics;
    revenue: RevenueMetrics;
    passUsage: PassUsageMetrics;
  } | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const [membership, attendance, revenue, passUsage] = await Promise.all([
          analyticsService.getMembershipMetrics(dateRange.start, dateRange.end),
          analyticsService.getAttendanceMetrics(dateRange.start, dateRange.end),
          analyticsService.getRevenueMetrics(dateRange.start, dateRange.end),
          analyticsService.getPassUsageMetrics(dateRange.start, dateRange.end),
        ]);

        setMetrics({ membership, attendance, revenue, passUsage });
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [dateRange]);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (!metrics) {
    return <div>Failed to load analytics</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        
        <div className="flex space-x-4">
          <input
            type="date"
            value={dateRange.start.toISOString().split('T')[0]}
            onChange={(e) => setDateRange(prev => ({
              ...prev,
              start: new Date(e.target.value),
            }))}
            className="rounded-md border-gray-300 shadow-sm"
          />
          <input
            type="date"
            value={dateRange.end.toISOString().split('T')[0]}
            onChange={(e) => setDateRange(prev => ({
              ...prev,
              end: new Date(e.target.value),
            }))}
            className="rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MembershipOverview metrics={metrics.membership} />
        <AttendanceAnalytics metrics={metrics.attendance} />
        <PaymentAnalytics metrics={metrics.revenue} />
        <RevenueReporting metrics={metrics.revenue} />
        <PassUsageAnalytics metrics={metrics.passUsage} />
      </div>
    </div>
  );
};