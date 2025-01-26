import { useEffect } from 'react';
import toast from 'react-hot-toast';

interface WebhookData {
  order_id: string;
  payment_status: 'success' | 'failed' | 'pending';
  payment_method: string;
  transaction_id: string;
}

export const PaymentWebhookHandler = () => {
  useEffect(() => {
    const handleWebhook = async (event: MessageEvent) => {
      try {
        const webhookData = event.data as WebhookData;
        
        // Get stored payments
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        
        // Find and update the payment
        const updatedPayments = payments.map((payment: any) => {
          if (payment.orderId === webhookData.order_id) {
            return {
              ...payment,
              paymentStatus: webhookData.payment_status === 'success' ? 'completed' : 'failed',
              transactionId: webhookData.transaction_id
            };
          }
          return payment;
        });

        // Update localStorage
        localStorage.setItem('payments', JSON.stringify(updatedPayments));

        // Show notification
        if (webhookData.payment_status === 'success') {
          toast.success('Payment completed successfully!');
        } else if (webhookData.payment_status === 'failed') {
          toast.error('Payment failed. Please try again.');
        }
      } catch (error) {
        console.error('Error handling webhook:', error);
      }
    };

    // Listen for postMessage events
    window.addEventListener('message', handleWebhook);

    return () => {
      window.removeEventListener('message', handleWebhook);
    };
  }, []);

  return null;
};
