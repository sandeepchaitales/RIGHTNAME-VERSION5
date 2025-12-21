import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API_URL = `${BACKEND_URL}/api`;

export const api = {
    evaluate: async (data) => {
        try {
            const response = await axios.post(`${API_URL}/evaluate`, data);
            return response.data;
        } catch (error) {
            console.error("Evaluation API Error:", error);
            throw error;
        }
    },
    status: async () => {
        return axios.get(`${API_URL}/`);
    }
};
