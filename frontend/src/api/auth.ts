import client from './client';

export interface LoginResponse {
    email: string;
    name: string;
}

export const authApi = {
    login: async (email: string, password: string, rememberMe: boolean = false): Promise<LoginResponse> => {
        const response = await client.post<LoginResponse>('/auth/login', { email, password, rememberMe });
        return response.data;
    },
    refresh: async () => {
        const response = await client.post('/auth/refresh');
        return response.data;
    },
    logout: async () => {
        const response = await client.post('/auth/logout');
        return response.data;
    },
    getMe: async (): Promise<LoginResponse> => {
        const response = await client.get<LoginResponse>('/auth/me');
        return response.data;
    },
};
