import { format } from 'date-fns';
import { supabase } from '../supabaseClient';

interface ReceiptData {
  paymentId: string;
  memberName: string;
  memberEmail: string;
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
  description: string;
  orderId: string;
}

export const receiptService = {
  generateReceipt: async (paymentId: string): Promise<string> => {
    try {
      // Fetch payment data from database
      const { data: payment } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          payment_method,
          created_at,
          order_id,
          member:member_id (
            full_name,
            email
          )
        `)
        .eq('id', paymentId)
        .single();

      if (!payment) {
        throw new Error('Payment not found');
      }

      const receiptData: ReceiptData = {
        paymentId: payment.id,
        memberName: payment.member.full_name,
        memberEmail: payment.member.email,
        amount: payment.amount,
        paymentMethod: payment.payment_method,
        paymentDate: new Date(payment.created_at),
        description: 'Gym Membership Payment',
        orderId: payment.order_id
      };

      // Generate receipt HTML
      const receiptHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .receipt { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .details { margin-bottom: 30px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .footer { text-align: center; margin-top: 30px; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>Payment Receipt</h1>
              <p>Receipt #${receiptData.paymentId}</p>
            </div>
            
            <div class="details">
              <div class="row">
                <strong>Date:</strong>
                <span>${format(receiptData.paymentDate, 'MMMM d, yyyy')}</span>
              </div>
              <div class="row">
                <strong>Member Name:</strong>
                <span>${receiptData.memberName}</span>
              </div>
              <div class="row">
                <strong>Email:</strong>
                <span>${receiptData.memberEmail}</span>
              </div>
              <div class="row">
                <strong>Amount:</strong>
                <span>TZS ${receiptData.amount.toLocaleString()}</span>
              </div>
              <div class="row">
                <strong>Payment Method:</strong>
                <span>${receiptData.paymentMethod}</span>
              </div>
              <div class="row">
                <strong>Description:</strong>
                <span>${receiptData.description}</span>
              </div>
              <div class="row">
                <strong>Order ID:</strong>
                <span>${receiptData.orderId}</span>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for your payment!</p>
              <p>For any questions, please contact support.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Convert HTML to PDF using browser's print functionality
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
        printWindow.print();
      }

      return receiptHtml;
    } catch (error) {
      console.error('Failed to generate receipt:', error);
      throw error;
    }
  },

  emailReceipt: async (paymentId: string, email: string): Promise<void> => {
    try {
      const receiptHtml = await receiptService.generateReceipt(paymentId);
      
      await fetch('/api/email/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Payment Receipt',
          html: receiptHtml
        })
      });
    } catch (error) {
      console.error('Failed to email receipt:', error);
      throw error;
    }
  },

  generateBatchReceipts: async (paymentIds: string[]): Promise<void> => {
    try {
      // Generate all receipts in parallel
      const receipts = await Promise.all(
        paymentIds.map(id => receiptService.generateReceipt(id))
      );

      // Combine all receipts into a single PDF
      const combinedHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Batch Receipts</title>
          <style>
            .page-break { page-break-after: always; }
            ${receipts[0].split('<style>')[1].split('</style>')[0]}
          </style>
        </head>
        <body>
          ${receipts.map((receipt, index) => `
            ${receipt.split('<body>')[1].split('</body>')[0]}
            ${index < receipts.length - 1 ? '<div class="page-break"></div>' : ''}
          `).join('')}
        </body>
        </html>
      `;

      // Open print dialog
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(combinedHtml);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Failed to generate batch receipts:', error);
      throw error;
    }
  }
};