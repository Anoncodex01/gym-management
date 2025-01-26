import React, { useState, useEffect } from 'react';
import { Calendar } from '../../components/ui/calendar';
import { Card } from '../../components/ui/card';
import { Plus, Users, Clock, MapPin, Shield, CreditCard, X } from 'lucide-react';
import { classService } from '../../services/class/classService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ClassTemplate, ClassSchedule, ClassInstructor, ClassParticipant } from '../../types/class.types';
import { AddParticipantModal } from '../../components/class/AddParticipantModal';

type ClassType = 'yoga' | 'hiit' | 'strength' | 'cardio' | 'pilates' | 'zumba';

interface NewClass {
  name: string;
  instructor_id: string;
  startTime: string;
  availability: string[];
  duration: string;
  capacity: number;
  room: string;
  type: ClassType;
  price: number;
  insuranceAccepted: boolean;
  insuranceProviders: string[];
}

interface ClassDetails {
  id: number;
  name: string;
  instructor: string;
  time: string;
  duration: string;
  capacity: number;
  enrolled: number;
  room: string;
  type: ClassType;
  insuranceAccepted: boolean;
  insuranceProviders: string[];
  price: number;
  availability: string[];
  participants?: ClassParticipant[];
}

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const classTypes: Array<{ value: ClassType; label: string }> = [
  { value: 'yoga', label: 'Yoga' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'strength', label: 'Strength Training' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'pilates', label: 'Pilates' },
  { value: 'zumba', label: 'Zumba' }
];

const insuranceProvidersList = [
  { id: 'strategies', name: 'Strategies' },
  { id: 'assemble', name: 'Assemble' },
  { id: 'jubilee', name: 'Jubilee' }
];

