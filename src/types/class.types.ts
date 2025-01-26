export interface ClassInstructor {
  id: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  specialties: string[];
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ClassTemplate {
  id: string;
  name: string;
  description: string | null;
  instructor_id: string;
  instructor?: ClassInstructor;
  duration: number;
  capacity: number;
  room: string;
  class_type: 'yoga' | 'hiit' | 'strength' | 'cardio' | 'pilates' | 'zumba';
  price: number;
  insurance_accepted: boolean;
  insurance_providers: string[];
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  availability?: ClassAvailability[];
}

export interface ClassAvailability {
  id: string;
  class_template_id: string;
  day_of_week: string;
  start_time: string;
  created_at: string;
}

export interface ClassSchedule {
  id: string;
  class_template_id: string;
  template?: ClassTemplate;
  scheduled_date: string;
  start_time: string;
  instructor_id: string;
  instructor?: ClassInstructor;
  room: string;
  capacity: number;
  current_enrollment: number;
  status: 'scheduled' | 'cancelled' | 'completed';
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
  participants?: ClassParticipant[];
}

export interface ClassEnrollment {
  id: string;
  class_schedule_id: string;
  member_id: string;
  status: 'enrolled' | 'cancelled' | 'attended' | 'no_show';
  insurance_used: boolean;
  check_in_time: string | null;
  check_out_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassParticipant {
  id: string;
  class_schedule_id: string;
  member_id: string;
  status: 'registered' | 'attended' | 'cancelled' | 'no_show';
  registration_date: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_amount: number;
  created_at: string;
  updated_at: string;
  member?: {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    membership_status: string;
  };
}