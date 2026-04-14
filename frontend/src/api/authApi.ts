import axiosInstance from './axiosInstance';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthApiResponse {
  token: string;
  id: string;
  email: string;
  name: string;
}

export interface UserApiResponse {
  id: string;
  email: string;
  name: string;
}

export const login = (data: LoginPayload) =>
  axiosInstance.post<AuthApiResponse>('/auth/login', data).then((r) => r.data);

export const register = (data: RegisterPayload) =>
  axiosInstance.post<AuthApiResponse>('/auth/register', data).then((r) => r.data);

export const getMe = () =>
  axiosInstance.get<UserApiResponse>('/users/me').then((r) => r.data);
