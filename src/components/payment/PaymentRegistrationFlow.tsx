import React, { useState, useEffect } from 'react';
import { BillingFrequencySelector } from './BillingFrequencySelector';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { billingConfig } from '../../services/payment/billingConfig';
import { memberService } from '../../services/member/memberService';
import { Search, X, Clock } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';
import { Member, PaymentMethod } from '../../types/payment.types';

interface PaymentRegistrationFlowProps {
  onPaymentComplete?: () => void;
  onPaymentInitiated?: (orderId: string) => void;
}

export const PaymentRegistrationFlow: React.FC<PaymentRegistrationFlowProps> = ({
  onPaymentComplete,
  onPaymentInitiated
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [step, setStep] = useState<'frequency' | 'payment'>('frequency');
  const [frequency, setFrequency] = useState('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMembers = async () => {
      const allMembers = await memberService.getAllMembers();
      setMembers(allMembers);
    };
    loadMembers();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const filtered = members.filter(member => 
        member.fullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers([]);
    }
  }, [debouncedSearchTerm, members]);

  const handleFrequencySelect = (selectedFrequency: string) => {
    setFrequency(selectedFrequency);
    setStep('payment');
  };

  const handlePaymentMethodSelect = async (method: {
    type: PaymentMethod['type'];
    contact?: { type: 'sms' | 'email'; value: string };
  }) => {
    setLoading(true);
    try {
      if (!selectedMember) {
        throw new Error('Please select a member');
      }

      if (!method.contact?.value) {
        throw new Error('Contact information is required');
      }

      const contactValue = method.contact.value.trim();
      if (!contactValue) {
        throw new Error('Contact information cannot be empty');
      }

      // Validate phone number format for mobile money payments
      if (!contactValue.match(/^(\+255|0)\d{9}$/)) {
        throw new Error('Invalid phone number format. Please use format: +255XXXXXXXXX or 0XXXXXXXXX');
      }

      // Calculate payment amount
      const selectedFrequency = billingConfig.frequencies.find(f => f.type === frequency);
      
      if (!selectedFrequency) {
        throw new Error('Invalid billing frequency');
      }

      let finalPrice = selectedFrequency.amount;
      
      if (selectedMember.hasInsurance) {
        finalPrice = finalPrice * (1 - billingConfig.insuranceDiscount / 100);
      }

      const totalAmount = finalPrice;

      try {
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        // Make direct request to Zeno Africa API
        const requestData = new URLSearchParams({
          create_order: '1',
          api_key: import.meta.env.VITE_ZENO_PAY_API_KEY,
          account_id: import.meta.env.VITE_ZENO_PAY_ACCOUNT_ID,
          secret_key: import.meta.env.VITE_ZENO_PAY_SECRET_KEY,
          amount: totalAmount.toString(),
          buyer_name: selectedMember.fullName,
          buyer_email: selectedMember.email,
          buyer_phone: method.contact.value,
          order_reference: orderId,
          webhook_url: `${import.meta.env.VITE_API_URL}/webhooks/zenopay`,
          payment_method: method.type,
          currency: 'TZS'
        });

        const response = await fetch('https://api.zeno.africa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: requestData
        });

        const paymentData = await response.json();

        if (!response.ok || paymentData.status !== 'success') {
          throw new Error(paymentData.message || 'Failed to initialize payment');
        }

        // Store payment details locally
        const paymentDetails = {
          orderId,
          amount: totalAmount,
          customerName: selectedMember.fullName,
          customerEmail: selectedMember.email,
          customerPhone: method.contact.value,
          paymentMethod: method.type,
          membershipType: selectedMember.membershipType,
          zenoPayOrderId: paymentData.order_id,
          paymentStatus: 'pending'
        };

        // Store payment details in localStorage for now
        // In production, you should implement proper database storage
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        payments.push(paymentDetails);
        localStorage.setItem('payments', JSON.stringify(payments));

        // If payment URL is provided, redirect user
        if (paymentData.payment_url) {
          window.location.href = paymentData.payment_url;
        }
        
        onPaymentInitiated?.(orderId);
        onPaymentComplete?.();
        
        // Show success message with payment instructions
        toast.success('Payment initialized successfully! Please follow the instructions to complete your payment.');
        
      } catch (error) {
        console.error('Payment error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to process payment');
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create Payment</h1>

      {selectedMember && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Creating payment for:</p>
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium">{selectedMember.fullName}</p>
            <button
              onClick={() => setSelectedMember(null)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Change Member
            </button>
          </div>
        </div>
      )}

      {!selectedMember ? (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search members by name or email..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          {filteredMembers.length > 0 && (
            <div className="border rounded-lg divide-y">
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{member.fullName}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {member.membershipType}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {step === 'frequency' && (
            <BillingFrequencySelector
              value={frequency}
              onChange={handleFrequencySelect}
              membershipType={selectedMember.membershipType}
              hasInsurance={selectedMember.hasInsurance}
            />
          )}
          
          {step === 'payment' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('frequency')}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>Back to frequency selection</span>
              </button>
              <PaymentMethodSelector onSelect={handlePaymentMethodSelect} />
            </div>
          )}
        </>
      )}
    </div>
  );
};