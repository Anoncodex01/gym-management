export interface Holiday {
  id: string;
  name: string;
  date: Date;
  isRecurringYearly: boolean;
  affectedServices: {
    gymOpen: boolean;
    modifiedHours?: {
      openTime: string;
      closeTime: string;
    };
    classesCancelled: boolean;
    specialClasses?: string[];
  };
  notificationStatus: {
    emailSent: boolean;
    smsSent: boolean;
    notificationDate?: Date;
  };
}

export interface HolidayScheduleChange {
  id: string;
  holidayId: string;
  type: 'class_cancellation' | 'hour_modification' | 'closure';
  originalSchedule?: any;
  modifiedSchedule?: any;
  affectedMembers: string[];
  notificationsSent: boolean;
}