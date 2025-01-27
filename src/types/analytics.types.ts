export interface MembershipMetrics {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  retentionRate: number;
  membershipsByType: Array<{
    date: string;
    corporate: number;
    single: number;
    couple: number;
  }>;
}

export interface AttendanceMetrics {
  dailyAverage: number;
  peakHours: Array<{
    hour: number;
    count: number;
  }>;
  classAttendance: Array<{
    className: string;
    attendance: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    attendance: number;
  }>;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurring: number;
  outstandingPayments: number;
  revenueByPeriod: Array<{
    date: string;
    corporate: number;
    single: number;
    couple: number;
  }>;
}

export interface PassUsageMetrics {
  totalPasses: number;
  activePasses: number;
  averageUsagePerWeek: number;
  usageByType: Array<{
    type: string;
    count: number;
  }>;
}
