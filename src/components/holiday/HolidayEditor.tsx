import React, { useState } from 'react';
import { Holiday } from '../../types/holiday.types';
import { format } from 'date-fns';

interface HolidayEditorProps {
  holiday: Holiday;
  onSave: (holiday: Partial<Holiday>) => Promise<void>;
}

export const HolidayEditor: React.FC<HolidayEditorProps> = ({ holiday, onSave }) => {
  const [formData, setFormData] = useState<Partial<Holiday>>({
    ...holiday,
    affectedServices: {
      ...holiday.affectedServices,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Holiday Name</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={formData.date ? format(new Date(formData.date), 'yyyy-MM-dd') : ''}
          onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.isRecurringYearly || false}
          onChange={(e) => setFormData({ ...formData, isRecurringYearly: e.target.checked })}
          className="h-4 w-4 text-blue-600 rounded"
        />
        <label className="ml-2 text-sm text-gray-700">
          Recurring yearly
        </label>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Affected Services</h4>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.affectedServices?.gymOpen || false}
            onChange={(e) => setFormData({
              ...formData,
              affectedServices: {
                ...formData.affectedServices,
                gymOpen: e.target.checked,
              },
            })}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Gym Open
          </label>
        </div>

        {formData.affectedServices?.gymOpen && (
          <div className="ml-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Opening Time</label>
              <input
                type="time"
                value={formData.affectedServices?.modifiedHours?.openTime || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  affectedServices: {
                    ...formData.affectedServices,
                    modifiedHours: {
                      ...formData.affectedServices?.modifiedHours,
                      openTime: e.target.value,
                    },
                  },
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Closing Time</label>
              <input
                type="time"
                value={formData.affectedServices?.modifiedHours?.closeTime || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  affectedServices: {
                    ...formData.affectedServices,
                    modifiedHours: {
                      ...formData.affectedServices?.modifiedHours,
                      closeTime: e.target.value,
                    },
                  },
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.affectedServices?.classesCancelled || false}
            onChange={(e) => setFormData({
              ...formData,
              affectedServices: {
                ...formData.affectedServices,
                classesCancelled: e.target.checked,
              },
            })}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Cancel All Classes
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        Save Holiday Schedule
      </button>
    </form>
  );
};