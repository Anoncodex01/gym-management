import React, { useState } from 'react';

interface InsuranceVerificationProps {
  onVerificationComplete: (insurance: UserInsurance) => void;
}

export const InsuranceVerification: React.FC<InsuranceVerificationProps> = ({
  onVerificationComplete
}) => {
  const [provider, setProvider] = useState<string>('');
  const [membershipNumber, setMembershipNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const insurance = await insuranceService.verifyInsurance(provider, membershipNumber);
      onVerificationComplete(insurance);
    } catch (err) {
      setError('Failed to verify insurance. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Insurance Provider
        </label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        >
          <option value="">Select Provider</option>
          <option value="assemble">Assemble</option>
          <option value="ragis">Ragis</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Membership Number
        </label>
        <input
          type="text"
          value={membershipNumber}
          onChange={(e) => setMembershipNumber(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Verify Insurance'}
      </button>
    </form>
  );
};