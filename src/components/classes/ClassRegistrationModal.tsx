import React, { useState } from 'react';
import { GymClass } from '../../types/class.types';

interface ClassRegistrationModalProps {
  gymClass: GymClass;
  onRegister: (useInsurance: boolean) => Promise<void>;
  onClose: () => void;
}

export const ClassRegistrationModal: React.FC<ClassRegistrationModalProps> = ({
  gymClass,
  onRegister,
  onClose,
}) => {
  const [useInsurance, setUseInsurance] = useState(false);
  const [registering, setRegistering] = useState(false);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await onRegister(useInsurance);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-medium mb-4">{gymClass.name}</h3>
        
        <div className="space-y-4">
          <p>{gymClass.description}</p>
          
          <div className="text-sm text-gray-600">
            <div>Instructor: {gymClass.instructor}</div>
            <div>Time: {format(new Date(gymClass.startTime), 'h:mm a')}</div>
            <div>Room: {gymClass.room}</div>
          </div>

          {gymClass.requiresInsurance && (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={useInsurance}
                onChange={(e) => setUseInsurance(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Use insurance for this class
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleRegister}
              disabled={registering}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
            >
              {registering ? 'Registering...' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};