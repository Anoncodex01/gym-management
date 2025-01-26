import { PaymentIntent, PaymentMethod } from '../../types/payment.types';
import { billingConfig } from './billingConfig';

export const paymentService = {
  // Create payment intent for one-time payments
  createPaymentIntent: async (
    amount: number,
    phoneNumber?: string,
    email?: string
  ): Promise<PaymentIntent> => {
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        currency: 'TZS',
        phoneNumber,
        email
      }),
    });
    const data = await response.json();
    return data;
  },

  // Set up recurring billing
  setupRecurringBilling: async (
    membershipType: 'single' | 'couple' | 'corporate',
    frequency: string,
    hasInsurance: boolean,
    phoneNumber?: string,
    email?: string
  ): Promise<PaymentIntent> => {
    // Calculate price based on membership type, frequency, and insurance status
    const basePrice = billingConfig.basePrice[membershipType];
    const selectedFrequency = billingConfig.frequencies.find(f => f.type === frequency);
    
    if (!selectedFrequency) {
      throw new Error('Invalid billing frequency');
    }

    let finalPrice = basePrice;
    
    // Apply frequency discount
    finalPrice = finalPrice * (1 - selectedFrequency.discountPercentage / 100);
    
    // Apply insurance discount if applicable
    if (hasInsurance) {
      finalPrice = finalPrice * (1 - billingConfig.insuranceDiscount / 100);
    }

    // Calculate total amount for the billing period
    const totalAmount = finalPrice * selectedFrequency.monthsInterval;

    const response = await fetch('/api/payments/setup-recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: totalAmount,
        currency: 'TZS',
        frequency: selectedFrequency.type,
        membershipType,
        hasInsurance,
        phoneNumber,
        email
      }),
    });
    return response.json();
  },

  // Get payment methods for a user
  getPaymentMethods: async (userId: string): Promise<PaymentMethod[]> => {
    const response = await fetch(`/api/payments/methods/${userId}`);
    return response.json();
  },

  // Send payment link via SMS or email
  sendPaymentLink: async (
    paymentId: string,
    contact: { type: 'sms' | 'email'; value: string }
  ): Promise<void> => {
    await fetch('/api/payments/send-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId,
        contactType: contact.type,
        contactValue: contact.value
      }),
    });
  },

  // Update payment status
  async updatePaymentStatus(params: {
    orderId: string;
    status: 'pending' | 'succeeded' | 'failed';
    paymentMethod: string;
    transactionId: string;
  }): Promise<void> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/${params.orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: params.status,
          paymentMethod: params.paymentMethod,
          transactionId: params.transactionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },
};