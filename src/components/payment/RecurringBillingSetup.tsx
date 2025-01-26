// src/components/payment/RecurringBillingSetup.tsx
import React, { useState } from 'react';
import { PaymentFormWrapper } from './PaymentForm';
import { BillingFrequency, PaymentIntent } from '../../types/payment.types';

interface RecurringBillingSetupProps {
  planPrice: number;
  frequency: BillingFrequency;
  onSetupComplete?: () => void;
}

export const RecurringBillingSetup: React.FC<RecurringBillingSetupProps> = ({
  planPrice,
  frequency,
  onSetupComplete
}) => {
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTotalAmount = () => {
    return planPrice * frequency.monthsInterval;
  };

  const handlePaymentSuccess = async (paymentIntent: PaymentIntent) => {
    try {
      // Create subscription with successful payment method
      await stripeService.createSubscription(
        paymentIntent.paymentMethod,
        paymentIntent.id
      );
      setSetupComplete(true);
      onSetupComplete?.();
    } catch (error) {
      setError('Failed to setup recurring billing');
      console.error('Error setting up subscription:', error);
    }
  };

  const formatFrequency = (freq: BillingFrequency) => {
    return freq.type.charAt(0).toUpperCase() + freq.type.slice(1);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Set Up Recurring Billing</h2>
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Plan Price</span>
            <span className="font-medium">${planPrice}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Billing Frequency</span>
            <span className="font-medium">{formatFrequency(frequency)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="text-gray-600">Total Amount</span>
            <span className="font-semibold">${calculateTotalAmount()}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {!setupComplete ? (
          <PaymentFormWrapper 
            amount={calculateTotalAmount() * 100}
            onSuccess={handlePaymentSuccess}
            onError={setError}
          />
        ) : (
          <div className="text-green-600 text-center py-4 bg-green-50 rounded-md">
            <svg 
              className="w-6 h-6 mx-auto mb-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
            Recurring billing has been set up successfully!
          </div>
        )}
      </div>
    </div>
  );
};