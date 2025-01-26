export interface RegisterFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: Date;
  address?: string;
  insuranceStatus: boolean;
}