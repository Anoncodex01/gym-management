import React, { useState, useEffect } from 'react';
import { Attendance } from '../../types/attendance.types';
import { format } from 'date-fns';

interface AttendanceTrackerProps {
  userId: string;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ userId }) => {
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCurrentAttendance = async () => {
      try {
        const today = new Date();
        const attendanceHistory = await attendanceService.getAttendanceHistory(
          userId,
          today,
          today
        );
        setTodayAttendance(attendanceHistory[0] || null);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    checkCurrentAttendance();
  }, [userId]);

  const handleCheckIn = async (type: 'gym_visit' | 'class_attendance') => {
    try {
      const attendance = await attendanceService.checkIn(userId, type);
      setTodayAttendance(attendance);
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;

    try {
      const attendance = await attendanceService.checkOut(todayAttendance.id);
      setTodayAttendance(attendance);
    } catch (error) {
      console.error('Check-out failed:', error);
    }
  };

  if (loading) {
    return <div>Loading attendance...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">Attendance Tracking</h2>

      {!todayAttendance ? (
        <div className="space-y-4">
          <button
            onClick={() => handleCheckIn('gym_visit')}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Check In - Gym Visit
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Checked in: {format(new Date(todayAttendance.checkInTime), 'h:mm a')}</p>
            {todayAttendance.checkOutTime && (
              <p>Checked out: {format(new Date(todayAttendance.checkOutTime), 'h:mm a')}</p>
            )}
          </div>

          {!todayAttendance.checkOutTime && (
            <button
              onClick={handleCheckOut}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Check Out
            </button>
          )}
        </div>
      )}
    </div>
  );
};