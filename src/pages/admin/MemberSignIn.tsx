import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { MemberSignIn } from '../../components/attendance/MemberSignIn';
import { memberService } from '../../services/member/memberService';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { toast } from 'react-hot-toast';

export const MemberSignInPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [loading, setLoading] = useState(false);

  // Search for members
  React.useEffect(() => {
    const searchMembers = async () => {
      if (debouncedSearchTerm.length < 3) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const results = await memberService.searchMembers(debouncedSearchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error('Failed to search members:', error);
        toast.error('Failed to search members');
      } finally {
        setLoading(false);
      }
    };

    searchMembers();
  }, [debouncedSearchTerm]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Member Sign In</h1>

      {!selectedMember ? (
        <Card className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search member by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {loading && (
            <div className="mt-4 text-center text-gray-500">
              Searching...
            </div>
          )}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((member) => (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{member.fullName}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchTerm.length >= 3 && searchResults.length === 0 && (
            <p className="mt-4 text-center text-gray-500">No members found</p>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedMember(null)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to search
          </button>

          <MemberSignIn
            memberId={selectedMember.id}
            memberName={selectedMember.fullName}
          />
        </div>
      )}
    </div>
  );
};