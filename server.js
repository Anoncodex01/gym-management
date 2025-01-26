const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Payment endpoint
app.post('/api/payments/create', async (req, res) => {
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

    // Create payment with Zeno Africa API
    const requestData = new URLSearchParams({
      create_order: '1',
      api_key: process.env.ZENO_PAY_API_KEY,
      account_id: process.env.ZENO_PAY_ACCOUNT_ID,
      secret_key: process.env.ZENO_PAY_SECRET_KEY,
      amount: amount.toString(),
      buyer_name: customerName,
      buyer_email: customerEmail,
      buyer_phone: customerPhone,
      order_reference: orderId,
      webhook_url: `${process.env.API_URL}/api/webhooks/zenopay`,
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

    // Store payment details in database (implement your database logic here)
    
    res.status(200).json({
      orderId,
      zenoPayOrderId: zenoData.order_id,
      status: 'success',
      paymentUrl: zenoData.payment_url
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to create payment' 
    });
  }
});

// Webhook endpoint
app.post('/api/webhooks/zenopay', async (req, res) => {
  try {
    const {
      order_id,
      payment_status,
      payment_method,
      transaction_id
    } = req.body;

    // Update payment status in your database (implement your database logic here)
    console.log('Payment webhook received:', {
      orderId: order_id,
      status: payment_status,
      method: payment_method,
      transactionId: transaction_id
    });

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
