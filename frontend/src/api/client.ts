import axios from 'axios';

// Base URL: VITE_API_URL (backend origin) + /api
const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

// Create an Axios instance
const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send cookies with every request
});

// --- Token helpers (localStorage fallback for when cookies are blocked) ---
export const tokenStore = {
    getAccessToken: () => localStorage.getItem('accessToken'),
    getRefreshToken: () => localStorage.getItem('refreshToken'),
    setTokens: (accessToken: string, refreshToken?: string) => {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
    },
    clear: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },
};

// Request interceptor — attach Authorization header from localStorage
client.interceptors.request.use((config) => {
    const token = tokenStore.getAccessToken();
    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any | null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// Response interceptor — silent token refresh on 401
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying and not a refresh/login request
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh') &&
            !originalRequest.url?.includes('/auth/login') &&
            !originalRequest.url?.includes('/auth/me')
        ) {
            if (isRefreshing) {
                // Queue this request until the refresh completes
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => client(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Try refreshing via cookie first, then with stored token in body
                const refreshToken = tokenStore.getRefreshToken();
                const refreshRes = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    { refreshToken: refreshToken || undefined },
                    { withCredentials: true }
                );

                // Store the new access token from response body
                if (refreshRes.data?.accessToken) {
                    tokenStore.setTokens(refreshRes.data.accessToken);
                }

                processQueue(null);
                return client(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                // Refresh failed — redirect to login
                tokenStore.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default client;
