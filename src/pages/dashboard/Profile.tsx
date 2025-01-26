import React from 'react';
import { User, Mail, Phone, Calendar } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  // Mock user data - replace with actual user data from context/API
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    joinDate: '2024-01-15',
    membershipType: 'Premium',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        {/* Profile Header */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-6">
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-24 h-24 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-500">{user.membershipType} Member</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">{new Date(user.joinDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Membership Status</p>
                <p className="font-medium">{user.membershipType}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Edit Profile
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};