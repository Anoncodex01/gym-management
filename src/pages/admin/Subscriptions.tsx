import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const SubscriptionsPage: React.FC = () => {
  // Mock data - replace with actual data from your API
  const subscriptions = {
    active: [
      {
        id: '1',
        memberName: 'John Doe',
        plan: 'Premium',
        startDate: '2024-01-15',
        nextBilling: '2024-02-15',
        amount: 49.99,
        status: 'active'
      },
      {
        id: '2',
        memberName: 'Jane Smith',
        plan: 'Basic',
        startDate: '2024-01-10',
        nextBilling: '2024-02-10',
        amount: 29.99,
        status: 'active'
      }
    ],
    pending: [
      {
        id: '3',
        memberName: 'Mike Johnson',
        plan: 'Premium',
        startDate: '2024-02-01',
        amount: 49.99,
        status: 'pending'
      }
    ],
    expired: [
      {
        id: '4',
        memberName: 'Sarah Williams',
        plan: 'Basic',
        startDate: '2023-12-01',
        endDate: '2024-01-01',
        amount: 29.99,
        status: 'expired'
      }
    ]
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const renderSubscriptionList = (items: any[]) => (
    <div className="space-y-4">
      {items.map((subscription) => (
        <Card key={subscription.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">{subscription.memberName}</p>
              <p className="text-sm text-gray-500">{subscription.plan} Plan</p>
            </div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(subscription.status)}`}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </span>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Start Date</p>
              <p>{new Date(subscription.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Amount</p>
              <p>${subscription.amount}</p>
            </div>
            {subscription.nextBilling && (
              <div>
                <p className="text-gray-500">Next Billing</p>
                <p>{new Date(subscription.nextBilling).toLocaleDateString()}</p>
              </div>
            )}
            {subscription.endDate && (
              <div>
                <p className="text-gray-500">End Date</p>
                <p>{new Date(subscription.endDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
              View Details
            </button>
            {subscription.status === 'active' && (
              <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded">
                Cancel
              </button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subscription Management</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          New Subscription
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Active Subscriptions</p>
              <p className="text-2xl font-bold">{subscriptions.active.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500">Pending Subscriptions</p>
              <p className="text-2xl font-bold">{subscriptions.pending.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-500">Expired Subscriptions</p>
              <p className="text-2xl font-bold">{subscriptions.expired.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {renderSubscriptionList(subscriptions.active)}
        </TabsContent>

        <TabsContent value="pending">
          {renderSubscriptionList(subscriptions.pending)}
        </TabsContent>

        <TabsContent value="expired">
          {renderSubscriptionList(subscriptions.expired)}
        </TabsContent>
      </Tabs>
    </div>
  );
};