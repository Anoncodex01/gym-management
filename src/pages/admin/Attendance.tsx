import React from 'react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { attendanceService } from '../../services/attendance/attendanceService';
import { memberService } from '../../services/member/memberService';
import { toast } from 'react-hot-toast';

interface AttendanceData {
  hour: string;
  count: number;
}

interface CheckIn {
  id: string;
  memberId: string;
  memberName: string;
  checkInTime: Date;
  checkOutTime?: Date;
  type: 'gym' | 'class';
}

export const AttendancePage: React.FC = () => {
  const [dailyData, setDailyData] = useState<AttendanceData[]>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalToday: 0,
    currentlyCheckedIn: 0,
    peakHour: '',
    averageStayDuration: ''
  });

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        // Fetch today's attendance data
        const today = new Date();
        const { data: attendanceData } = await attendanceService.getDailyAttendance(today);
        
        // Process hourly data
        const hourlyData = Array.from({ length: 24 }, (_, i) => ({
          hour: format(new Date().setHours(i, 0, 0, 0), 'ha'),
          count: 0
        }));

        attendanceData.forEach(attendance => {
          const hour = new Date(attendance.check_in_time).getHours();
          hourlyData[hour].count++;
        });

        setDailyData(hourlyData);

        // Calculate stats
        const currentlyCheckedIn = attendanceData.filter(a => !a.check_out_time).length;
        const peakHour = [...hourlyData].sort((a, b) => b.count - a.count)[0];

        setStats({
          totalToday: attendanceData.length,
          currentlyCheckedIn,
          peakHour: peakHour.hour,
          averageStayDuration: '1.5 hours' // Calculate this based on actual data
        });

        // Fetch recent check-ins with member details
        const recentAttendance = attendanceData
          .slice(-5)
          .sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime());

        const checkInsWithNames = await Promise.all(
          recentAttendance.map(async (attendance) => {
            const member = await memberService.getMemberById(attendance.member_id);
            return {
              id: attendance.id,
              memberId: attendance.member_id,
              memberName: member?.fullName || 'Unknown Member',
              checkInTime: new Date(attendance.check_in_time),
              checkOutTime: attendance.check_out_time ? new Date(attendance.check_out_time) : undefined,
              type: attendance.attendance_type
            };
          })
        );

        setRecentCheckIns(checkInsWithNames);
      } catch (error) {
        console.error('Failed to fetch attendance data:', error);
        toast.error('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
    const interval = setInterval(fetchAttendanceData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance Tracking</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Total Today</p>
              <p className="text-2xl font-bold">{stats.totalToday}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Currently In</p>
              <p className="text-2xl font-bold">{stats.currentlyCheckedIn}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <ArrowUp className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Peak Hour</p>
              <p className="text-2xl font-bold">{stats.peakHour}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <ArrowDown className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">Avg. Stay</p>
              <p className="text-2xl font-bold">{stats.averageStayDuration}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Daily Attendance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Check-ins</h2>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {recentCheckIns.length > 0 ? (
              recentCheckIns.map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{checkIn.memberName}</p>
                    <p className="text-sm text-gray-500">
                      {format(checkIn.checkInTime, 'h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      checkIn.type === 'gym' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {checkIn.type === 'gym' ? 'Gym' : 'Class'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      checkIn.checkOutTime
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {checkIn.checkOutTime ? 'Checked Out' : 'Active'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No recent check-ins</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};