export interface Attendance {
  id: string;
  memberId: string;
  type: 'gym_visit' | 'class_attendance';
  checkInTime: Date;
  checkOutTime?: Date;
  classId?: string;
  insuranceUsed: boolean;
  claimSubmitted: boolean;
  claimId?: string;
  duration?: string;
  notes?: string;
}

export interface AttendanceStats {
  totalVisits: number;
  classAttendance: number;
  gymVisits: number;
  insuranceClaims: number;
  pendingClaims: number;
  averageVisitDuration: string;
  lastVisit?: Date;
  currentlyCheckedIn: boolean;
}

export interface AttendanceSettings {
  id: string;
  openingTime: string;
  closingTime: string;
  maxDailyVisits: number;
}