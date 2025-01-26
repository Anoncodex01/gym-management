// Mock data for analytics
export const mockAnalyticsData = {
  membership: {
    totalMembers: 1250,
    activeMembers: 980,
    newMembersThisMonth: 68,
    retentionRate: 92,
    membershipsByType: [
      { type: 'Basic', count: 450 },
      { type: 'Premium', count: 350 },
      { type: 'Corporate', count: 180 },
    ]
  },

  attendance: {
    dailyAverage: 325,
    peakHours: [
      { hour: '6AM', count: 45 },
      { hour: '8AM', count: 85 },
      { hour: '10AM', count: 65 },
      { hour: '12PM', count: 75 },
      { hour: '2PM', count: 55 },
      { hour: '4PM', count: 95 },
      { hour: '6PM', count: 120 },
      { hour: '8PM', count: 70 }
    ],
    classAttendance: [
      { className: 'Yoga', attendance: 45 },
      { className: 'HIIT', attendance: 38 },
      { className: 'Spin', attendance: 42 },
      { className: 'Pilates', attendance: 35 },
      { className: 'Zumba', attendance: 40 }
    ],
    monthlyTrend: [
      { month: 'Jan', visits: 8500 },
      { month: 'Feb', visits: 9200 },
      { month: 'Mar', visits: 9800 },
      { month: 'Apr', visits: 9600 },
      { month: 'May', visits: 10200 }
    ]
  },

  revenue: {
    totalRevenue: 125000,
    monthlyRecurring: 95000,
    outstandingPayments: 12500,
    revenueByType: [
      { type: 'Memberships', amount: 75000 },
      { type: 'Classes', amount: 25000 },
      { type: 'Personal Training', amount: 15000 },
      { type: 'Passes', amount: 10000 }
    ],
    paymentsByMethod: [
      { method: 'M-Pesa', amount: 450000 },
      { method: 'Airtel Money', amount: 350000 },
      { method: 'Mix by Yas', amount: 250000 },
      { method: 'Card', amount: 150000 }
    ],
    recentTransactions: [
      { date: '2024-03-01', amount: 125000, method: 'M-Pesa' },
      { date: '2024-03-02', amount: 95000, method: 'Airtel Money' },
      { date: '2024-03-03', amount: 150000, method: 'M-Pesa' },
      { date: '2024-03-04', amount: 85000, method: 'Mix by Yas' },
      { date: '2024-03-05', amount: 110000, method: 'Card' }
    ]
  },

  passUsage: {
    activeDayPasses: 45,
    activeTenDayPasses: 120,
    usageByDay: [
      { date: '2024-03-01', dayPasses: 12, tenDayPasses: 25 },
      { date: '2024-03-02', dayPasses: 15, tenDayPasses: 28 },
      { date: '2024-03-03', dayPasses: 10, tenDayPasses: 22 },
      { date: '2024-03-04', dayPasses: 18, tenDayPasses: 30 },
      { date: '2024-03-05', dayPasses: 14, tenDayPasses: 26 }
    ],
    totalRevenue: 25000,
    averageUsageRate: 85
  }
};