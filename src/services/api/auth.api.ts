import axios from 'axios';
import { RegisterFormData } from '../types/auth.types';

const API_URL = process.env.REACT_APP_API_URL;

export const authApi = {
  register: async (data: RegisterFormData) => {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
  }
};