import React, { useState } from 'react';
import { PassType } from '../../types/pass.types';

interface PassPurchaseProps {
  onPurchaseComplete: (pass: Pass) => void;
}

export const PassPurchase: React.FC<PassPurchaseProps> = ({ onPurchaseComplete }) => {
  const [selectedType, setSelectedType] = useState<PassType>('day');
  const [loading, setLoading] = useState(false);

  const passTypes = {
    day: {
      name: 'Day Pass',
      price: 15,
      description: 'Access to gym facilities for one day',
    },
    ten_day: {
      name: '10-Day Pass',
      price: 120,
      description: 'Access to gym facilities for any 10 days within 30 days',
    },
  };

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const userId = 'current-user-id'; // Get from auth context
      const pass = await passService.purchasePass(userId, selectedType);
      onPurchaseComplete(pass);
    } catch (error) {
      console.error('Failed to purchase pass:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium mb-6">Purchase Pass</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.entries(passTypes).map(([type, details]) => (
          <div
            key={type}
            className={`border rounded-lg p-4 cursor-pointer ${
              selectedType === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setSelectedType(type as PassType)}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{details.name}</h3>
              <span className="text-lg font-bold">${details.price}</span>
            </div>
            <p className="text-sm text-gray-600">{details.description}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Purchase Pass'}
      </button>
    </div>
  );
};