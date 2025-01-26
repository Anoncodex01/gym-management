import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card } from '../../components/ui/card';
import { Bell, Calendar, CheckCircle } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notification System</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Create Template
        </button>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium">Welcome Message</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Sent to new members upon registration
              </p>
              <div className="flex justify-end">
                <button className="text-blue-600 hover:text-blue-700 text-sm">
                  Edit Template
                </button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-5 h-5 text-green-600" />
                <h3 className="font-medium">Class Reminder</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Sent 24 hours before scheduled class
              </p>
              <div className="flex justify-end">
                <button className="text-blue-600 hover:text-blue-700 text-sm">
                  Edit Template
                </button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Class Reminders</h3>
                    <p className="text-sm text-gray-600">Scheduled for tomorrow</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Pending
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-medium">Welcome Messages</h3>
                    <p className="text-sm text-gray-600">Sent today at 9:00 AM</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Delivered
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};