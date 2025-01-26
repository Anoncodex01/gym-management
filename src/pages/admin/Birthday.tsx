import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { BirthdayTemplateEditor } from '../../components/birthday/BirthdayTemplateEditor';
import { BirthdayMessageScheduler } from '../../components/birthday/BirthdayMessageScheduler';
import { Gift, Mail, Calendar } from 'lucide-react';
import { birthdayService } from '../../services/birthday/birthdayService';
import toast from 'react-hot-toast';

export const BirthdayPage: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTemplateSave = async (template: BirthdayTemplate) => {
    setIsProcessing(true);
    try {
      // 1. Save the template
      const savedTemplate = await birthdayService.createTemplate(template);
      
      // 2. Schedule messages for upcoming birthdays
      const schedulingPromise = toast.promise(
        birthdayService.scheduleUpcomingBirthdays(savedTemplate.id),
        {
          loading: 'Scheduling birthday messages...',
          success: 'Birthday messages scheduled successfully!',
          error: 'Failed to schedule messages'
        }
      );

      await schedulingPromise;

      // 3. Refresh the scheduled messages list
      // This will trigger a re-render of the BirthdayMessageScheduler
      window.dispatchEvent(new CustomEvent('birthdayMessagesUpdated'));

    } catch (error) {
      console.error('Failed to process birthday template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Birthday Management</h1>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isProcessing}
        >
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Gift className="w-8 h-8 text-pink-500" />
            <div>
              <p className="text-sm text-gray-500">Upcoming Birthdays</p>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-gray-500">Next 30 days</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Scheduled Messages</p>
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-gray-500">Pending delivery</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Special Offers</p>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-gray-500">Active offers</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Messages</TabsTrigger>
          <TabsTrigger value="history">Message History</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <Card className="p-6">
            <BirthdayTemplateEditor
              onSave={handleTemplateSave}
            />
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card className="p-6">
            <BirthdayMessageScheduler userId="all" />
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="font-medium">March Birthday Messages</h3>
                  <p className="text-sm text-gray-500">15 messages sent</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Completed
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};