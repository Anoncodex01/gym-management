import React from 'react';
import { format } from 'date-fns';
import { Download, Printer, CheckCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PaymentDetails } from '../../types/payment';

interface PaymentReceiptProps {
  payment: PaymentDetails;
}

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ payment }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const receipt = document.getElementById('payment-receipt');
    if (receipt) {
      const canvas = await html2canvas(receipt);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`receipt-${payment.orderId}.pdf`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Success Message - Fixed at top */}
      <div className="bg-white border-b border-gray-200 py-6 px-4 sm:px-6 lg:px-8 print:hidden">
        <div className="max-w-md mx-auto flex items-center justify-center space-x-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Payment Successful!</h2>
            <p className="text-sm text-gray-600">Your payment has been processed successfully.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons - Fixed below success message */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8 print:hidden shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-end space-x-4">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print Receipt
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Scrollable Receipt Content */}
      <div className="flex-1 overflow-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div id="payment-receipt" className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              {/* Header */}
              <div className="border-b pb-8 mb-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">RECEIPT</h1>
                    <p className="text-gray-500 mt-2">#{payment.orderId}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      TZS {formatPrice(payment.amount)}
                    </div>
                    <p className="text-gray-500 mt-1">{format(payment.date, 'dd MMM yyyy')}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* From Section */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    From
                  </h2>
                  <div className="text-gray-800">
                    <h3 className="text-lg font-bold mb-1">Gym Management System</h3>
                    <p className="text-gray-600">123 Fitness Street</p>
                    <p className="text-gray-600">Dar es Salaam, Tanzania</p>
                    <p className="text-gray-600">+255 123 456 789</p>
                  </div>
                </div>

                {/* Bill To Section */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Bill To
                  </h2>
                  <div className="text-gray-800">
                    <h3 className="text-lg font-bold mb-1">{payment.memberName}</h3>
                    <p className="text-gray-600">{payment.memberEmail}</p>
                    {payment.memberPhone && (
                      <p className="text-gray-600">{payment.memberPhone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Payment Details
                </h2>
                <div className="border-t border-gray-200">
                  <div className="py-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {payment.planType.charAt(0).toUpperCase() + payment.planType.slice(1)} Membership
                      </h4>
                      <p className="text-sm text-gray-600">
                        {payment.planType === 'monthly' ? '1 Month' :
                         payment.planType === 'semi-annually' ? '6 Months' : '12 Months'} Access
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">
                        TZS {formatPrice(payment.amount)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-semibold text-gray-800">Total</div>
                    <div className="text-lg font-bold text-blue-600">
                      TZS {formatPrice(payment.amount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-gray-500 text-sm border-t border-gray-200 pt-8">
                <p>Thank you for your business!</p>
                <p className="mt-1">This is a computer-generated receipt and requires no signature.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
