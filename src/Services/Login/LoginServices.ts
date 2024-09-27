import api from '../axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    name: string;
  };
}

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await api.post('auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await api.post('/logout');
    await AsyncStorage.multiRemove(['token', 'refreshToken']);
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async (): Promise<string> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const response = await api.post('/refresh-token', { refreshToken });
    const newToken = response.data.token;
    await AsyncStorage.setItem('token', newToken);
    return newToken;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await api.post('/forgot-password', { email });
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  try {
    await api.post('/reset-password', { token, newPassword });
  } catch (error) {
    throw error;
  }
};
