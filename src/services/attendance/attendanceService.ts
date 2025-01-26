import { Attendance, AttendanceStats } from '../../types/attendance.types';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';

export const attendanceService = {
  checkIn: async (memberId: string, type: 'gym' | 'class', classId?: string): Promise<Attendance> => {
    // Check if member is already checked in
    const { data: existingAttendance } = await supabase
      .from('member_attendance')
      .select('*')
      .eq('member_id', memberId)
      .is('check_out_time', null)
      .single();

    if (existingAttendance) {
      throw new Error('Member is already checked in');
    }

    // Check gym operating hours
    const { data: settings } = await supabase
      .from('attendance_settings')
      .select('*')
      .single();

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
    
    if (currentTime < settings.opening_time || currentTime > settings.closing_time) {
      throw new Error('Gym is currently closed');
    }

    // Create new attendance record
    const { data, error } = await supabase
      .from('member_attendance')
      .insert({
        member_id: memberId,
        attendance_type: type,
        check_in_time: now.toISOString(),
        notes: classId ? `Class ID: ${classId}` : undefined
      })
      .select()
      .single();

    if (error) {
      console.error('Check-in failed:', error);
      throw new Error('Failed to check in');
    }

    toast.success('Successfully checked in');
    return data;
  },

  checkOut: async (memberId: string): Promise<Attendance> => {
    const { data: attendance, error: findError } = await supabase
      .from('member_attendance')
      .select('*')
      .eq('member_id', memberId)
      .is('check_out_time', null)
      .single();

    if (findError || !attendance) {
      throw new Error('No active check-in found');
    }

    const { data, error } = await supabase
      .from('member_attendance')
      .update({
        check_out_time: new Date().toISOString()
      })
      .eq('id', attendance.id)
      .select()
      .single();

    if (error) {
      console.error('Check-out failed:', error);
      throw new Error('Failed to check out');
    }

    toast.success('Successfully checked out');
    return data;
  },

  getAttendanceHistory: async (memberId: string, startDate: Date, endDate: Date): Promise<Attendance[]> => {
    const { data, error } = await supabase
      .from('member_attendance')
      .select('*')
      .eq('member_id', memberId)
      .gte('check_in_time', startDate.toISOString())
      .lte('check_in_time', endDate.toISOString())
      .order('check_in_time', { ascending: false });

    if (error) {
      console.error('Failed to fetch attendance history:', error);
      throw new Error('Failed to fetch attendance history');
    }

    return data;
  },

  getStats: async (memberId: string): Promise<AttendanceStats> => {
    // Get all attendance records
    const { data: allAttendance, error: attendanceError } = await supabase
      .from('member_attendance')
      .select('*')
      .eq('member_id', memberId);

    if (attendanceError) {
      console.error('Failed to fetch attendance stats:', attendanceError);
      throw new Error('Failed to fetch attendance stats');
    }

    // Get current check-in status
    const { data: currentAttendance, error: currentError } = await supabase
      .from('member_attendance')
      .select('*')
      .eq('member_id', memberId)
      .is('check_out_time', null)
      .maybeSingle();

    if (currentError) {
      console.error('Failed to fetch current attendance:', currentError);
      throw new Error('Failed to fetch current attendance');
    }

    const stats: AttendanceStats = {
      totalVisits: allAttendance.length,
      gymVisits: allAttendance.filter(a => a.attendance_type === 'gym').length,
      classAttendance: allAttendance.filter(a => a.attendance_type === 'class').length,
      insuranceClaims: 0,
      pendingClaims: 0,
      averageVisitDuration: '0 minutes',
      currentlyCheckedIn: !!currentAttendance,
      lastVisit: currentAttendance ? new Date(currentAttendance.check_in_time) : undefined
    };

    // Calculate average duration
    const completedVisits = allAttendance.filter(a => a.check_out_time);
    if (completedVisits.length > 0) {
      const totalMinutes = completedVisits.reduce((sum, a) => {
        const duration = new Date(a.check_out_time).getTime() - new Date(a.check_in_time).getTime();
        return sum + (duration / 60000); // Convert to minutes
      }, 0) / completedVisits.length;
      
      stats.averageVisitDuration = `${Math.round(totalMinutes)} minutes`;
    }

    return stats;
  },

  getDailyAttendance: async (date: Date): Promise<{ data: any[] }> => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('member_attendance')
      .select('*')
      .gte('check_in_time', startOfDay.toISOString())
      .lte('check_in_time', endOfDay.toISOString())
      .order('check_in_time', { ascending: false });

    if (error) {
      console.error('Failed to fetch daily attendance:', error);
      throw new Error('Failed to fetch daily attendance');
    }

    return { data: data || [] };
  }
};