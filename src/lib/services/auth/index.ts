import api from '@/lib/api';
import {
    LoginCredentials,
    RegisterCredentials,
    AuthResponse,
    TokenResponse,
    User
} from './types';
import {
    storeAuthData,
    clearAuthData,
    isTokenExpired,
    getUserFromToken,
    getStoredAuthData
} from './utils';
import { apiLogger } from '@/lib/api/logger';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.client.post<AuthResponse>(
            api.endpoints.auth.login,
            credentials
        );

        const { accessToken, refreshToken } = response as AuthResponse;
        storeAuthData(accessToken, refreshToken);

        apiLogger.info('User logged in successfully', { email: credentials.email });
        return response.data as AuthResponse;
    } catch (error) {
        apiLogger.error('POST', api.endpoints.auth.login, error as { response?: { status: number; data: unknown }; message: string; stack?: string });
        throw error;
    }
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.client.post<AuthResponse>(
            api.endpoints.auth.register,
            credentials
        );

        apiLogger.info('User registered successfully', { email: credentials.email });
        console.log('Registration response:', response);
        return response.data as AuthResponse;
    } catch (error) {
        apiLogger.error('POST', api.endpoints.auth.register, error as { response?: { status: number; data: unknown }; message: string; stack?: string });
        throw error;
    }
};

export const logout = async (): Promise<void> => {
    try {
        const authData = getStoredAuthData();
        if (authData?.refreshToken) {
            await api.client.post(api.endpoints.auth.logout, {
                refreshToken: authData.refreshToken
            });
        }
    } catch (error) {
        apiLogger.error('POST', api.endpoints.auth.logout, error as { response?: { status: number; data: unknown }; message: string; stack?: string });
    } finally {
        clearAuthData();
    }
};

export const refreshToken = async (): Promise<TokenResponse> => {
    try {
        const authData = getStoredAuthData();
        if (!authData?.refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await api.client.post<TokenResponse>(
            api.endpoints.auth.refreshToken,
            { refreshToken: authData.refreshToken }
        );

        const { accessToken, refreshToken } = response as TokenResponse;
        storeAuthData(accessToken, refreshToken);

        apiLogger.info('Token refreshed successfully');
        return response.data as TokenResponse;
    } catch (error) {
        apiLogger.error('POST', api.endpoints.auth.refreshToken, error as { response?: { status: number; data: unknown }; message: string; stack?: string });
        clearAuthData();
        throw error;
    }
};

export const getCurrentUser = (): User | null => {
    const authData = getStoredAuthData();
    if (authData?.accessToken && !isTokenExpired(authData.accessToken)) {
        return getUserFromToken(authData.accessToken);
    }
    return null;
};

export const isAuthenticated = (): boolean => {
    const authData = getStoredAuthData();
    return !!(authData?.accessToken && !isTokenExpired(authData.accessToken));
};