import { useState } from 'react';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';
import { Member } from '../../types/member.types';
import { GymPackage, gymPackages } from '../../types/package.types';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { PaymentReceipt } from './PaymentReceipt';
import { PaymentDetails } from '../../types/payment';
import { CheckCircle } from 'lucide-react';

interface PaymentRegistrationFlowProps {
  member: Member;
}

const durationDisplay = {
  'monthly': '1 Month',
  'semi-annually': '6 Months',
  'annually': '12 Months'
} as const;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export function PaymentRegistrationFlow({ member }: PaymentRegistrationFlowProps) {
  const [selectedPackage, setSelectedPackage] = useState<GymPackage | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  const handlePayment = async () => {
    if (!selectedPackage) {
      toast.error('Please select a package');
      return;
    }

    setIsProcessing(true);
    try {
      const endDate = new Date();
      switch (selectedPackage.duration) {
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'semi-annually':
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        case 'annually':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }

      // Demo mode: Simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 1000));

      const demoPaymentDetails: PaymentDetails = {
        amount: selectedPackage.price,
        planType: selectedPackage.duration,
        orderId: `DEMO-${Date.now()}`,
        date: new Date(),
        memberName: member.fullName,
        memberEmail: member.email,
        memberPhone: member.phoneNumber
      };

      setPaymentDetails(demoPaymentDetails);
      setShowSuccess(true);

      // Wait 2 seconds before showing receipt
      setTimeout(() => {
        setShowSuccess(false);
        setShowReceipt(true);
      }, 2000);

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (showReceipt && paymentDetails) {
    return <PaymentReceipt payment={paymentDetails} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 relative">
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 transform animate-fade-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">Your payment has been processed successfully.</p>
              <p className="text-sm text-gray-500">Redirecting to receipt...</p>
            </div>
          </div>
        </div>
      )}

      {/* Member Information */}
      <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
        <div className="bg-primary/5 p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarImage src={member.profileImageUrl || undefined} />
              <AvatarFallback className="text-lg bg-primary/10">
                {member.fullName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{member.fullName}</h2>
              <p className="text-gray-500">{member.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Package Selection */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-6">Select Membership Package</h3>
        <div className="grid grid-cols-3 gap-6">
          {gymPackages.map((pkg) => (
            <button
              key={pkg.id}
              type="button"
              className={`relative overflow-hidden rounded-xl transition-all shadow-lg hover:shadow-xl ${
                selectedPackage?.id === pkg.id
                  ? 'bg-primary text-primary-foreground scale-105'
                  : 'bg-white hover:scale-102'
              }`}
              onClick={() => setSelectedPackage(pkg)}
            >
              <div className="p-6">
                <div className="text-center">
                  <div className={`text-lg font-medium mb-2 ${
                    selectedPackage?.id === pkg.id ? 'text-primary-foreground' : ''
                  }`}>
                    {durationDisplay[pkg.duration]}
                  </div>
                  <div className={`text-2xl font-bold mb-4 ${
                    selectedPackage?.id === pkg.id ? 'text-primary-foreground' : ''
                  }`}>
                    TZS {formatPrice(pkg.price)}
                  </div>
                  {pkg.discountPercentage && (
                    <>
                      <div className={`text-sm ${
                        selectedPackage?.id === pkg.id 
                          ? 'text-primary-foreground/90' 
                          : 'text-primary'
                      }`}>
                        Save {pkg.discountPercentage}%
                      </div>
                      <div className="mt-1 text-sm text-gray-500 line-through">
                        TZS {formatPrice(pkg.price / (1 - pkg.discountPercentage / 100))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {selectedPackage?.id === pkg.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-foreground/20" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Summary */}
      {selectedPackage && (
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Payment Summary</h3>
            <div className="flex justify-between items-center">
              <div className="text-gray-500">Total Amount:</div>
              <div className="text-3xl font-bold text-primary">
                TZS {formatPrice(selectedPackage.price)}
              </div>
              {selectedPackage.discountPercentage && (
                <div className="text-sm text-primary">
                  You save TZS {formatPrice(selectedPackage.price * (selectedPackage.discountPercentage / 100))}
                </div>
              )}
            </div>
          </div>
          
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full h-12 text-lg font-medium shadow-lg hover:shadow-xl"
          >
            {isProcessing ? 'Processing Payment...' : 'Complete Payment'}
          </Button>
        </div>
      )}
    </div>
  );
}