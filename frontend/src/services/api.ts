import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 30000, // 30s timeout for large file processing
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.detail || error.message;
        return Promise.reject(new Error(message));
    }
);

export default api;
