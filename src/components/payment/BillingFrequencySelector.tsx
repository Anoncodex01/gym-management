import React from 'react';
import { billingConfig } from '../../services/payment/billingConfig';
import { Clock, Calendar, CalendarDays, CreditCard } from 'lucide-react';
import { BillingFrequency } from '../../types/payment.types';

interface BillingFrequencySelectorProps {
  value: string;
  onChange: (frequency: string) => void;
  membershipType: 'single' | 'couple' | 'corporate';
  hasInsurance: boolean;
}

export const BillingFrequencySelector: React.FC<BillingFrequencySelectorProps> = ({
  value,
  onChange,
  membershipType,
  hasInsurance
}) => {
  const calculatePrice = (amount: number) => {
    let price = amount;
    if (hasInsurance) {
      price = price * (1 - billingConfig.insuranceDiscount / 100);
    }
    return price;
  };

  const getIcon = (type: BillingFrequency['type']) => {
    switch (type) {
      case 'monthly':
        return <Clock className="w-6 h-6" />;
      case 'quarterly':
        return <Calendar className="w-6 h-6" />;
      case 'semi-annually':
        return <CalendarDays className="w-6 h-6" />;
      case 'annually':
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Billing Frequency</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {billingConfig.frequencies.map((frequency) => {
          const finalPrice = calculatePrice(frequency.amount);
          return (
            <button
              key={frequency.type}
              onClick={() => onChange(frequency.type)}
              className={`flex flex-col p-6 rounded-lg border-2 transition-all ${
                value === frequency.type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                {getIcon(frequency.type)}
                <span className="text-lg font-medium capitalize">
                  {frequency.type.replace('-', ' ')}
                </span>
              </div>
              <div className="mt-auto">
                <div className="text-blue-600 font-bold">
                  TZS {formatPrice(finalPrice)}
                </div>
                {frequency.discountPercentage > 0 && (
                  <div className="text-sm text-green-600">
                    Save {frequency.discountPercentage}%
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};