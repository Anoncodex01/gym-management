import { NextApiRequest, NextApiResponse } from 'next';

// Load environment variables with fallbacks
const ZENO_CONFIG = {
  apiKey: process.env.ZENO_PAY_API_KEY || '',
  accountId: process.env.ZENO_PAY_ACCOUNT_ID || '',
  secretKey: process.env.ZENO_PAY_SECRET_KEY || '',
  apiUrl: process.env.API_URL || 'http://localhost:3000'
};

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
      membershipType
    } = req.body;

    // Validate required fields
    if (!orderId || !amount || !customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate Zeno Africa configuration
    if (!ZENO_CONFIG.apiKey || !ZENO_CONFIG.accountId || !ZENO_CONFIG.secretKey) {
      console.error('Missing Zeno Africa configuration');
      return res.status(500).json({ message: 'Payment service not properly configured' });
    }

    // Create payment with Zeno Africa API
    const requestData = new URLSearchParams({
      create_order: '1',
      api_key: ZENO_CONFIG.apiKey,
      account_id: ZENO_CONFIG.accountId,
      secret_key: ZENO_CONFIG.secretKey,
      amount: amount.toString(),
      buyer_name: customerName,
      buyer_email: customerEmail,
      buyer_phone: customerPhone,
      order_reference: orderId,
      webhook_url: `${ZENO_CONFIG.apiUrl}/api/webhooks/zenopay`,
      payment_method: paymentMethod,
      currency: 'TZS'
    });

    const zenoResponse = await fetch('https://api.zeno.africa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: requestData
    });

    const zenoData = await zenoResponse.json();

    if (!zenoResponse.ok || zenoData.status !== 'success') {
      console.error('Zeno Africa API error:', zenoData);
      throw new Error(zenoData.message || 'Failed to initialize payment with Zeno Africa');
    }

    // Store payment details in database
    // Example using a database service:
    // await db.payments.create({
    //   orderId,
    //   amount,
    //   customerName,
    //   customerEmail,
    //   customerPhone,
    //   paymentMethod,
    //   membershipType,
    //   zenoPayOrderId: zenoData.order_id,
    //   paymentStatus: 'pending',
    //   createdAt: new Date()
    // });

    return res.status(200).json({
      orderId,
      zenoPayOrderId: zenoData.order_id,
      status: 'success',
      paymentUrl: zenoData.payment_url // Include payment URL if provided by Zeno
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to create payment' 
    });
  }
}
