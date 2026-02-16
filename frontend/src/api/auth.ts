import client from './client';

export interface LoginResponse {
    token: string;
    _id: string;
    email: string;
    name: string;
}

export const authApi = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await client.post<LoginResponse>('/auth/login', { email, password });
        return response.data;
    },
};
