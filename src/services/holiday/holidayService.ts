import { Holiday, HolidayScheduleChange } from '../../types/holiday.types';
import { format } from 'date-fns';

export const holidayService = {
  // Create or update a holiday
  upsertHoliday: async (holiday: Partial<Holiday>): Promise<Holiday> => {
    const formattedHoliday = {
      ...holiday,
      date: format(new Date(holiday.date!), 'yyyy-MM-dd'),
      notificationStatus: {
        emailSent: false,
        smsSent: false,
      },
    };

    const response = await fetch('/api/holidays', {
      method: holiday.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedHoliday),
    });
    return response.json();
  },

  // Get all holidays for a given date range
  getHolidays: async (startDate: Date, endDate: Date): Promise<Holiday[]> => {
    // Mock data for development - replace with actual API call
    return Promise.resolve([
      {
        id: '1',
        name: 'Christmas Day',
        date: new Date('2024-12-25'),
        isRecurringYearly: true,
        affectedServices: {
          gymOpen: false,
          classesCancelled: true,
        },
        notificationStatus: {
          emailSent: false,
          smsSent: false,
        }
      },
      {
        id: '2',
        name: 'New Year\'s Day',
        date: new Date('2025-01-01'),
        isRecurringYearly: true,
        affectedServices: {
          gymOpen: true,
          modifiedHours: {
            openTime: '10:00',
            closeTime: '18:00',
          },
          classesCancelled: false,
        },
        notificationStatus: {
          emailSent: false,
          smsSent: false,
        }
      }
    ]);

    const response = await fetch(
      `/api/holidays?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
    );
    return response.json();
  },

  // Schedule notifications for a holiday
  scheduleNotifications: async (holidayId: string): Promise<void> => {
    // Schedule notifications for 1 week and 1 day before
    await fetch(`/api/holidays/${holidayId}/schedule-notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationTimes: [
          { days: 7, type: 'email' },
          { days: 1, type: 'both' }
        ]
      })
    });
  },

  // Get schedule changes for a holiday
  getScheduleChanges: async (holidayId: string): Promise<HolidayScheduleChange[]> => {
    const response = await fetch(`/api/holidays/${holidayId}/schedule-changes`);
    return response.json();
  }
};