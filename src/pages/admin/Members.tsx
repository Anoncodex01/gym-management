import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, X, User } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { toast } from 'react-hot-toast';
import { MemberSignIn } from '../../components/attendance/MemberSignIn';
import { useDebounce } from '../../hooks/useDebounce';
import { PaymentRegistrationFlow } from '../../components/payment/PaymentRegistrationFlow';
import { memberService } from '../../services/member/memberService';
import { Member } from '../../types/member.types';

interface NewMember {
  fullName: string;
  phoneNumber: string;
  membershipType: 'single' | 'couple' | 'corporate';
  companyName?: string;
  email: string;
  profileImage?: File;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  address?: string;
  insuranceStatus: boolean;
  insuranceCompany?: string;
  insuranceMemberId?: string;
}

export const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState<NewMember>({
    fullName: '',
    phoneNumber: '',
    email: '',
    membershipType: 'single',
    insuranceStatus: false,
    insuranceCompany: '',
    insuranceMemberId: ''
  });
  const [errors, setErrors] = useState<Partial<NewMember>>({});
  const [previewImage, setPreviewImage] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewMember, setViewMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const insuranceCompanies = [
    { id: 'strategies', name: 'Strategies Insurance' },
    { id: 'assemble', name: 'Assemble Insurance' },
    { id: 'jubilee', name: 'Jubilee Insurance' }
  ];

  const membershipTypes = [
    {
      type: 'single',
      name: 'Single Membership',
      description: 'Individual membership for one person'
    },
    {
      type: 'couple',
      name: 'Couple Membership',
      description: 'Discounted membership for two people'
    },
    {
      type: 'corporate',
      name: 'Corporate Membership',
      description: 'Special membership for employees of partner companies'
    }
  ];

  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      try {
        const allMembers = await memberService.getAllMembers();
        setMembers(allMembers);
        setFilteredMembers(allMembers);
      } catch (error) {
        console.error('Failed to load members:', error);
        toast.error('Failed to load members');
      } finally {
        setLoading(false);
      }
    };
    loadMembers();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const filtered = members.filter(member => 
        member.fullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [debouncedSearchTerm, members]);

  const validateForm = () => {
    const newErrors: Partial<NewMember> = {};
    
    if (!newMember.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!newMember.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newMember.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!newMember.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    
    if (!newMember.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (!newMember.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    }
    
    if (!newMember.membershipType) {
      newErrors.membershipType = 'Membership type is required';
    }

    if (newMember.membershipType === 'corporate' && !newMember.companyName) {
      newErrors.companyName = 'Company name is required for corporate membership';
    }
    
    if (newMember.insuranceStatus) {
      if (!newMember.insuranceCompany) {
        newErrors.insuranceCompany = 'Insurance company is required';
      }
      if (!newMember.insuranceMemberId) {
        newErrors.insuranceMemberId = 'Insurance member ID is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setNewMember({ ...newMember, profileImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const member = await memberService.createMember({
        fullName: newMember.fullName,
        email: newMember.email,
        phoneNumber: newMember.phoneNumber,
        membershipType: newMember.membershipType,
        gender: newMember.gender,
        birthDate: newMember.birthDate,
        address: newMember.address,
        hasInsurance: newMember.insuranceStatus,
        insuranceProvider: newMember.insuranceCompany,
        insuranceMemberId: newMember.insuranceMemberId,
        companyName: newMember.companyName,
        profileImage: newMember.profileImage
      });

      setSelectedMember(member);
      setShowAddModal(false);
      toast.success('Member created successfully');

      // Reset form
      setNewMember({
        fullName: '',
        phoneNumber: '',
        email: '',
        membershipType: 'single',
        insuranceStatus: false,
        insuranceCompany: '',
        insuranceMemberId: ''
      });
      setPreviewImage('');
      
    } catch (error) {
      console.error('Failed to create member:', error);
      toast.error('Failed to create member');
    }
  };

  const handlePaymentComplete = async () => {
    if (selectedMember) {
      toast.success('Payment completed successfully');
      setSelectedMember(null);
      
      // Refresh member list
      const allMembers = await memberService.getAllMembers();
      setMembers(allMembers);
      setFilteredMembers(allMembers);
    }
  };

  const handleViewMember = async (memberId: string) => {
    try {
      const member = await memberService.getMemberById(memberId);
      if (member) {
        setViewMember(member);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch member details:', error);
      toast.error('Failed to load member details');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      try {
        await memberService.deleteMember(memberId);
        toast.success('Member deleted successfully');
        const allMembers = await memberService.getAllMembers();
        setMembers(allMembers);
        setFilteredMembers(allMembers);
      } catch (error) {
        console.error('Failed to delete member:', error);
        toast.error('Failed to delete member');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Members Management</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
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
          {searchTerm && (
            <div className="absolute mt-1 w-full text-sm text-gray-500">
              Found {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
            </div>
          )}
        </div>
        <button className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Membership
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Join Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Loading members...
                </td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No members found
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {member.profileImageUrl ? (
                          <img
                            src={member.profileImageUrl}
                            alt={member.fullName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium text-lg">
                              {member.fullName?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.fullName}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{member.membershipType}</div>
                    {member.hasInsurance && (
                      <span className="text-xs text-blue-600">Insurance</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.registrationDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewMember(member.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add New Member</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image Upload */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="profile-image"
                    />
                    <label
                      htmlFor="profile-image"
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 cursor-pointer inline-block transition-colors duration-200"
                    >
                      Choose Image
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newMember.fullName}
                    onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newMember.phoneNumber}
                    onChange={(e) => setNewMember({ ...newMember, phoneNumber: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    value={newMember.gender || ''}
                    onChange={(e) => setNewMember({ 
                      ...newMember, 
                      gender: e.target.value as 'male' | 'female' | 'other' | undefined 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Date *
                  </label>
                  <input
                    type="date"
                    value={newMember.birthDate || ''}
                    onChange={(e) => setNewMember({ ...newMember, birthDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.birthDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.birthDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.birthDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address (Optional)
                  </label>
                  <textarea
                    value={newMember.address || ''}
                    onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                    rows={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Membership Type Selection */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Membership Type *</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {membershipTypes.map((membership) => (
                    <div
                      key={membership.type}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
                        newMember.membershipType === membership.type
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200'
                      }`}
                      onClick={() => setNewMember({
                        ...newMember,
                        membershipType: membership.type as 'single' | 'couple' | 'corporate'
                      })}
                    >
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          checked={newMember.membershipType === membership.type}
                          onChange={() => {}}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 font-medium">{membership.name}</span>
                      </div>
                      <p className="text-sm text-gray-500">{membership.description}</p>
                    </div>
                  ))}
                </div>
                {errors.membershipType && (
                  <p className="mt-2 text-sm text-red-500">{errors.membershipType}</p>
                )}
              </div>

              {/* Company Name for Corporate Membership */}
              {newMember.membershipType === 'corporate' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={newMember.companyName || ''}
                    onChange={(e) => setNewMember({
                      ...newMember,
                      companyName: e.target.value
                    })}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.companyName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter company name"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
                  )}
                </div>
              )}

              {/* Insurance Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="w-full">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={newMember.insuranceStatus}
                      onChange={(e) => setNewMember({
                        ...newMember,
                        insuranceStatus: e.target.checked,
                        insuranceCompany: e.target.checked ? newMember.insuranceCompany : '',
                        insuranceMemberId: e.target.checked ? newMember.insuranceMemberId : ''
                      })}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Member has health insurance
                    </label>
                  </div>

                  {newMember.insuranceStatus && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Insurance Company *
                        </label>
                        <select
                          value={newMember.insuranceCompany}
                          onChange={(e) => setNewMember({
                            ...newMember,
                            insuranceCompany: e.target.value
                          })}
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors.insuranceCompany ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select insurance company</option>
                          {insuranceCompanies.map(company => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          ))}
                        </select>
                        {errors.insuranceCompany && (
                          <p className="mt-1 text-sm text-red-500">{errors.insuranceCompany}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Insurance Member ID *
                        </label>
                        <input
                          type="text"
                          value={newMember.insuranceMemberId}
                          onChange={(e) => setNewMember({
                            ...newMember,
                            insuranceMemberId: e.target.value
                          })}
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors.insuranceMemberId ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter insurance member ID"
                        />
                        {errors.insuranceMemberId && (
                          <p className="mt-1 text-sm text-red-500">{errors.insuranceMemberId}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Member Modal */}
      {showViewModal && viewMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Member Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewMember(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {viewMember.profileImageUrl ? (
                    <img
                      src={viewMember.profileImageUrl}
                      alt={viewMember.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{viewMember.fullName}</h3>
                  <p className="text-gray-500">{viewMember.email}</p>
                  <p className="text-gray-500">{viewMember.phoneNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 mb-6">
                  <MemberSignIn
                    memberId={viewMember.id}
                    memberName={viewMember.fullName}
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-500">Membership Type</p>
                  <p className="font-medium capitalize">{viewMember.membershipType}</p>
                </div>
                <div>
                 Continuing the Members.tsx file content exactly where we left off:

```
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    viewMember.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {viewMember.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium capitalize">{viewMember.gender || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Birth Date</p>
                  <p className="font-medium">
                    {viewMember.birthDate
                      ? new Date(viewMember.birthDate).toLocaleDateString()
                      : 'Not specified'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{viewMember.address || 'Not specified'}</p>
                </div>
              </div>

              {viewMember.hasInsurance && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Insurance Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Insurance Provider</p>
                      <p className="font-medium">{viewMember.insuranceProvider}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member ID</p>
                      <p className="font-medium">{viewMember.insuranceMemberId}</p>
                    </div>
                  </div>
                </div>
              )}

              {viewMember.membershipType === 'corporate' && viewMember.companyName && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Corporate Information</h4>
                  <p className="text-sm text-gray-500">Company Name</p>
                  <p className="font-medium">{viewMember.companyName}</p>
                </div>
              )}

              {viewMember.subscription && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Subscription Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium capitalize">{viewMember.subscription.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-medium">TZS {viewMember.subscription.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">
                        {new Date(viewMember.subscription.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="font-medium">
                        {new Date(viewMember.subscription.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Complete Registration</h2>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <PaymentRegistrationFlow onPaymentComplete={handlePaymentComplete} />
          </div>
        </div>
      )}
    </div>
  );
};