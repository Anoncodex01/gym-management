import { Member } from '../../types/member.types';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export const memberService = {
  uploadProfileImage: async (file: File, memberId: string): Promise<string> => {
    const BUCKET_NAME = 'profile-images';
    
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    try {
      // Check if user is authenticated
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        console.error('Authentication error:', authError);
        throw new Error('You must be authenticated to upload images');
      }

      // Generate a unique filename using UUID
      const fileExt = file.name.split('.').pop();
      const uniqueId = uuidv4();
      let filePath = `${memberId}/${uniqueId}.${fileExt}`;

      // First, check if there's an existing image and delete it
      const { data: existingFiles, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(memberId);

      if (listError) {
        console.error('Error listing existing files:', listError);
        // Don't throw here, just continue with the upload
      }

      if (existingFiles && existingFiles.length > 0) {
        try {
          await Promise.all(
            existingFiles.map(file => 
              supabase.storage
                .from(BUCKET_NAME)
                .remove([`${memberId}/${file.name}`])
            )
          );
        } catch (removeError) {
          console.error('Error removing existing files:', removeError);
          // Don't throw here, just continue with the upload
        }
      }

      // Upload the new image
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        if (uploadError.message.includes('duplicate')) {
          // If it's a duplicate error, try with a new UUID
          const newUniqueId = uuidv4();
          filePath = `${memberId}/${newUniqueId}.${fileExt}`;
          const { error: retryError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type,
            });

          if (retryError) {
            console.error('Error on retry upload:', retryError);
            throw new Error('Failed to upload profile image after retry');
          }
        } else {
          throw new Error('Failed to upload profile image: ' + uploadError.message);
        }
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      // Update the member's profile_image field in the database
      const { error: updateError } = await supabase
        .from('members')
        .update({ profile_image: publicUrl })
        .eq('id', memberId);

      if (updateError) {
        console.error('Error updating profile image URL:', updateError);
        throw new Error('Failed to update profile image URL');
      }

      return publicUrl;
    } catch (error) {
      console.error('Error in uploadProfileImage:', error);
      // Re-throw with a more user-friendly message
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to upload profile image');
      }
    }
  },

  createMember: async (memberData: Omit<Member, 'id' | 'registrationDate' | 'status'>): Promise<Member> => {
    if (!memberData.fullName?.trim()) {
      throw new Error('Full name is required');
    }
    if (!memberData.email?.trim()) {
      throw new Error('Email is required');
    }
    if (!memberData.phoneNumber?.trim()) {
      throw new Error('Phone number is required');
    }

    // First check if email already exists
    const { data: existingMember } = await supabase
      .from('members')
      .select('email')
      .eq('email', memberData.email.trim())
      .maybeSingle();

    if (existingMember) {
      throw new Error('A member with this email already exists');
    }

    try {
      // Validate corporate membership
      if (memberData.membershipType === 'corporate' && !memberData.companyName) {
        throw new Error('Company name is required for corporate membership');
      }

      // Clean up empty strings and undefined values to null for optional fields
      const cleanField = (value: string | undefined): string | null => {
        return value?.trim() || null;
      };

      // Prepare member data with proper field handling
      const memberFields = {
        full_name: memberData.fullName.trim(),
        email: memberData.email.trim(),
        phone_number: memberData.phoneNumber.trim(),
        membership_type: memberData.membershipType,
        has_insurance: memberData.hasInsurance,
        registration_date: new Date().toISOString(),
        status: 'inactive',
        gender: cleanField(memberData.gender),
        birth_date: memberData.birthDate ? new Date(memberData.birthDate).toISOString() : null,
        address: cleanField(memberData.address),
        created_at: new Date().toISOString(),
        insurance_provider: memberData.hasInsurance ? cleanField(memberData.insuranceProvider) : null,
        insurance_member_id: memberData.hasInsurance ? cleanField(memberData.insuranceMemberId) : null,
        company_name: memberData.membershipType === 'corporate' ? cleanField(memberData.companyName) : null,
        profile_image: null // Initialize as null, will be updated if image is uploaded
      };

      // Log the transformed data being sent to Supabase
      console.log('Transformed memberFields for Supabase:', memberFields);

      // Create the member
      const { data, error } = await supabase
        .from('members')
        .insert([memberFields])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating member:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from member creation');
      }
      // Handle profile image upload if present
      let profileImageUrl = null;
      if (memberData.profileImage) {
        try {
          profileImageUrl = await memberService.uploadProfileImage(memberData.profileImage, data.id);
          
          // Update member with profile image URL
          const { error: updateError } = await supabase
            .from('members')
            .update({ profile_image: profileImageUrl })
            .eq('id', data.id);

          if (updateError) {
            console.error('Error updating profile image URL:', updateError);
            toast.error('Failed to update profile image');
          }
        } catch (uploadError) {
          console.error('Error handling profile image:', uploadError);
          toast.error('Failed to upload profile image');
        }
      }

      // Return the created member with proper type conversion
      return {
        id: data.id,
        fullName: data.full_name,
        email: data.email,
        phoneNumber: data.phone_number,
        membershipType: data.membership_type,
        hasInsurance: data.has_insurance,
        registrationDate: data.registration_date,
        status: data.status,
        gender: data.gender || undefined,
        birthDate: data.birth_date ? new Date(data.birth_date).toISOString() : undefined,
        address: data.address || undefined,
        insuranceProvider: data.insurance_provider || undefined,
        insuranceMemberId: data.insurance_member_id || undefined,
        companyName: data.company_name || undefined,
        profileImageUrl: profileImageUrl || data.profile_image,
        subscription: data.subscription
      };
    } catch (error: any) {
      console.error('Error creating member:', error);
      let errorMessage = 'Failed to create member';
      
      // Handle validation errors
      if (error.message === 'Full name is required' ||
          error.message === 'Email is required' ||
          error.message === 'Phone number is required') {
        errorMessage = error.message;
      }
      // Handle database constraint errors
      else if (error.code === '23505' && error.message.includes('members_email_key')) {
        errorMessage = 'A member with this email already exists';
      }
      else if (error.code === '23514') {
        if (error.message.includes('insurance_fields_check')) {
          errorMessage = 'Insurance provider and member ID are required when insurance is selected';
        } else if (error.message.includes('corporate_fields_check')) {
          errorMessage = 'Company name is required for corporate membership';
        } else if (error.message.includes('valid_gender')) {
          errorMessage = 'Invalid gender value';
        }
      }

      if (error.message === 'A member with this email already exists') {
        errorMessage = error.message;
      } else if (error.code === '23505' && error.message.includes('members_email_key')) {
        errorMessage = 'A member with this email already exists';
      } else if (error.message.includes('insurance_fields_check') || 
          error.message.includes('Insurance provider and member ID are required')) {
        errorMessage = 'Insurance provider and member ID are required when insurance is selected';
      } else if (error.message.includes('corporate_fields_check') || 
                 error.message.includes('Company name is required')) {
        errorMessage = 'Company name is required for corporate membership';
      }

      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  updateMemberSubscription: async (memberId: string, subscription: Member['subscription']): Promise<void> => {
    const { error } = await supabase
      .from('members')
      .update({
        subscription,
        status: 'active'
      })
      .eq('id', memberId);

    if (error) {
      console.error('Error updating member subscription:', error);
      throw new Error(error.message);
    }
  },

  getMemberById: async (memberId: string): Promise<Member | null> => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (error) {
      console.error('Error fetching member:', error);
      toast.error('Failed to fetch member details');
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      phoneNumber: data.phone_number,
      membershipType: data.membership_type,
      hasInsurance: data.has_insurance,
      registrationDate: new Date(data.registration_date).toISOString(),
      status: data.status,
      gender: data.gender || undefined,
      birthDate: data.birth_date ? new Date(data.birth_date).toISOString() : undefined,
      address: data.address || undefined,
      insuranceProvider: data.insurance_provider || undefined,
      insuranceMemberId: data.insurance_member_id || undefined,
      companyName: data.company_name || undefined,
      profileImageUrl: data.profile_image || undefined,
      subscription: data.subscription
    };
  },

  getAllMembers: async (): Promise<Member[]> => {
    const { data, error } = await supabase
      .from('members')
      .select(`
        id,
        full_name,
        email,
        phone_number,
        membership_type,
        has_insurance,
        registration_date,
        status,
        gender,
        birth_date,
        address,
        insurance_provider,
        insurance_member_id,
        company_name,
        profile_image,
        subscription
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching members:', error);
      throw new Error(error.message);
    }

    return data.map(member => ({
      id: member.id,
      fullName: member.full_name,
      email: member.email,
      phoneNumber: member.phone_number,
      membershipType: member.membership_type,
      hasInsurance: member.has_insurance,
      registrationDate: new Date(member.registration_date).toISOString(),
      status: member.status,
      gender: member.gender || undefined,
      birthDate: member.birth_date ? new Date(member.birth_date).toISOString() : undefined,
      address: member.address || undefined,
      insuranceProvider: member.insurance_provider || undefined,
      insuranceMemberId: member.insurance_member_id || undefined,
      companyName: member.company_name || undefined,
      profileImageUrl: member.profile_image,
      subscription: member.subscription
    }));
  },

  deleteMember: async (memberId: string): Promise<void> => {
    // First delete the profile image if it exists
    const member = await memberService.getMemberById(memberId);
    if (member?.profileImageUrl) {
      const fileName = member.profileImageUrl.split('/').pop();
      if (fileName) {
        const { error: deleteImageError } = await supabase.storage
          .from('profile-images')
          .remove([`${memberId}/${fileName}`]);

        if (deleteImageError) {
          console.error('Error deleting profile image:', deleteImageError);
        }
      }
    }

    // Then delete the member record
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error deleting member:', error);
      throw new Error(error.message);
    }
  },

  searchMembers: async (query: string): Promise<Member[]> => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone_number.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching members:', error);
      throw new Error(error.message);
    }

    return data.map(member => ({
      id: member.id,
      fullName: member.full_name,
      email: member.email,
      phoneNumber: member.phone_number,
      membershipType: member.membership_type,
      hasInsurance: member.has_insurance,
      registrationDate: member.registration_date,
      status: member.status,
      gender: member.gender || undefined,
      birthDate: member.birth_date ? new Date(member.birth_date).toISOString() : undefined,
      address: member.address || undefined,
      insuranceProvider: member.insurance_provider || undefined,
      insuranceMemberId: member.insurance_member_id || undefined,
      companyName: member.company_name || undefined,
      profileImageUrl: member.profile_image,
      subscription: member.subscription
    }));
  }
};