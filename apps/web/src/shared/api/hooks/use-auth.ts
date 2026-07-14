'use client';

import { useMutation } from '@tanstack/react-query';

import { api } from '@/shared/api/client';
import { useAuthStore } from '@/store/use-auth-store';

interface RegisterInput {
  email: string;
  password: string;
  nickname: string;
  nativeLanguage: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface TokensResponse {
  accessToken: string;
  refreshToken: string;
}

interface RegisterResponse {
  id: string;
  email: string;
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => api.post<RegisterResponse>('/auth/register', input, { skipAuth: true }),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const tokens = await api.post<TokensResponse>('/auth/login', input, { skipAuth: true });
      useAuthStore.getState().setSession({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: { id: '', email: input.email, role: 'STUDENT' },
      });
      return tokens;
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken }).catch(() => undefined);
      }
      useAuthStore.getState().clear();
    },
  });
}
