export interface BirthdayMessage {
  id: string;
  userId: string;
  messageType: 'email' | 'sms' | 'both';
  status: 'pending' | 'sent' | 'failed';
  scheduledDate: Date;
  sentDate?: Date;
  specialOffer?: {
    code: string;
    discountPercentage: number;
    validDays: number;
  };
}

export interface BirthdayTemplate {
  id: string;
  type: 'email' | 'sms';
  subject?: string;
  content: string;
  includesOffer: boolean;
}