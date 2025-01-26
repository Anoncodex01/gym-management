import { MembershipMetrics, AttendanceMetrics, RevenueMetrics, PassUsageMetrics } from '../../types/analytics.types';
import { supabase } from '../supabaseClient';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export const analyticsService = {
  getMembershipMetrics: async (startDate: Date, endDate: Date): Promise<MembershipMetrics> => {
    try {
      // Get total members
      const { data: totalMembersData, error: totalError } = await supabase
        .from('members')
        .select('*');

      if (totalError) throw totalError;
      const totalMembers = totalMembersData.length;

      // Get active members
      const { data: activeMembersData, error: activeError } = await supabase
        .from('members')
        .select('*')
        .eq('status', 'active');

      if (activeError) throw activeError;
      const activeMembers = activeMembersData.length;

      // Get new members this month
      const { data: newMembersData, error: newError } = await supabase
        .from('members')
        .select('*')
        .gte('registration_date', startOfMonth(new Date()).toISOString())
        .lte('registration_date', endOfMonth(new Date()).toISOString());

      if (newError) throw newError;
      const newMembersThisMonth = newMembersData.length;

      // Get membership distribution
      const { data: membershipsByType, error: membershipError } = await supabase
        .from('members')
        .select('membership_type')
        .eq('status', 'active');

      if (membershipError) throw membershipError;
      if (!membershipsByType) return {
        totalMembers: 0,
        activeMembers: 0,
        newMembersThisMonth: 0,
        membershipsByType: [],
        retentionRate: 0
      };

      const membershipDistribution = membershipsByType?.reduce((acc: any[], member) => {
        const existingType = acc.find(m => m.type === member.membership_type);
        if (existingType) {
          existingType.count++;
        } else {
          acc.push({ type: member.membership_type, count: 1 });
        }
        return acc;
      }, []) || [];

      // Calculate retention rate (simplified)
      const retentionRate = totalMembers ? Math.round((activeMembers / totalMembers) * 100) : 0;

      return {
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        newMembersThisMonth: newMembersThisMonth || 0,
        membershipsByType: membershipDistribution || [],
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
      const peakHours = Array.from({ length: 24 }, (_, hour) => ({
        hour,  
        count: attendanceRecords.filter(record => 
          new Date(record.check_in_time).getHours() === hour
        ).length
      }));

      // Calculate class attendance
      const { data: classAttendance } = await supabase
        .from('member_attendance')
        .select('*')
        .eq('attendance_type', 'class')
        .gte('check_in_time', startDate.toISOString())
        .lte('check_in_time', endDate.toISOString());

      const classStats = classAttendance?.reduce((acc: any[], record) => {
        const className = record.notes?.replace('Class ID: ', '') || 'Unknown';
        const existingClass = acc.find(c => c.className === className);
        if (existingClass) {
          existingClass.attendance++;
        } else {
          acc.push({ className, attendance: 1 });
        }
        return acc;
      }, []) || [];

      // Calculate monthly trend
      const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        return {
          month: format(month, 'MMM'),
          visits: attendanceRecords.filter(record =>
            new Date(record.check_in_time) >= monthStart &&
            new Date(record.check_in_time) <= monthEnd
          ).length
        };
      }).reverse();

      return {
        dailyAverage,
        peakHours,
        classAttendance: classStats,
        monthlyTrend
      };
    } catch (error) {
      console.error('Failed to fetch attendance metrics:', error);
      throw error;
    }
  },

  getRevenueMetrics: async (startDate: Date, endDate: Date): Promise<RevenueMetrics> => {
    try {
      // Get all active subscriptions
      const { data: activeSubscriptions, error: subError } = await supabase
        .from('members')
        .select(`
          subscription,
          status
        `)
        .eq('status', 'active');

      if (subError) throw subError;
      if (!activeSubscriptions) return {
        totalRevenue: 0,
        monthlyRecurring: 0,
        outstandingPayments: 0,
        revenueByType: []
      };

      // Calculate total revenue and monthly recurring
      let totalRevenue = 0;
      let monthlyRecurring = 0;

      if (activeSubscriptions) {
        activeSubscriptions.forEach(member => {
          if (member.subscription && typeof member.subscription === 'object') {
            const amount = member.subscription.amount || 0;
            totalRevenue += amount;
            if (member.subscription.type === 'monthly') {
              monthlyRecurring += amount;
            }
          }
        });
      }

      // Get revenue by type
      const revenueByType = [
        { type: 'Memberships', amount: totalRevenue * 0.8 }, // 80% from memberships
        { type: 'Classes', amount: totalRevenue * 0.1 },     // 10% from classes
        { type: 'Passes', amount: totalRevenue * 0.1 }       // 10% from passes
      ];

      // Calculate outstanding payments
      const { data: expiredSubscriptions, error: expiredError } = await supabase
        .from('members')
        .select(`
          subscription
        `)
        .eq('status', 'active')
        .not('subscription', 'is', null);

      if (expiredError) {
        throw expiredError;
      }

      const outstandingPayments = expiredSubscriptions?.reduce((total, member) =>
        total + (member.subscription?.amount || 0), 0) || 0;

      return {
        totalRevenue,
        monthlyRecurring,
        outstandingPayments,
        revenueByType
      };
    } catch (error) {
      console.error('Failed to fetch revenue metrics:', error);
      throw error;
    }
  },

  getPassUsageMetrics: async (startDate: Date, endDate: Date): Promise<PassUsageMetrics> => {
    try {
      // Get all attendance records for passes
      const { data: passAttendance, error: passError } = await supabase
        .from('member_attendance')
        .select('*')
        .eq('attendance_type', 'gym')
        .gte('check_in_time', startDate.toISOString())
        .lte('check_in_time', endDate.toISOString());

      if (passError) throw passError;
      if (!passAttendance) return {
        activeDayPasses: 0,
        activeTenDayPasses: 0,
        usageByDay: [],
        totalRevenue: 0,
        averageUsageRate: 0
      };
      // Calculate active passes (simplified)
      const activeDayPasses = Math.round((passAttendance?.length || 0) * 0.3); // 30% day passes
      const activeTenDayPasses = Math.round((passAttendance?.length || 0) * 0.7); // 70% 10-day passes

      // Calculate usage by day
      const usageByDay = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayPasses = Math.round((passAttendance?.filter(record =>
          new Date(record.check_in_time).toDateString() === date.toDateString()
        ).length || 0) * 0.3);
        const tenDayPasses = Math.round((passAttendance?.filter(record =>
          new Date(record.check_in_time).toDateString() === date.toDateString()
        ).length || 0) * 0.7);

        return {
          date: format(date, 'MMM d'),
          dayPasses,
          tenDayPasses
        };
      }).reverse();

      return {
        activeDayPasses,
        activeTenDayPasses,
        usageByDay,
        totalRevenue: (activeDayPasses + activeTenDayPasses) * 100, // Assuming $100 per pass
        averageUsageRate: 85 // Default value
      };
    } catch (error) {
      console.error('Failed to fetch pass usage metrics:', error);
      throw error;
    }
  }
};