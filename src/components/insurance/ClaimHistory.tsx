import React, { useState, useEffect } from 'react';
import { InsuranceClaim } from '../../types/insurance.types';
import { format } from 'date-fns';

interface ClaimHistoryProps {
  userId: string;
}

export const ClaimHistory: React.FC<ClaimHistoryProps> = ({ userId }) => {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const claimHistory = await insuranceService.getClaimHistory(userId);
        setClaims(claimHistory);
      } catch (error) {
        console.error('Failed to fetch claims:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [userId]);

  if (loading) {
    return <div>Loading claim history...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Claim History</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {claims.map((claim) => (
              <tr key={claim.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(claim.visitDate), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {claim.serviceType === 'gym_visit' ? 'Gym Visit' : 'Class Attendance'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${claim.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                    claim.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};