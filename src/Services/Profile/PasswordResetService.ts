import api from "../axios";

export const updateUserCredentials = async (id:string, username:string, password:string): Promise<any> => {
    try {
      const response = await api.patch(`/user/reset-password/${id}`, {username, password});
      return response.data;
    } catch (error) {
      throw error;
    }
  };