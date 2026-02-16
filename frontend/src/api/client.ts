import axios from 'axios';

// Create an Axios instance
const client = axios.create({
    baseURL: 'http://localhost:3000/api', // Backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default client;
