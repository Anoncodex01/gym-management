import { supabase } from '../supabaseClient';
import { ZenoPaymentResponse } from '../../types/payment.types';

export const webhookHandler = {
  handlePaymentWebhook: async (payload: ZenoPaymentResponse) => {
    try {
      const { order_id, payment_status } = payload.message;

      // Update payment status in database
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: payment_status === 'SUCCESS' ? 'succeeded' : 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', order_id);

      if (error) {
        throw error;
      }

      // If payment successful, update member subscription
      if (payment_status === 'SUCCESS') {
        const { data: payment } = await supabase
          .from('payments')
          .select('member_id, subscription_data')
          .eq('order_id', order_id)
          .single();

        if (payment) {
          await supabase
            .from('members')
            .update({
              subscription: payment.subscription_data,
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('id', payment.member_id);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Webhook handling failed:', error);
      return { success: false, error };
    }
  }
};