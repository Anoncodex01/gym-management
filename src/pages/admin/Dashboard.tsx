import React from 'react';
import { CombinedAnalytics } from '../../components/analytics/CombinedAnalytics';
import { PassUsageAnalytics } from '../../components/analytics/PassUsageAnalytics';
import { analyticsService } from '../../services/analytics/analyticsService';
import { MembershipMetrics, RevenueMetrics } from '../../types/analytics.types';

interface DashboardMetrics {
  membership: MembershipMetrics;
  revenue: RevenueMetrics;
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

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = React.useState<DashboardMetrics | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const [membership, revenue] = await Promise.all([
          analyticsService.getMembershipMetrics(startDate, endDate),
          analyticsService.getRevenueMetrics(startDate, endDate),
        ]);

        // Mock pass usage data with detailed class attendance
        const passUsage = {
          activeDayPasses: 2,
          active10DayPasses: 6,
          passDistribution: [
            { name: 'Day Pass', value: 30 },
            { name: '10-Day Pass', value: 25 },
            { name: 'Monthly Pass', value: 35 },
            { name: 'Annual Pass', value: 10 }
          ],
          classAttendance: {
            daily: [
              { time: '6 AM', Yoga: 8, HIIT: 0, Spinning: 12, Pilates: 6, Boxing: 0 },
              { time: '8 AM', Yoga: 15, HIIT: 10, Spinning: 8, Pilates: 12, Boxing: 0 },
              { time: '10 AM', Yoga: 10, HIIT: 15, Spinning: 0, Pilates: 8, Boxing: 12 },
              { time: '12 PM', Yoga: 6, HIIT: 12, Spinning: 15, Pilates: 0, Boxing: 8 },
              { time: '2 PM', Yoga: 8, HIIT: 8, Spinning: 10, Pilates: 10, Boxing: 6 },
              { time: '4 PM', Yoga: 12, HIIT: 20, Spinning: 18, Pilates: 8, Boxing: 15 },
              { time: '6 PM', Yoga: 20, HIIT: 25, Spinning: 22, Pilates: 15, Boxing: 18 },
              { time: '8 PM', Yoga: 15, HIIT: 18, Spinning: 15, Pilates: 10, Boxing: 12 }
            ],
            monthly: [
              { month: 'Jan', Yoga: 280, HIIT: 320, Spinning: 250, Pilates: 180, Boxing: 220 },
              { month: 'Feb', Yoga: 300, HIIT: 340, Spinning: 270, Pilates: 200, Boxing: 240 },
              { month: 'Mar', Yoga: 320, HIIT: 360, Spinning: 290, Pilates: 220, Boxing: 260 },
              { month: 'Apr', Yoga: 340, HIIT: 380, Spinning: 310, Pilates: 240, Boxing: 280 },
              { month: 'May', Yoga: 360, HIIT: 400, Spinning: 330, Pilates: 260, Boxing: 300 },
              { month: 'Jun', Yoga: 380, HIIT: 420, Spinning: 350, Pilates: 280, Boxing: 320 }
            ],
            yearly: [
              { year: '2020', Yoga: 3200, HIIT: 3600, Spinning: 2800, Pilates: 2400, Boxing: 2600 },
              { year: '2021', Yoga: 3400, HIIT: 3800, Spinning: 3000, Pilates: 2600, Boxing: 2800 },
              { year: '2022', Yoga: 3600, HIIT: 4000, Spinning: 3200, Pilates: 2800, Boxing: 3000 },
              { year: '2023', Yoga: 3800, HIIT: 4200, Spinning: 3400, Pilates: 3000, Boxing: 3200 },
              { year: '2024', Yoga: 4000, HIIT: 4400, Spinning: 3600, Pilates: 3200, Boxing: 3400 }
            ]
          },
          monthlyTrend: [
            { month: 'Jan', attendance: 420 },
            { month: 'Feb', attendance: 380 },
            { month: 'Mar', attendance: 450 },
            { month: 'Apr', attendance: 520 },
            { month: 'May', attendance: 480 },
            { month: 'Jun', attendance: 550 }
          ]
        };

        if (!membership || !revenue) {
          throw new Error('Failed to fetch analytics data');
        }

        setMetrics({ membership, revenue, passUsage });
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-600 text-lg mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gym Analytics Dashboard</h1>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      <CombinedAnalytics
        membershipMetrics={metrics.membership}
        revenueMetrics={metrics.revenue}
      />

      <PassUsageAnalytics passUsage={metrics.passUsage} />
    </div>
  );
};