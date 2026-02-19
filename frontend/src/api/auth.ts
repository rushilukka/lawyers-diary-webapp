import client from './client';
import { tokenStore } from './client';

export interface LoginResponse {
    email: string;
    name: string;
    accessToken?: string;
    refreshToken?: string;
}

export const authApi = {
    login: async (email: string, password: string, rememberMe: boolean = false): Promise<LoginResponse> => {
        const response = await client.post<LoginResponse>('/auth/login', { email, password, rememberMe });

        // Store tokens in localStorage (fallback for when cookies are blocked)
        if (response.data.accessToken) {
            tokenStore.setTokens(
                response.data.accessToken,
                response.data.refreshToken
            );
        }

        return response.data;
    },
    refresh: async () => {
        const response = await client.post('/auth/refresh');

        // Store new access token
        if (response.data?.accessToken) {
            tokenStore.setTokens(response.data.accessToken);
        }

        return response.data;
    },
    logout: async () => {
        const response = await client.post('/auth/logout');
        tokenStore.clear();
        return response.data;
    },
    getMe: async (): Promise<LoginResponse> => {
        const response = await client.get<LoginResponse>('/auth/me');
        return response.data;
    },
};
