import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PaymentStatusProps {
  orderId: string;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ 
  orderId,
  onSuccess,
  onFailure
}) => {
  const [status, setStatus] = useState<string>('pending');
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/${orderId}/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.status === 'succeeded') {
          setStatus('success');
          toast.dismiss('payment-status');
          onSuccess?.();
          toast.success('Payment successful!');
        } else if (data.status === 'failed') {
          setStatus('failed');
          toast.dismiss('payment-status');
          onFailure?.();
          toast.error('Payment failed. Please try again.');
        } else {
          // Continue polling if payment is still pending
          setTimeout(checkStatus, 5000); // Poll every 5 seconds
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('failed');
        toast.dismiss('payment-status');
        onFailure?.();
      }
    };

    // Show initial loading toast
    toast.loading('Processing payment...', { id: 'payment-status' });
    checkStatus();

    // Cleanup on unmount
    return () => {
      toast.dismiss('payment-status');
    };
  }, [orderId, onSuccess, onFailure]);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {status === 'pending' && (
        <>
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          <p className="text-lg font-medium">Processing your payment...</p>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle className="w-16 h-16 text-green-500" />
          <p className="text-lg font-medium">Payment successful!</p>
        </>
      )}
      {status === 'failed' && (
        <>
          <XCircle className="w-16 h-16 text-red-500" />
          <p className="text-lg font-medium">Payment failed</p>
          <button
            onClick={() => navigate('/payment')}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
};