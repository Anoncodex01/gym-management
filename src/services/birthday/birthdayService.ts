import { BirthdayMessage, BirthdayTemplate } from '../../types/birthday.types';
import { format, addDays } from 'date-fns';

export const birthdayService = {
  createTemplate: async (template: BirthdayTemplate): Promise<BirthdayTemplate> => {
    const response = await fetch('/api/birthday-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    return response.json();
  },

  scheduleUpcomingBirthdays: async (templateId: string): Promise<void> => {
    const response = await fetch('/api/birthday-messages/schedule-upcoming', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        templateId,
        daysRange: 30 // Schedule for members with birthdays in the next 30 days
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to schedule upcoming birthday messages');
    }
  },

  scheduleMessage: async (userId: string, birthDate: Date): Promise<BirthdayMessage> => {
    const response = await fetch('/api/birthday-messages/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        birthDate,
        scheduledDate: addDays(birthDate, -1), // Schedule for day before birthday
        messageType: 'email',
      }),
    });
    return response.json();
  },

  getScheduledMessages: async (userId: string): Promise<BirthdayMessage[]> => {
    const response = await fetch(`/api/birthday-messages/user/${userId}`);
    return response.json();
  },

  generateSpecialOffer: async (userId: string): Promise<string> => {
    const response = await fetch('/api/birthday-messages/generate-offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await response.json();
    return data.offerCode;
  }
};