import api from "../axios";

export const getEvents = async () => {
    try {
        const response = await api.get('/event');
        return response.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};