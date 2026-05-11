export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: {
    code: string
    message: string
    path: string
    timestamp: string
    details?: Record<string, string[]>
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}

export interface TokenPair {
  access_token: string
  refresh_token: string
}

export interface AuthResponse {
  user: import('./models').User
  tokens: TokenPair
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name?: string
}
