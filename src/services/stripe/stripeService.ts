import { loadStripe } from '@stripe/stripe-js';
import { PaymentIntent } from '../../types/payment.types';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

export const stripeService = {
  createPaymentIntent: async (amount: number, currency: string = 'usd'): Promise<PaymentIntent> => {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency }),
    });
    return response.json();
  },

  createSubscription: async (priceId: string, customerId: string) => {
    const response = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId, customerId }),
    });
    return response.json();
  }
};