import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendance/attendanceService';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface MemberSignInProps {
  memberId: string;
  memberName: string;
}

export const MemberSignIn: React.FC<MemberSignInProps> = ({ memberId, memberName }) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const stats = await attendanceService.getStats(memberId);
        setIsCheckedIn(stats.currentlyCheckedIn);
        if (stats.lastVisit && stats.currentlyCheckedIn) {
          setCheckInTime(stats.lastVisit);
        }
      } catch (error) {
        console.error('Failed to check attendance status:', error);
      }
    };

    checkStatus();
  }, [memberId]);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const attendance = await attendanceService.checkIn(memberId, 'gym');
      setIsCheckedIn(true);
      setCheckInTime(new Date(attendance.check_in_time));
      toast.success('Successfully checked in');
    } catch (error: any) {
      toast.error(error.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await attendanceService.checkOut(memberId);
      setIsCheckedIn(false);
      setCheckInTime(null);
      toast.success('Successfully checked out');
    } catch (error: any) {
      toast.error(error.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium">{memberName}</h2>
          <p className="text-sm text-gray-500">Member Sign In</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isCheckedIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {isCheckedIn ? 'Checked In' : 'Not Checked In'}
        </div>
      </div>

      {isCheckedIn && checkInTime && (
        <div className="mb-6 flex items-center text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>Checked in at {format(checkInTime, 'h:mm a')}</span>
        </div>
      )}

      <button
        onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md flex items-center justify-center space-x-2 ${
          isCheckedIn
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <span>Processing...</span>
        ) : (
          <>
            {isCheckedIn ? (
              <>
                <LogOut className="w-4 h-4" />
                <span>Check Out</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Check In</span>
              </>
            )}
          </>
        )}
      </button>
    </div>
  );
};