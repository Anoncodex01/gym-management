import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { PaymentMethod } from '../../types/payment.types';

interface PaymentMethodSelectorProps {
  onSelect: (method: {
    type: PaymentMethod['type'];
    contact?: { type: 'sms' | 'email'; value: string };
  }) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ onSelect }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod['type']>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    onSelect({
      type: selectedMethod,
      contact: { type: 'sms', value: phoneNumber }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Enter Payment Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedMethod('mpesa')}
                className={`p-4 border rounded-lg flex items-center space-x-2 ${
                  selectedMethod === 'mpesa' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <Phone className="w-5 h-5" />
                <span>M-Pesa</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('airtel')}
                className={`p-4 border rounded-lg flex items-center space-x-2 ${
                  selectedMethod === 'airtel' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <Phone className="w-5 h-5" />
                <span>Airtel Money</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('halopesa')}
                className={`p-4 border rounded-lg flex items-center space-x-2 ${
                  selectedMethod === 'halopesa' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <Phone className="w-5 h-5" />
                <span>HaloPesa</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('mix_by_yas')}
                className={`p-4 border rounded-lg flex items-center space-x-2 ${
                  selectedMethod === 'mix_by_yas' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <Phone className="w-5 h-5" />
                <span>Mix by YAS</span>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <div className="mt-1">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., +255XXXXXXXXX"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Format: +255XXXXXXXXX or 0XXXXXXXXX
              </p>
            </div>
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={!phoneNumber}
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        Proceed with Payment
      </button>
    </form>
  );
};