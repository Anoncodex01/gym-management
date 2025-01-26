import React, { useState, useEffect } from 'react';
import { BirthdayMessage } from '../../types/birthday.types';

interface BirthdayMessageSchedulerProps {
  userId: string;
}

export const BirthdayMessageScheduler: React.FC<BirthdayMessageSchedulerProps> = ({ userId }) => {
  const [messages, setMessages] = useState<BirthdayMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await birthdayService.getScheduledMessages(userId);
        setMessages(data);
      } catch (error) {
        console.error('Failed to fetch birthday messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId]);

  if (loading) return <div>Loading scheduled messages...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Scheduled Birthday Messages</h3>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {messages.map((message) => (
            <li key={message.id} className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Scheduled for {format(new Date(message.scheduledDate), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Type: {message.messageType}
                  </p>
                  {message.specialOffer && (
                    <p className="text-sm text-green-600">
                      Includes {message.specialOffer.discountPercentage}% discount
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full
                    ${message.status === 'sent' ? 'bg-green-100 text-green-800' :
                    message.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'}`}
                >
                  {message.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};