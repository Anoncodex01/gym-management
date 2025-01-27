import { supabase } from '../supabaseClient';

interface PaymentRequest {
  memberId: string;
  amount: number;
  subscription: {
    type: 'monthly' | 'semi-annually' | 'annually';
    startDate: string;
    endDate: string;
    status: 'active' | 'pending' | 'expired';
  };
}

interface PaymentResponse {
  success: boolean;
  orderId: string;
  status: string;
  message: string;
  paymentUrl?: string;
}

const ZENO_API_URL = 'https://api.zeno.africa';
const ZENO_API_URL_ORDER_STATUS = 'https://api.zeno.africa/order-status';

// Get environment variables
const ACCOUNT_ID = import.meta.env.VITE_ZENO_PAY_ACCOUNT_ID;
const API_KEY = import.meta.env.VITE_ZENO_PAY_API_KEY;
const SECRET_KEY = import.meta.env.VITE_ZENO_PAY_SECRET_KEY;

// Validate required configuration
if (!ACCOUNT_ID) {
  throw new Error('VITE_ZENO_PAY_ACCOUNT_ID is required');
}

export const paymentService = {
  async getMemberDetails(memberId: string) {
    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (error) throw error;
    if (!member) throw new Error('Member not found');

    return member;
  },

  async processPayment(paymentDetails: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Get member details
      const member = await this.getMemberDetails(paymentDetails.memberId);
      
      // Format phone number
      let formattedPhone = member.phone_number.trim();
      formattedPhone = formattedPhone.replace(/^0+/, ''); // Remove leading zeros
      formattedPhone = formattedPhone.replace(/[^0-9]/g, ''); // Remove non-numeric characters
      formattedPhone = formattedPhone.startsWith('255') ? formattedPhone : `255${formattedPhone}`;

      // Validate phone number format
      if (!formattedPhone.match(/^255\d{9}$/)) {
        throw new Error('Invalid phone number format. Please use format: +255XXXXXXXXX');
      }

      // Prepare form data for Zeno API
      const formData = new URLSearchParams({
        buyer_name: member.full_name,
        buyer_email: member.email,
        buyer_phone: formattedPhone,
        amount: Math.round(paymentDetails.amount).toString(),
        account_id: ACCOUNT_ID,
        api_key: API_KEY || 'NULL',
        secret_key: SECRET_KEY || 'NULL'
      });

      // First API call to create order
      const response = await fetch(ZENO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: formData,
        mode: 'cors'
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData?.message || 'Failed to create payment order');
      }

      // Get order ID from Zeno response
      const orderId = responseData.order_id;

      // Create payment record in database
      const { error: dbError } = await supabase
        .from('payments')
        .insert([{
          order_id: orderId,
          member_id: paymentDetails.memberId,
          amount: paymentDetails.amount,
          membership_type: paymentDetails.subscription.type,
          payment_status: 'PENDING',
          created_at: new Date().toISOString()
        }]);

      if (dbError) throw dbError;

      // Wait for 5 seconds before checking status
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Check payment status
      const statusFormData = new URLSearchParams({
        check_status: '1',
        order_id: orderId,
        api_key: API_KEY || 'NULL',
        secret_key: SECRET_KEY || 'NULL'
      });

      const statusResponse = await fetch(ZENO_API_URL_ORDER_STATUS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: statusFormData,
        mode: 'cors'
      });

      const statusData = await statusResponse.json();

      if (!statusResponse.ok) {
        throw new Error(statusData?.message || 'Failed to check payment status');
      }

      // Update payment status in database
      await supabase
        .from('payments')
        .update({
          payment_status: statusData.payment_status || 'PENDING',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      return {
        success: true,
        orderId,
        status: statusData.payment_status || 'PENDING',
        message: responseData.message || 'Payment initialized successfully',
        paymentUrl: responseData.payment_url
      };

    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        orderId: '',
        status: 'FAILED',
        message: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  },

  async checkPaymentStatus(orderId: string): Promise<{ status: string; message: string }> {
    try {
      const formData = new URLSearchParams({
        check_status: '1',
        order_id: orderId,
        api_key: API_KEY || 'NULL',
        secret_key: SECRET_KEY || 'NULL'
      });

      const response = await fetch(ZENO_API_URL_ORDER_STATUS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: formData,
        mode: 'cors'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to check payment status');
      }

      // Update payment status in database
      await supabase
        .from('payments')
        .update({
          payment_status: data.payment_status || 'PENDING',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      return {
        status: data.payment_status || 'PENDING',
        message: data.message || 'Payment status check completed'
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      return {
        status: 'ERROR',
        message: error instanceof Error ? error.message : 'Failed to check payment status'
      };
    }
  }
};