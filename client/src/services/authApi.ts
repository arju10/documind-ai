import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface IAuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export const registerUser = async (
  name: string,
  email: string,
  password: string,
): Promise<IAuthResponse> => {
  const response = await axios.post<IAuthResponse>(`${BASE_URL}/api/auth/register`, {
    name,
    email,
    password,
  });
  return response.data;
};

export const loginUser = async (email: string, password: string): Promise<IAuthResponse> => {
  const response = await axios.post<IAuthResponse>(`${BASE_URL}/api/auth/login`, {
    email,
    password,
  });
  return response.data;
};
