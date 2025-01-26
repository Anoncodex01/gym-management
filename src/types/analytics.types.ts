export interface MembershipMetrics {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  membershipsByType: {
    type: string;
    count: number;
  }[];
  retentionRate: number;
}

export interface AttendanceMetrics {
  dailyAverage: number;
  peakHours: {
    hour: number;
    count: number;
  }[];
  classAttendance: {
    className: string;
    attendance: number;
  }[];
  monthlyTrend: {
    month: string;
    visits: number;
  }[];
}

export interface RevenueMetrics {
  totalRevenue: number;
  revenueByType: {
    type: string;
    amount: number;
  }[];
  monthlyRecurring: number;
  outstandingPayments: number;
}

export interface PassUsageMetrics {
  activeDayPasses: number;
  activeTenDayPasses: number;
  usageByDay: {
    date: string;
    dayPasses: number;
    tenDayPasses: number;
  }[];
  totalRevenue: number;
  averageUsageRate: number;
}
