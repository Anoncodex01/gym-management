import { supabase } from '../supabaseClient';
import { ClassSchedule } from '../../types/class.types';

export const scheduleService = {
  // Get scheduled classes for a date range
  getScheduledClasses: async (startDate: Date, endDate: Date): Promise<ClassSchedule[]> => {
    // Format dates to match database format
    const formattedDate = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('class_schedules')
      .select(`
        *,
        template:class_template_id(
          name,
          description,
          duration,
          class_type,
          price,
          insurance_accepted,
          insurance_providers
        ),
        instructor:instructor_id(
          id,
          full_name
        )
      `)
      .eq('scheduled_date', formattedDate)
      .neq('status', 'cancelled')
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching scheduled classes:', error);
      throw error;
    }

    return data || [];
  },

  // Schedule a class
  scheduleClass: async (schedule: Omit<ClassSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<ClassSchedule> => {
    // Get template details first
    const { data: template, error: templateError } = await supabase
      .from('class_templates')
      .select(`
        *,
        instructor:instructor_id(
          id,
          full_name
        )
      `)
      .eq('id', schedule.class_template_id)
      .single();

    if (templateError) {
      console.error('Error fetching template:', templateError);
      throw templateError;
    }

    // Prepare schedule data
    const scheduleData = {
      class_template_id: schedule.class_template_id,
      scheduled_date: schedule.scheduled_date,
      start_time: schedule.start_time,
      instructor_id: template.instructor_id,
      room: schedule.room,
      capacity: template.capacity,
      current_enrollment: 0,
      status: 'scheduled'
    };

    const { data, error } = await supabase
      .from('class_schedules')
      .insert(scheduleData)
      .select(`
        *,
        template:class_template_id(
          name,
          description,
          duration,
          class_type,
          price,
          insurance_accepted,
          insurance_providers
        ),
        instructor:instructor_id(
          id,
          full_name
        )
      `)
      .single();

    if (error) {
      console.error('Error scheduling class:', error);
      throw error;
    }

    return data;
  },

  // Cancel a scheduled class
  cancelClass: async (scheduleId: string, reason: string): Promise<void> => {
    const { error } = await supabase
      .from('class_schedules')
      .update({
        status: 'cancelled',
        cancellation_reason: reason
      })
      .eq('id', scheduleId);

    if (error) {
      console.error('Error cancelling class:', error);
      throw error;
    }
  }
};