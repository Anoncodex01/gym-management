import React from 'react';
import { Activity, Calendar, CreditCard, Users } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  // Mock data - replace with actual data from API
  const stats = {
    classesAttended: 12,
    nextClass: 'Yoga Basics',
    nextClassTime: '2024-03-15T10:00:00',
    membershipStatus: 'Active',
    daysRemaining: 25
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Activity className="w-12 h-12 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Classes Attended</p>
              <p className="text-2xl font-bold">{stats.classesAttended}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="w-12 h-12 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Next Class</p>
              <p className="text-lg font-medium">{stats.nextClass}</p>
              <p className="text-sm text-gray-500">
                {new Date(stats.nextClassTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CreditCard className="w-12 h-12 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Membership Status</p>
              <p className="text-lg font-medium">{stats.membershipStatus}</p>
              <p className="text-sm text-gray-500">{stats.daysRemaining} days remaining</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="w-12 h-12 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Referral Program</p>
              <button className="mt-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-md text-sm">
                Invite Friends
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium">Recent Activity</h2>
        </div>
        <div className="p-6">
          {/* Add activity list here */}
          <p className="text-gray-500">No recent activity to show</p>
        </div>
      </div>

      {/* Upcoming Classes */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium">Upcoming Classes</h2>
        </div>
        <div className="p-6">
          {/* Add upcoming classes list here */}
          <p className="text-gray-500">No upcoming classes scheduled</p>
        </div>
      </div>
    </div>
  );
};