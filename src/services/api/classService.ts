import { GymClass, ClassRegistration } from '../../types/class.types';

export const classService = {
  // Fetch all classes for a given date range
  getClasses: async (startDate: Date, endDate: Date): Promise<GymClass[]> => {
    const response = await fetch(
      `/api/classes?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
    );
    return response.json();
  },

  // Register for a class
  registerForClass: async (classId: string, userId: string, useInsurance: boolean): Promise<ClassRegistration> => {
    const response = await fetch('/api/class-registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId, userId, useInsurance }),
    });
    return response.json();
  },

  // Cancel class registration
  cancelRegistration: async (registrationId: string): Promise<void> => {
    await fetch(`/api/class-registrations/${registrationId}`, {
      method: 'DELETE',
    });
  }
};