export const ClassesPage: React.FC = () => {
  const [templates, setTemplates] = useState<ClassTemplate[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState<ClassInstructor[]>([]);
  const [newClass, setNewClass] = useState<NewClass>({
    name: '',
    instructor_id: '',
    startTime: '',
    availability: [],
    duration: '60',
    capacity: 20,
    room: '',
    type: 'yoga',
    price: 0,
    insuranceAccepted: false,
    insuranceProviders: []
  });

  const [selectedParticipants, setSelectedParticipants] = useState<ClassParticipant[]>([]);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [templatesData, schedulesData, instructorsData] = await Promise.all([
          classService.getClassTemplates(),
          classService.getScheduledClasses(selectedDate),
          classService.getInstructors()
        ]);
        setTemplates(templatesData);
        setSchedules(schedulesData || []);
        setInstructors(instructorsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newClass.availability.length === 0) {
        toast.error('Please select at least one day of availability');
        return;
      }

      const now = new Date().toISOString();
      
      // Create class template
      const template = await classService.createClassTemplate({
        name: newClass.name,
        description: `${newClass.name} class`,
        instructor_id: newClass.instructor_id,
        duration: parseInt(newClass.duration),
        capacity: newClass.capacity,
        room: newClass.room,
        class_type: newClass.type,
        price: newClass.price,
        insurance_accepted: newClass.insuranceAccepted,
        insurance_providers: newClass.insuranceProviders,
        status: 'active',
        created_at: now,
        updated_at: now
      });

      // Create availability entries
      for (const day of newClass.availability) {
        await classService.createAvailability({
          class_template_id: template.id,
          day_of_week: day,
          start_time: newClass.startTime
        });
      }

      toast.success('Class created successfully');
      setShowAddClassModal(false);
      
      // Refresh data
      try {
        setLoading(true);
        const [templatesData, schedulesData] = await Promise.all([
          classService.getClassTemplates(),
          classService.getScheduledClasses(selectedDate)
        ]);
        setTemplates(templatesData);
        setSchedules(schedulesData || []); // Ensure we set an empty array if no schedules
      } catch (error) {
        console.error('Error refreshing data:', error);
        toast.error('Failed to refresh class list');
      } finally {
        setLoading(false);
      }

      // Reset form
      setNewClass({
        name: '',
        instructor_id: '',
        startTime: '',
        availability: [],
        duration: '60',
        capacity: 20,
        room: '',
        type: 'yoga',
        price: 0,
        insuranceAccepted: false,
        insuranceProviders: []
      });
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('Failed to create class');
    }
  };

  const renderAddClassModal = () => {
    if (!showAddClassModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold">Add New Class</h3>
            <button
              onClick={() => setShowAddClassModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddClass} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  required
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Morning Yoga"
                />
              </div>

              <div>
                <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor *
                </label>
                <select
                  id="instructor"
                  required
                  value={newClass.instructor_id}
                  onChange={(e) => setNewClass({ ...newClass, instructor_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select an instructor</option>
                  {instructors.map(instructor => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={newClass.startTime}
                  onChange={(e) => setNewClass({ ...newClass, startTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) *
                </label>
                <select
                  required
                  value={newClass.duration}
                  onChange={(e) => setNewClass({ ...newClass, duration: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Type *
                </label>
                <select
                  required
                  value={newClass.type}
                  onChange={(e) => setNewClass({ ...newClass, type: e.target.value as ClassType })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {classTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room *
                </label>
                <input
                  type="text"
                  required
                  value={newClass.room}
                  onChange={(e) => setNewClass({ ...newClass, room: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Studio A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newClass.capacity}
                  onChange={(e) => setNewClass({ ...newClass, capacity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Days *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {daysOfWeek.map((day) => (
                    <label key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newClass.availability.includes(day)}
                        onChange={(e) => {
                          const updatedDays = e.target.checked
                            ? [...newClass.availability, day]
                            : newClass.availability.filter(d => d !== day);
                          setNewClass({ ...newClass, availability: updatedDays });
                        }}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per Session (TZS) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm">TZS</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={newClass.price.toString()}
                    onChange={(e) => setNewClass({ ...newClass, price: parseFloat(e.target.value) })}
                    className="w-full pl-16 pr-3 py-2 border rounded-md"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="insuranceAccepted"
                  checked={newClass.insuranceAccepted}
                  onChange={(e) => setNewClass({
                    ...newClass,
                    insuranceAccepted: e.target.checked,
                    insuranceProviders: e.target.checked ? newClass.insuranceProviders : []
                  })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="insuranceAccepted" className="ml-2 text-sm text-gray-700">
                  Accept Insurance
                </label>
              </div>

              {newClass.insuranceAccepted && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Insurance Providers *
                  </label>
                  <div className="space-y-2">
                    {insuranceProvidersList.map(provider => (
                      <div key={provider.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`provider-${provider.id}`}
                          checked={newClass.insuranceProviders.includes(provider.name)}
                          onChange={(e) => {
                            const updatedProviders = e.target.checked
                              ? [...newClass.insuranceProviders, provider.name]
                              : newClass.insuranceProviders.filter(p => p !== provider.name);
                            setNewClass({ ...newClass, insuranceProviders: updatedProviders });
                          }}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label
                          htmlFor={`provider-${provider.id}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {provider.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => setShowAddClassModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Class
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const handleClassClick = (classItem: ClassDetails) => {
    setSelectedClass(classItem);
  };

  const loadParticipants = async (scheduleId: string) => {
    try {
      const participants = await classService.getClassParticipants(scheduleId);
      setSelectedParticipants(participants);
    } catch (error) {
      console.error('Error loading participants:', error);
      toast.error('Failed to load class participants');
    }
  };

  const handleAddParticipant = async (memberId: string, paymentAmount: number) => {
    try {
      await classService.addParticipant({
        class_schedule_id: selectedScheduleId,
        member_id: memberId,
        status: 'registered',
        registration_date: new Date().toISOString(),
        payment_status: 'pending',
        payment_amount: paymentAmount
      });
      
      toast.success('Participant added successfully');
      loadParticipants(selectedScheduleId);
      setShowAddParticipantModal(false);
    } catch (error) {
      console.error('Error adding participant:', error);
      toast.error('Failed to add participant');
    }
  };

  const handleUpdateParticipantStatus = async (
    participantId: string,
    status: ClassParticipant['status'],
    paymentStatus?: ClassParticipant['payment_status']
  ) => {
    try {
      await classService.updateParticipantStatus(participantId, status, paymentStatus);
      toast.success('Participant status updated');
      loadParticipants(selectedScheduleId);
    } catch (error) {
      console.error('Error updating participant status:', error);
      toast.error('Failed to update participant status');
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!window.confirm('Are you sure you want to remove this participant?')) {
      return;
    }

    try {
      await classService.removeParticipant(participantId, selectedScheduleId);
      toast.success('Participant removed successfully');
      loadParticipants(selectedScheduleId);
    } catch (error) {
      console.error('Error removing participant:', error);
      toast.error('Failed to remove participant');
    }
  };

  const renderParticipantsList = () => (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Class Participants</h3>
        <button
          onClick={() => setShowAddParticipantModal(true)}
          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Participant
        </button>
      </div>

      <div className="space-y-2">
        {selectedParticipants.map((participant) => (
          <div
            key={participant.id}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="font-medium">{participant.member?.full_name}</p>
              <p className="text-sm text-gray-600">{participant.member?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={participant.status}
                onChange={(e) => handleUpdateParticipantStatus(participant.id, e.target.value as ClassParticipant['status'])}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="registered">Registered</option>
                <option value="attended">Attended</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
              <select
                value={participant.payment_status}
                onChange={(e) => handleUpdateParticipantStatus(participant.id, participant.status, e.target.value as ClassParticipant['payment_status'])}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="pending">Payment Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
              <button
                onClick={() => handleRemoveParticipant(participant.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderClassDetails = () => {
    if (!selectedClass) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{selectedClass.name}</h2>
            <button
              onClick={() => {
                setSelectedClass(null);
                setSelectedParticipants([]);
                setSelectedScheduleId('');
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600">Instructor</p>
              <p className="font-medium">{selectedClass.instructor}</p>
            </div>
            <div>
              <p className="text-gray-600">Time</p>
              <p className="font-medium">{selectedClass.time}</p>
            </div>
            <div>
              <p className="text-gray-600">Duration</p>
              <p className="font-medium">{selectedClass.duration}</p>
            </div>
            <div>
              <p className="text-gray-600">Room</p>
              <p className="font-medium">{selectedClass.room}</p>
            </div>
            <div>
              <p className="text-gray-600">Capacity</p>
              <p className="font-medium">{selectedClass.enrolled}/{selectedClass.capacity}</p>
            </div>
            <div>
              <p className="text-gray-600">Price</p>
              <p className="font-medium">TZS {selectedClass.price.toLocaleString()}</p>
            </div>
          </div>

          {renderParticipantsList()}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Class Management</h1>
        <button
          onClick={() => setShowAddClassModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3">
          <Card>
            <Calendar
              date={selectedDate}
              onDateChange={setSelectedDate}
              className="rounded-md border"
            />
          </Card>
        </div>

        <div className="lg:w-2/3">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              Classes for {format(selectedDate, 'MMMM d, yyyy')}
            </h2>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading classes...
                </div>
              ) : schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setSelectedScheduleId(schedule.id);
                      loadParticipants(schedule.id);
                      setSelectedClass({
                        id: parseInt(schedule.id),
                        name: schedule.template?.name || '',
                        instructor: schedule.instructor?.full_name || '',
                        time: format(new Date(`2000-01-01T${schedule.start_time}`), 'h:mm a'),
                        duration: `${schedule.template?.duration || 0} min`,
                        capacity: schedule.capacity,
                        enrolled: schedule.current_enrollment,
                        room: schedule.room,
                        type: schedule.template?.class_type || 'yoga',
                        insuranceAccepted: schedule.template?.insurance_accepted || false,
                        insuranceProviders: schedule.template?.insurance_providers || [],
                        price: schedule.template?.price || 0,
                        availability: []
                      });
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{schedule.template?.name}</h3>
                        <p className="text-gray-600">
                          Instructor: {schedule.instructor?.full_name}
                        </p>
                        {schedule.template?.insurance_accepted && (
                          <div className="flex items-center mt-1 text-blue-600 text-sm">
                            <Shield className="w-4 h-4 mr-1" />
                            <span>Insurance Accepted</span>
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        schedule.current_enrollment >= schedule.capacity
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                      >
                        {schedule.current_enrollment >= schedule.capacity ? 'Full' : 'Available'}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>
                          {format(new Date(`2000-01-01T${schedule.start_time}`), 'h:mm a')} (
                          {schedule.template?.duration || 0} min)
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{schedule.current_enrollment}/{schedule.capacity} enrolled</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{schedule.room}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span>TZS {(schedule.template?.price || 0).toLocaleString()}</span>
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
          </Card>
        </div>
      </div>

      {renderAddClassModal()}
      {selectedClass && renderClassDetails()}
      {showAddParticipantModal && (
        <AddParticipantModal
          onClose={() => setShowAddParticipantModal(false)}
          onAdd={handleAddParticipant}
          classPrice={selectedClass?.price || 0}
        />
      )}
    </div>
  );
};