import React, { useState, useEffect } from 'react';
import { GymClass } from '../../types/class.types';
import { ClassAttendance } from '../../types/classAttendance.types';

interface ClassCheckInProps {
  classId: string;
  userId: string;
  onCheckInComplete?: (attendance: ClassAttendance) => void;
}

export const ClassCheckIn: React.FC<ClassCheckInProps> = ({
  classId,
  userId,
  onCheckInComplete
}) => {
  const [gymClass, setGymClass] = useState<GymClass | null>(null);
  const [attendance, setAttendance] = useState<ClassAttendance | null>(null);
  const [useInsurance, setUseInsurance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassAndAttendance = async () => {
      try {
        // Fetch class details
        const classResponse = await fetch(`/api/classes/${classId}`);
        const classData = await classResponse.json();
        setGymClass(classData);

        // Fetch existing attendance if any
        const attendanceResponse = await fetch(
          `/api/class-attendance/user/${userId}/class/${classId}`
        );
        const attendanceData = await attendanceResponse.json();
        if (attendanceData) {
          setAttendance(attendanceData);
        }
      } catch (err) {
        setError('Failed to load class information');
      } finally {
        setLoading(false);
      }
    };

    fetchClassAndAttendance();
  }, [classId, userId]);

  const handleCheckIn = async () => {
    try {
      const newAttendance = await classAttendanceService.checkInToClass(
        userId,
        classId,
        useInsurance
      );
      setAttendance(newAttendance);
      onCheckInComplete?.(newAttendance);
    } catch (err) {
      setError('Failed to check in to class');
    }
  };

  const handleCheckOut = async () => {
    if (!attendance) return;

    try {
      const updatedAttendance = await classAttendanceService.checkOutFromClass(
        attendance.id
      );
      setAttendance(updatedAttendance);
    } catch (err) {
      setError('Failed to check out from class');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!gymClass) return <div>Class not found</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">{gymClass.name} Check-In</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {!attendance ? (
          <>
            {gymClass.requiresInsurance && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useInsurance"
                  checked={useInsurance}
                  onChange={(e) => setUseInsurance(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="useInsurance" className="ml-2 text-sm text-gray-700">
                  Use insurance for this class
                </label>
              </div>
            )}

            <button
              onClick={handleCheckIn}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Check In
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              {attendance.checkInTime && (
                <p>Checked in: {new Date(attendance.checkInTime).toLocaleTimeString()}</p>
              )}
              {attendance.checkOutTime && (
                <p>Checked out: {new Date(attendance.checkOutTime).toLocaleTimeString()}</p>
              )}
              {attendance.insuranceUsed && (
                <p className="text-blue-600">Insurance will be billed</p>
              )}
            </div>

            {!attendance.checkOutTime && (
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
    </div>
  );
};