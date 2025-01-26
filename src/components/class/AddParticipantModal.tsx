import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface AddParticipantModalProps {
  onClose: () => void;
  onAdd: (memberId: string, paymentAmount: number) => Promise<void>;
  classPrice: number;
}

interface Member {
  id: string;
  full_name: string;
  email: string;
  membership_status: string;
}

export const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  onClose,
  onAdd,
  classPrice
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(classPrice);
  const [loading, setLoading] = useState(false);

  const searchMembers = async (query: string) => {
    if (query.length < 2) {
      setMembers([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, full_name, email, membership_status')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .eq('status', 'active')
        .limit(5);

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error searching members:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setLoading(true);
    try {
      await onAdd(selectedMember.id, paymentAmount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Add Participant</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Member
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchMembers(e.target.value);
              }}
              placeholder="Search by name or email"
              className="w-full px-3 py-2 border rounded-md"
            />

            {members.length > 0 && !selectedMember && (
              <div className="mt-2 border rounded-md divide-y">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="p-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedMember(member);
                      setMembers([]);
                      setSearchQuery(member.full_name);
                    }}
                  >
                    <p className="font-medium">{member.full_name}</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedMember && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Amount
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedMember || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Participant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
