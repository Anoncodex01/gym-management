import React, { useState, useEffect } from 'react';
import { Holiday } from '../../types/holiday.types';
import { format } from 'date-fns';
import { holidayService } from '../../services/holiday/holidayService';
import { HolidayEditor } from './HolidayEditor';
import toast from 'react-hot-toast';

export const HolidayManager: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        
        const data = await holidayService.getHolidays(startDate, endDate);
        setHolidays(data);
      } catch (error) {
        console.error('Failed to fetch holidays:', error);
        toast.error('Failed to load holidays');
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  const handleHolidayUpdate = async (holiday: Partial<Holiday>) => {
    try {
      const updatedHoliday = await holidayService.upsertHoliday(holiday);
      toast.success('Holiday updated successfully');
      setHolidays(prev => 
        prev.map(h => h.id === updatedHoliday.id ? updatedHoliday : h)
      );
    } catch (error) {
      console.error('Failed to update holiday:', error);
      toast.error('Failed to update holiday');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Holiday Schedule Management</h2>
        <button
          onClick={() => setSelectedHoliday({} as Holiday)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Holiday
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {holidays.map(holiday => (
            <li key={holiday.id} className="px-4 py-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{holiday.name}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(holiday.date), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div className="flex space-x-4">
                  {!holiday.affectedServices.gymOpen && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Closed
                    </span>
                  )}
                  {holiday.affectedServices.modifiedHours && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Modified Hours
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {selectedHoliday && <HolidayEditor holiday={selectedHoliday} onSave={handleHolidayUpdate} />}
    </div>
  );
};