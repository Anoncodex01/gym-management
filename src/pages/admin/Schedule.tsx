import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar } from '../../components/ui/calendar';
import { Card } from '../../components/ui/card';
import { Clock, Users, MapPin, Plus, Calendar as CalendarIcon, X, Shield } from 'lucide-react';
import { classService } from '../../services/class/classService';
import { scheduleService } from '../../services/class/scheduleService';
import { toast } from 'react-hot-toast';

interface NewSchedule {
  class_template_id: string;
  instructor_id: string;
  scheduled_date: string;
  start_time: string;
  room: string;
}

export const SchedulePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<ClassTemplate[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [newSchedule, setNewSchedule] = useState<NewSchedule>({
    class_template_id: '',
    instructor_id: '',
    scheduled_date: '',
    start_time: '',
    room: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [templatesData, schedulesData] = await Promise.all([
          classService.getClassTemplates(),
          scheduleService.getScheduledClasses(selectedDate, selectedDate)
        ]);
        setTemplates(templatesData);
        setSchedules(schedulesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Format the date properly
      const formattedDate = new Date(newSchedule.scheduled_date).toISOString().split('T')[0];

      const schedule = await scheduleService.scheduleClass({
        ...newSchedule,
        scheduled_date: formattedDate,
        instructor_id: '',  // This will be set from template
        capacity: 0,       // This will be set from template
      });

      toast.success('Class scheduled successfully');
      setShowAddModal(false);

      // Refresh schedules if the scheduled date matches selected date
      if (formattedDate === selectedDate.toISOString().split('T')[0]) {
        setSchedules(prev => [...prev, schedule]);
      }

      // Reset form
      setNewSchedule({
        class_template_id: '',
        instructor_id: '',
        scheduled_date: '',
        start_time: '',
        room: ''
      });
    } catch (error) {
      console.error('Error scheduling class:', error);
      toast.error('Failed to schedule class');
    }
  };

  const renderAddScheduleModal = () => {
    if (!showAddModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold">Schedule New Class</h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddSchedule} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Template *
              </label>
              <select
                required
                value={newSchedule.class_template_id}
                onChange={(e) => {
                  const template = templates.find(t => t.id === e.target.value);
                  setNewSchedule({
                    ...newSchedule,
                    class_template_id: e.target.value,
                    instructor_id: template?.instructor_id || '',
                    room: template?.room || ''
                  });
                }}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select a class</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.instructor?.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={newSchedule.scheduled_date}
                onChange={(e) => setNewSchedule({
                  ...newSchedule,
                  scheduled_date: e.target.value
                })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={newSchedule.start_time}
                onChange={(e) => setNewSchedule({
                  ...newSchedule,
                  start_time: e.target.value
                })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room *
              </label>
              <input
                type="text"
                required
                value={newSchedule.room}
                onChange={(e) => setNewSchedule({
                  ...newSchedule,
                  room: e.target.value
                })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., Studio A"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Schedule Class
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const currentDayClasses = useMemo(() => {
    return schedules.filter(schedule =>
      schedule.scheduled_date === selectedDate.toISOString().split('T')[0]
    );
  }, [schedules, selectedDate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Schedule Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add to Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </Card>

        <div className="md:col-span-2">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">
                Schedule for {format(selectedDate, 'MMMM d, yyyy')}
              </h2>
              <span className="text-sm text-gray-500">
                {format(selectedDate, 'EEEE')}
              </span>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading schedule...
                </div>
              ) : currentDayClasses.length > 0 ? (
                currentDayClasses.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{schedule.template?.name}</h3>
                        {schedule.instructor?.full_name && (
                          <p className="text-sm text-gray-600">
                            with {schedule.instructor.full_name}
                          </p>
                        )}
                        {schedule.template?.insurance_accepted && (
                          <div className="flex items-center mt-1 text-blue-600 text-sm">
                            <Shield className="w-4 h-4 mr-1" />
                            <span>Insurance Accepted</span>
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        schedule.current_enrollment >= schedule.capacity
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {schedule.current_enrollment}/{schedule.capacity}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>
                          {format(new Date(`2000-01-01T${schedule.start_time}`), 'h:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        <span>{schedule.template?.duration || 0} min</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{schedule.room}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No classes scheduled for this date
                </div>
              )}
            </div>

            {renderAddScheduleModal()}
          </Card>
        </div>
      </div>
    </div>
  );
};