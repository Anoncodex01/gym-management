import { NextApiRequest, NextApiResponse } from 'next';
import { paymentService } from '../../../services/payment/paymentService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      order_id,
      payment_status,
      payment_method,
      transaction_id
    } = req.body;

    // Verify webhook signature (implement this based on ZenoPay docs)
    // const isValid = verifyWebhookSignature(req);
    // if (!isValid) {
    //   return res.status(400).json({ message: 'Invalid webhook signature' });
    // }

    // Update payment status in your database
    const status = payment_status === 'success' ? 'succeeded' : 'failed';
    
    await paymentService.updatePaymentStatus({
      orderId: order_id,
      status,
      paymentMethod: payment_method,
      transactionId: transaction_id
    });

    return res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
