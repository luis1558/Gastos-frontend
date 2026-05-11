import { api } from '../../api/client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../../types/api'
import type { User } from '../../types/models'

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
  me: () => api.get<User>('/auth/me'),
}
