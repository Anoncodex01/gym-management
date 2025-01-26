import React, { useState } from 'react';
import { InsuranceProvider } from '../../types/membership.types';

export const InsuranceSelection: React.FC = () => {
  const [hasInsurance, setHasInsurance] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  const insuranceProviders: InsuranceProvider[] = [
    { id: '1', name: 'Assemble', description: 'Assemble Health Insurance' },
    { id: '2', name: 'Ragis', description: 'Ragis Health Insurance' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Insurance Information</h3>
        <div className="mt-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={hasInsurance}
              onChange={(e) => setHasInsurance(e.target.checked)}
            />
            <span className="ml-2">I have health insurance</span>
          </label>
        </div>
      </div>

      {hasInsurance && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Select Insurance Provider
          </label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Select a provider</option>
            {insuranceProviders.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
            <option value="other">Other</option>
          </select>
        </div>
      )}
    </div>
  );
};