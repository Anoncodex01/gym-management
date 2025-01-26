import React, { useState, useEffect } from 'react';
import { Pass } from '../../types/pass.types';
import { format } from 'date-fns';

interface PassManagerProps {
  userId: string;
}

export const PassManager: React.FC<PassManagerProps> = ({ userId }) => {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPasses = async () => {
      try {
        const userPasses = await passService.getUserPasses(userId);
        setPasses(userPasses);
      } catch (error) {
        console.error('Failed to fetch passes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPasses();
  }, [userId]);

  const getStatusBadgeClass = (status: Pass['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'fully_used':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div>Loading passes...</div>;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium">Your Passes</h3>
      </div>

      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {passes.map((pass) => (
            <li key={pass.id} className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">
                    {pass.type === 'day' ? 'Day Pass' : '10-Day Pass'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Purchased: {format(new Date(pass.purchaseDate), 'MMM d, yyyy')}
                  </p>
                  {pass.type === 'ten_day' && (
                    <p className="text-sm text-gray-500">
                      Remaining visits: {pass.remainingVisits}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                      pass.status
                    )}`}
                  >
                    {pass.status.replace('_', ' ')}
                  </span>
                  {pass.status === 'active' && (
                    <span className="text-sm text-gray-500 mt-1">
                      Expires: {format(new Date(pass.expiryDate), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};