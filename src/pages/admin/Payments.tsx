import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { PaymentRegistrationFlow } from '../../components/payment/PaymentRegistrationFlow';
import { PaymentAnalytics } from '../../components/analytics/PaymentAnalytics';
import { PaymentHistory } from '../../components/payment/PaymentHistory';
import { receiptService } from '../../services/payment/receiptService';
import { exportService } from '../../services/payment/exportService';
import { CreditCard, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { PaymentStatus } from '../../components/payment/PaymentStatus';
import { billingConfig } from '../../services/payment/billingConfig';
import toast from 'react-hot-toast';

export const PaymentsPage: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    membershipType: 'single' | 'couple' | 'corporate';
    hasInsurance: boolean;
  } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  // Mock data for demonstration
  const recentPayments = [
    {
      id: '1',
      memberName: 'John Doe',
      amount: 50000,
      date: '2024-03-15',
      status: 'completed',
      method: 'M-Pesa'
    },
    {
      id: '2',
      memberName: 'Jane Smith',
      amount: 80000,
      date: '2024-03-14',
      status: 'pending',
      method: 'Airtel Money'
    }
  ];

  const paymentMetrics = {
    totalRevenue: 1250000,
    monthlyRecurring: 950000,
    outstandingPayments: 125000,
    paymentsByMethod: [
      { method: 'M-Pesa', amount: 450000 },
      { method: 'Airtel Money', amount: 350000 },
      { method: 'Mix by Yas', amount: 250000 },
      { method: 'Card', amount: 150000 }
    ],
    recentTransactions: [
      { date: '2024-03-01', amount: 125000, method: 'M-Pesa' },
      { date: '2024-03-02', amount: 95000, method: 'Airtel Money' },
      { date: '2024-03-03', amount: 150000, method: 'M-Pesa' },
      { date: '2024-03-04', amount: 85000, method: 'Mix by Yas' },
      { date: '2024-03-05', amount: 110000, method: 'Card' }
    ]
  };

  const handlePaymentComplete = () => {
    toast.success('Payment link sent successfully');
    setSelectedMember(null);
    setCurrentOrderId(null);
  };

  const handlePaymentInitiated = (orderId: string) => {
    setCurrentOrderId(orderId);
  };
  
  const handleGenerateReceipt = async (paymentId: string) => {
    try {
      await receiptService.generateReceipt(paymentId);
    } catch (error) {
      console.error('Failed to generate receipt:', error);
      toast.error('Failed to generate receipt');
    }
  };

  const handleBatchReceipts = async (paymentIds: string[]) => {
    try {
      await receiptService.generateBatchReceipts(paymentIds);
      toast.success('Batch receipts generated successfully');
    } catch (error) {
      console.error('Failed to generate batch receipts:', error);
      toast.error('Failed to generate batch receipts');
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const payments = []; // Replace with actual payment data
      if (format === 'csv') {
        await exportService.exportToCSV(payments);
      } else {
        await exportService.exportToExcel(payments);
      }
      toast.success(`Payments exported to ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to export payments:', error);
      toast.error('Failed to export payments');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <button
          onClick={() => setShowPaymentModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Payment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Today's Revenue</p>
              <p className="text-2xl font-bold">TZS 450,000</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Pending Payments</p>
              <p className="text-2xl font-bold">15</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-500">Failed Payments</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Payments</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="settings">Payment Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6">
            <PaymentAnalytics metrics={paymentMetrics} />
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Recent Payments</h3>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{payment.memberName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">TZS {payment.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{payment.method}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <PaymentHistory
            onGenerateReceipt={handleGenerateReceipt}
            onBatchReceipts={handleBatchReceipts}
            onExport={handleExport}
          />
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Payment Settings</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Base Pricing (TZS)</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {billingConfig.frequencies.map(frequency => (
                    <div key={frequency.type} className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-500 capitalize">{frequency.type} Payment</p>
                      <p className="text-2xl font-bold">
                        TZS {frequency.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Frequency Discounts</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {billingConfig.frequencies.map((freq) => (
                    <div key={freq.type} className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-500 capitalize">{freq.type}</p>
                      <p className="text-xl font-bold">TZS {freq.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Day Passes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-500">Single Day Pass</p>
                    <p className="text-xl font-bold">
                      TZS {billingConfig.dayPassPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-500">10-Day Pass</p>
                    <p className="text-xl font-bold">
                      TZS {billingConfig.tenDayPassPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Payment Status Modal */}
      {currentOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <PaymentStatus
              orderId={currentOrderId}
              onSuccess={handlePaymentComplete}
              onFailure={() => setCurrentOrderId(null)}
            />
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Create Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>

            <PaymentRegistrationFlow
              onPaymentComplete={() => {
                setShowPaymentModal(false);
                handlePaymentComplete();
              }}
              onPaymentInitiated={handlePaymentInitiated}
            />
          </div>
        </div>
      )}
    </div>
  );
};