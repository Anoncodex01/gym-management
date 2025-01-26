import React from 'react';
import { format } from 'date-fns';
import { Member } from '../../types/member.types';
import { CreditCard, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface MemberSubscriptionInfoProps {
  member: Member;
}

export const MemberSubscriptionInfo: React.FC<MemberSubscriptionInfoProps> = ({ member }) => {
  if (!member.subscription) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-yellow-500 mr-2" />
          <p className="text-yellow-700">No active subscription</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">Subscription Details</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Start Date</span>
          </div>
          <p className="font-medium">
            {format(new Date(member.subscription.startDate), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            <span>End Date</span>
          </div>
          <p className="font-medium">
            {format(new Date(member.subscription.endDate), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center text-gray-500">
            <CreditCard className="w-4 h-4 mr-2" />
            <span>Billing</span>
          </div>
          <p className="font-medium capitalize">
            {member.subscription.type}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center text-gray-500">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span>Status</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
            getStatusColor(member.subscription.status)
          }`}>
            {member.subscription.status}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Amount</span>
          <span className="text-lg font-bold">
            TZS {member.subscription.amount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};