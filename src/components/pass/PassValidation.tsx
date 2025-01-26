import React, { useState } from 'react';

interface PassValidationProps {
  onValidation: (isValid: boolean) => void;
}

export const PassValidation: React.FC<PassValidationProps> = ({ onValidation }) => {
  const [passId, setPassId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    try {
      const isValid = await passService.validatePass(passId);
      onValidation(isValid);
    } catch (error) {
      console.error('Failed to validate pass:', error);
      onValidation(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex space-x-4">
      <input
        type="text"
        value={passId}
        onChange={(e) => setPassId(e.target.value)}
        placeholder="Enter pass ID"
        className="flex-1 rounded-md border-gray-300 shadow-sm"
      />
      <button
        onClick={handleValidate}
        disabled={loading || !passId}
        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Validating...' : 'Validate Pass'}
      </button>
    </div>
  );
};