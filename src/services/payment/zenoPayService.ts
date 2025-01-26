import ZenoPay from 'zenopay';
import { PaymentIntent } from '../../types/payment.types';

export class ZenoPayService {
  private zenoPay: ZenoPay;

  constructor() {
    // Use NEXT_PUBLIC_ prefix for client-side environment variables
    this.zenoPay = new ZenoPay({
      apiKey: process.env.NEXT_PUBLIC_ZENO_PAY_API_KEY || '',
      secretKey: process.env.NEXT_PUBLIC_ZENO_PAY_SECRET_KEY || '',
      accountID: process.env.NEXT_PUBLIC_ZENO_PAY_ACCOUNT_ID || ''
    });
  }

  async createPayment(params: {
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    orderId: string;
  }): Promise<PaymentIntent> {
    try {
      const response = await this.zenoPay.Pay({
        amountToCharge: params.amount,
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        customerPhoneNumber: params.customerPhone,
        callbackURL: `${process.env.NEXT_PUBLIC_API_URL}/api/webhooks/zenopay`,
        orderReference: params.orderId
      });

      if (!response.success) {
        throw new Error(response.message as string);
      }

      return {
        id: response.message.order_id,
        amount: params.amount,
        currency: 'TZS',
        status: 'pending',
        orderId: params.orderId,
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        customerPhoneNumber: params.customerPhone
      };
    } catch (error) {
      throw new Error(`Failed to create ZenoPay payment: ${(error as Error).message}`);
    }
  }
}

// Initialize the service only on the server side
export const zenoPayService = typeof window === 'undefined' ? new ZenoPayService() : null;
