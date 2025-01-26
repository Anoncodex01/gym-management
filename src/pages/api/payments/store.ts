import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      orderId,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod,
      membershipType,
      zenoPayOrderId,
      paymentStatus
    } = req.body;

    // Validate required fields
    if (!orderId || !amount || !customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Store payment details in your database
    // Example using a database service:
    // await db.payments.create({
    //   orderId,
    //   amount,
    //   customerName,
    //   customerEmail,
    //   customerPhone,
    //   paymentMethod,
    //   membershipType,
    //   zenoPayOrderId,
    //   paymentStatus,
    //   createdAt: new Date()
    // });

    return res.status(200).json({ 
      message: 'Payment details stored successfully',
      orderId 
    });
  } catch (error) {
    console.error('Failed to store payment details:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to store payment details' 
    });
  }
}
