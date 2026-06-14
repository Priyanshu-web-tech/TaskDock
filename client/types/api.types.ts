export const UserType = {
  Admin: "admin",
  User: "user",
} as const
export type UserType = (typeof UserType)[keyof typeof UserType]

export interface LoginRequest {
  email: string
  password: string
  deviceId: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  address: string
  deviceId: string
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: UserType
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: AuthUser
}

export interface ApiResponse<T> {
  success: boolean
  status_code: number
  message?: string
  result: T
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
