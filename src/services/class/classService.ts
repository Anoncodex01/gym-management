import { supabase } from '../supabaseClient';
import { ClassTemplate, ClassSchedule, ClassInstructor, ClassParticipant } from '../../types/class.types';

export const classService = {
  // Fetch all class templates
  getClassTemplates: async (): Promise<ClassTemplate[]> => {
    const { data, error } = await supabase
      .from('class_templates')
      .select(`
        *,
        instructor:instructor_id(
          id,
          full_name,
          email,
          phone_number,
          specialties,
          status
        ),
        availability:class_availability(
          day_of_week,
          start_time
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching class templates:', error);
      throw error;
    }

    return data || [];
  },

  // Create a new class template
  createClassTemplate: async (template: Omit<ClassTemplate, 'id'>): Promise<ClassTemplate> => {
    const { data, error } = await supabase
      .from('class_templates')
      .insert([{
        name: template.name,
        description: template.description,
        instructor_id: template.instructor_id,
        duration: template.duration,
        capacity: template.capacity,
        room: template.room,
        class_type: template.class_type,
        price: template.price,
        insurance_accepted: template.insurance_accepted,
        insurance_providers: template.insurance_providers,
        status: template.status,
        created_at: template.created_at,
        updated_at: template.updated_at
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating class template:', error);
      throw error;
    }

    return data;
  },

  // Create class availability
  createAvailability: async (availability: {
    class_template_id: string;
    day_of_week: string;
    start_time: string;
  }): Promise<void> => {
    const { error } = await supabase
      .from('class_availability')
      .insert([availability]);

    if (error) {
      console.error('Error creating class availability:', error);
      throw error;
    }
  },

  // Get scheduled classes for a specific date
  getScheduledClasses: async (date: Date): Promise<ClassSchedule[]> => {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = date.toISOString().split('T')[0];

    // First get scheduled classes for this specific date
    const { data: scheduledClasses, error: scheduleError } = await supabase
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
          full_name,
          email,
          phone_number,
          specialties,
          status
        )
      `)
      .eq('scheduled_date', dateStr)
      .eq('status', 'scheduled');

    if (scheduleError) {
      console.error('Error fetching scheduled classes:', scheduleError);
      throw scheduleError;
    }

    // Then get class templates with availability for this day
    const { data: templates, error: templateError } = await supabase
      .from('class_templates')
      .select(`
        *,
        instructor:instructor_id(
          id,
          full_name,
          email,
          phone_number,
          specialties,
          status
        ),
        availability:class_availability!inner(
          day_of_week,
          start_time
        )
      `)
      .eq('status', 'active')
      .eq('class_availability.day_of_week', dayOfWeek);

    if (templateError) {
      console.error('Error fetching class templates:', templateError);
      throw templateError;
    }

    // Transform templates into scheduled classes if they don't already exist
    const existingScheduleIds = new Set(scheduledClasses?.map(sc => sc.class_template_id));
    const additionalSchedules: ClassSchedule[] = templates
      .filter(template => !existingScheduleIds.has(template.id))
      .map(template => ({
        id: `temp_${template.id}`,
        class_template_id: template.id,
        scheduled_date: dateStr,
        start_time: template.availability[0].start_time,
        instructor_id: template.instructor_id,
        room: template.room,
        capacity: template.capacity,
        current_enrollment: 0,
        status: 'scheduled',
        template: {
          name: template.name,
          description: template.description,
          class_type: template.class_type,
          price: template.price,
          insurance_accepted: template.insurance_accepted,
          insurance_providers: template.insurance_providers,
          duration: template.duration
        },
        instructor: template.instructor
      }));

    return [...(scheduledClasses || []), ...additionalSchedules];
  },

  // Get instructors
  getInstructors: async (): Promise<ClassInstructor[]> => {
    const { data, error } = await supabase
      .from('class_instructors')
      .select('*')
      .eq('status', 'active')
      .order('full_name');

    if (error) {
      console.error('Error fetching instructors:', error);
      throw error;
    }

    return data || [];
  },

  // Get class participants
  getClassParticipants: async (scheduleId: string): Promise<ClassParticipant[]> => {
    const { data, error } = await supabase
      .from('class_enrollments')
      .select(`
        *,
        member:member_id(
          id,
          full_name,
          email,
          phone_number,
          membership_status
        )
      `)
      .eq('class_schedule_id', scheduleId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching class participants:', error);
      throw error;
    }

    // Transform class_enrollments to match ClassParticipant interface
    return (data || []).map(enrollment => ({
      id: enrollment.id,
      class_schedule_id: enrollment.class_schedule_id,
      member_id: enrollment.member_id,
      status: enrollment.status || 'registered',
      registration_date: enrollment.created_at,
      payment_status: enrollment.payment_status || 'pending',
      payment_amount: enrollment.payment_amount || 0,
      created_at: enrollment.created_at,
      updated_at: enrollment.updated_at,
      member: enrollment.member
    }));
  },

  // Add participant to class
  addParticipant: async (participant: Omit<ClassParticipant, 'id' | 'created_at' | 'updated_at'>): Promise<ClassParticipant> => {
    const { data, error } = await supabase
      .from('class_enrollments')
      .insert([{
        class_schedule_id: participant.class_schedule_id,
        member_id: participant.member_id,
        status: participant.status,
        payment_status: participant.payment_status,
        payment_amount: participant.payment_amount,
        check_in_time: null,
        check_out_time: null
      }])
      .select(`
        *,
        member:member_id(
          id,
          full_name,
          email,
          phone_number,
          membership_status
        )
      `)
      .single();

    if (error) {
      console.error('Error adding class participant:', error);
      throw error;
    }

    // Update current enrollment count
    await supabase
      .from('class_schedules')
      .update({ 
        current_enrollment: supabase.raw('current_enrollment + 1')
      })
      .eq('id', participant.class_schedule_id);

    // Transform enrollment to participant
    return {
      id: data.id,
      class_schedule_id: data.class_schedule_id,
      member_id: data.member_id,
      status: data.status || 'registered',
      registration_date: data.created_at,
      payment_status: data.payment_status || 'pending',
      payment_amount: data.payment_amount || 0,
      created_at: data.created_at,
      updated_at: data.updated_at,
      member: data.member
    };
  },

  // Update participant status
  updateParticipantStatus: async (
    participantId: string, 
    status: ClassParticipant['status'],
    paymentStatus?: ClassParticipant['payment_status']
  ): Promise<void> => {
    const updates: any = { status };
    if (paymentStatus) {
      updates.payment_status = paymentStatus;
    }

    const { error } = await supabase
      .from('class_enrollments')
      .update(updates)
      .eq('id', participantId);

    if (error) {
      console.error('Error updating participant status:', error);
      throw error;
    }
  },

  // Remove participant from class
  removeParticipant: async (participantId: string, scheduleId: string): Promise<void> => {
    const { error } = await supabase
      .from('class_enrollments')
      .delete()
      .eq('id', participantId);

    if (error) {
      console.error('Error removing class participant:', error);
      throw error;
    }

    // Update current enrollment count
    await supabase
      .from('class_schedules')
      .update({ 
        current_enrollment: supabase.raw('current_enrollment - 1')
      })
      .eq('id', scheduleId);
  }
};