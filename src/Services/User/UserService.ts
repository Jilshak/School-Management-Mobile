import api from "../axios";
import { IUser } from "./IUserService";



export const getUserDetails = async (id: string): Promise<IUser> => {
  try {
    const response = await api.get(`/user/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};
