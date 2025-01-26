import React, { useState, useEffect } from 'react';
import { GymClass } from '../../types/class.types';
import { format, startOfWeek, addDays } from 'date-fns';

interface ClassScheduleProps {
  onClassSelect: (classId: string) => void;
}

export const ClassSchedule: React.FC<ClassScheduleProps> = ({ onClassSelect }) => {
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = addDays(weekStart, 7);
        const data = await classService.getClasses(weekStart, weekEnd);
        setClasses(data);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [selectedDate]);

  const getClassesByDay = (date: Date) => {
    return classes.filter(c => 
      new Date(c.startTime).toDateString() === date.toDateString()
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Class Schedule</h2>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {Array.from({ length: 7 }, (_, i) => {
          const date = addDays(startOfWeek(selectedDate), i);
          const dayClasses = getClassesByDay(date);

          return (
            <div key={i} className="bg-white p-4">
              <h3 className="font-medium text-sm text-gray-900">
                {format(date, 'EEEE')}
              </h3>
              <p className="text-xs text-gray-500">
                {format(date, 'MMM d')}
              </p>
              
              <div className="mt-2 space-y-2">
                {dayClasses.map(gymClass => (
                  <button
                    key={gymClass.id}
                    onClick={() => onClassSelect(gymClass.id)}
                    className="w-full p-2 text-left text-sm rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="font-medium">{gymClass.name}</div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(gymClass.startTime), 'h:mm a')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {gymClass.currentEnrollment}/{gymClass.maxCapacity} enrolled
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
