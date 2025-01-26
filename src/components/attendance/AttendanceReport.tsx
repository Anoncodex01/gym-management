import React, { useState, useEffect } from 'react';
import { AttendanceStats } from '../../types/attendance.types';

interface AttendanceReportProps {
  userId: string;
}

export const AttendanceReport: React.FC<AttendanceReportProps> = ({ userId }) => {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const attendanceStats = await attendanceService.getStats(userId);
        setStats(attendanceStats);
      } catch (error) {
        console.error('Failed to fetch attendance stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) return <div>Loading stats...</div>;
  if (!stats) return <div>No stats available</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">Attendance Summary</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Total Visits</div>
          <div className="text-2xl font-semibold">{stats.totalVisits}</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Class Attendance</div>
          <div className="text-2xl font-semibold">{stats.classAttendance}</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Gym Visits</div>
          <div className="text-2xl font-semibold">{stats.gymVisits}</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Insurance Claims</div>
          <div className="text-2xl font-semibold">
            {stats.insuranceClaims}
            {stats.pendingClaims > 0 && (
              <span className="text-sm text-yellow-600 ml-2">
                ({stats.pendingClaims} pending)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};