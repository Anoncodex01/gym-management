import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface ClassAttendanceListProps {
  classId: string;
}

export const ClassAttendanceList: React.FC<ClassAttendanceListProps> = ({ classId }) => {
  const [attendances, setAttendances] = useState<ClassAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await classAttendanceService.getClassAttendance(classId);
        setAttendances(data);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [classId]);

  if (loading) return <div>Loading attendance...</div>;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Class Attendance</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Check In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Insurance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Billing Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendances.map((attendance) => (
              <tr key={attendance.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {attendance.userId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${attendance.status === 'checked_in' ? 'bg-green-100 text-green-800' :
                    attendance.status === 'checked_out' ? 'bg-blue-100 text-blue-800' :
                    attendance.status === 'no_show' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'}`}>
                    {attendance.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {attendance.checkInTime && format(new Date(attendance.checkInTime), 'h:mm a')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {attendance.insuranceUsed ? 'Yes' : 'No'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${attendance.billingStatus === 'processed' ? 'bg-green-100 text-green-800' :
                    attendance.billingStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    attendance.billingStatus === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'}`}>
                    {attendance.billingStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};