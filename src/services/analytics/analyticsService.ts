import { MembershipMetrics, AttendanceMetrics, RevenueMetrics, PassUsageMetrics } from '../../types/analytics.types';
import { supabase } from '../supabaseClient';
import { startOfMonth, endOfMonth, format, eachDayOfInterval, parseISO } from 'date-fns';

export const analyticsService = {
  getMembershipMetrics: async (startDate: Date, endDate: Date): Promise<MembershipMetrics> => {
    try {
      // Get total members
      const { data: totalMembersData, error: totalError } = await supabase
        .from('members')
        .select('*');

      if (totalError) throw totalError;
      const totalMembers = totalMembersData?.length || 0;

      // Get active members
      const { data: activeMembersData, error: activeError } = await supabase
        .from('members')
        .select('*')
        .eq('status', 'active');

      if (activeError) throw activeError;
      const activeMembers = activeMembersData?.length || 0;

      // Get new members this month
      const { data: newMembersData, error: newError } = await supabase
        .from('members')
        .select('*')
        .gte('registration_date', startOfMonth(new Date()).toISOString())
        .lte('registration_date', endOfMonth(new Date()).toISOString());

      if (newError) throw newError;
      const newMembersThisMonth = newMembersData?.length || 0;

      // Get daily membership data for the period
      const { data: membershipData, error: membershipError } = await supabase
        .from('members')
        .select('id, membership_type, registration_date')
        .gte('registration_date', startDate.toISOString())
        .lte('registration_date', endDate.toISOString());

      if (membershipError) throw membershipError;

      // Create daily distribution
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const membershipsByType = days.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const membersUntilDate = membershipData?.filter(m => 
          format(parseISO(m.registration_date), 'yyyy-MM-dd') <= dateStr
        ) || [];

        const corporate = membersUntilDate.filter(m => m.membership_type === 'corporate').length;
        const single = membersUntilDate.filter(m => m.membership_type === 'single').length;
        const couple = membersUntilDate.filter(m => m.membership_type === 'couple').length;

        return {
          date: dateStr,
          corporate,
          single,
          couple
        };
      });

      // Calculate retention rate (simplified)
      const retentionRate = totalMembers ? Math.round((activeMembers / totalMembers) * 100) : 0;

      return {
        totalMembers,
        activeMembers,
        newMembersThisMonth,
        membershipsByType,
        retentionRate
      };
    } catch (error) {
      console.error('Failed to fetch membership metrics:', error);
      return {
        totalMembers: 0,
        activeMembers: 0,
        newMembersThisMonth: 0,
        membershipsByType: [],
        retentionRate: 0
      };
    }
  },

  getAttendanceMetrics: async (startDate: Date, endDate: Date): Promise<AttendanceMetrics> => {
    try {
      // Get all attendance records for the period
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('member_attendance')
        .select('*')
        .gte('check_in_time', startDate.toISOString())
        .lte('check_in_time', endDate.toISOString());

      if (attendanceError) throw attendanceError;
      if (!attendanceRecords) return {
        dailyAverage: 0,
        peakHours: [],
        classAttendance: [],
        monthlyTrend: []
      };

      // Calculate daily average
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const dailyAverage = Math.round(attendanceRecords.length / totalDays);

      // Calculate peak hours
      const hourlyDistribution = attendanceRecords.reduce((acc: { [key: number]: number }, record) => {
        const hour = new Date(record.check_in_time).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {});

      const peakHours = Object.entries(hourlyDistribution)
        .map(([hour, count]) => ({
          hour: parseInt(hour),
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate class attendance
      const { data: classRecords, error: classError } = await supabase
        .from('class_attendance')
        .select('class_name')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());

      if (classError) throw classError;

      const classAttendance = (classRecords || []).reduce((acc: { [key: string]: number }, record) => {
        acc[record.class_name] = (acc[record.class_name] || 0) + 1;
        return acc;
      }, {});

      const classAttendanceArray = Object.entries(classAttendance)
        .map(([className, attendance]) => ({
          className,
          attendance
        }))
        .sort((a, b) => b.attendance - a.attendance);

      // Calculate monthly trend
      const monthlyAttendance = attendanceRecords.reduce((acc: { [key: string]: number }, record) => {
        const month = format(new Date(record.check_in_time), 'MMM yyyy');
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      const monthlyTrend = Object.entries(monthlyAttendance)
        .map(([month, attendance]) => ({
          month,
          attendance // Changed from visits to attendance
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

      return {
        dailyAverage,
        peakHours,
        classAttendance: classAttendanceArray,
        monthlyTrend
      };
    } catch (error) {
      console.error('Failed to fetch attendance metrics:', error);
      return {
        dailyAverage: 0,
        peakHours: [],
        classAttendance: [],
        monthlyTrend: []
      };
    }
  },

  getRevenueMetrics: async (startDate: Date, endDate: Date): Promise<RevenueMetrics> => {
    try {
      // Get all payments for the period
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, payment_date, membership_type')
        .gte('payment_date', startDate.toISOString())
        .lte('payment_date', endDate.toISOString());

      if (paymentsError) throw paymentsError;

      // Calculate total revenue
      const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Get monthly recurring revenue (subscriptions only)
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('amount')
        .eq('status', 'active');

      if (subscriptionsError) throw subscriptionsError;
      const monthlyRecurring = subscriptions?.reduce((sum, sub) => sum + sub.amount, 0) || 0;

      // Get outstanding payments
      const { data: outstanding, error: outstandingError } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'pending');

      if (outstandingError) throw outstandingError;
      const outstandingPayments = outstanding?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Create daily revenue distribution
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const revenueByPeriod = days.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayPayments = payments?.filter(p => 
          format(parseISO(p.payment_date), 'yyyy-MM-dd') === dateStr
        ) || [];

        return {
          date: dateStr,
          corporate: dayPayments.filter(p => p.membership_type === 'corporate')
            .reduce((sum, p) => sum + p.amount, 0),
          single: dayPayments.filter(p => p.membership_type === 'single')
            .reduce((sum, p) => sum + p.amount, 0),
          couple: dayPayments.filter(p => p.membership_type === 'couple')
            .reduce((sum, p) => sum + p.amount, 0)
        };
      });

      return {
        totalRevenue,
        monthlyRecurring,
        outstandingPayments,
        revenueByPeriod
      };
    } catch (error) {
      console.error('Failed to fetch revenue metrics:', error);
      return {
        totalRevenue: 0,
        monthlyRecurring: 0,
        outstandingPayments: 0,
        revenueByPeriod: []
      };
    }
  },

  getPassUsageMetrics: async (startDate: Date, endDate: Date): Promise<PassUsageMetrics> => {
    try {
      // Get all passes
      const { data: passes, error: passError } = await supabase
        .from('passes')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (passError) throw passError;
      if (!passes) return {
        totalPasses: 0,
        activePasses: 0,
        averageUsagePerWeek: 0,
        usageByType: []
      };

      // Calculate total and active passes
      const totalPasses = passes.length;
      const activePasses = passes.filter(pass => pass.status === 'active').length;

      // Calculate average usage per week
      const { data: usageRecords, error: usageError } = await supabase
        .from('pass_usage')
        .select('*')
        .gte('used_at', startDate.toISOString())
        .lte('used_at', endDate.toISOString());

      if (usageError) throw usageError;

      const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const averageUsagePerWeek = usageRecords ? Math.round(usageRecords.length / totalWeeks) : 0;

      // Calculate usage by type
      const usageByType = passes.reduce((acc: { [key: string]: number }, pass) => {
        acc[pass.type] = (acc[pass.type] || 0) + 1;
        return acc;
      }, {});

      const usageByTypeArray = Object.entries(usageByType)
        .map(([type, count]) => ({
          type,
          count
        }));

      return {
        totalPasses,
        activePasses,
        averageUsagePerWeek,
        usageByType: usageByTypeArray
      };
    } catch (error) {
      console.error('Failed to fetch pass usage metrics:', error);
      return {
        totalPasses: 0,
        activePasses: 0,
        averageUsagePerWeek: 0,
        usageByType: []
      };
    }
  }
};