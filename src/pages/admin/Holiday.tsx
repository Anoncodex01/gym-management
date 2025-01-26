import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Calendar, Clock, Users, AlertCircle } from 'lucide-react';
import { HolidayEditor } from '../../components/holiday/HolidayEditor';
import { HolidayManager } from '../../components/holiday/HolidayManager';
import { format } from 'date-fns';

export const HolidayPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Holiday Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Upcoming Holidays</p>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-gray-500">Next 30 days</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">Modified Schedules</p>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-gray-500">Special hours</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-500">Affected Classes</p>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-gray-500">Need rescheduling</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="settings">Holiday Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <HolidayManager />
        </TabsContent>

        <TabsContent value="list">
          <Card className="p-6">
            <div className="space-y-4">
              {/* List of upcoming holidays */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="font-medium">Christmas Day</h3>
                  <p className="text-sm text-gray-500">{format(new Date('2024-12-25'), 'MMMM d, yyyy')}</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  Closed
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <HolidayEditor
              holiday={{
                id: '',
                name: '',
                date: new Date(),
                isRecurringYearly: false,
                affectedServices: {
                  gymOpen: false,
                  classesCancelled: false
                },
                notificationStatus: {
                  emailSent: false,
                  smsSent: false
                }
              }}
              onSave={async (holiday) => {
                // Handle holiday save
                console.log('Holiday saved:', holiday);
              }}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};