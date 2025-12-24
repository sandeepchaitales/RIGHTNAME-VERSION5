import axios from 'axios';

// Use relative URL for API calls so it works on any domain (custom domain or preview URL)
const API_URL = '/api';

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
