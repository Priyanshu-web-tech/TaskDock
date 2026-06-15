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

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: UserType
  createdAt: string
  updatedAt: string
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

export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyOtpRequest {
  otp: string
}

export interface ResetPasswordRequest {
  password: string
  confirmPassword: string
}

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
}

export interface UpdateProfileResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    userType: UserType
    createdAt: string
    updatedAt: string
  }
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const TaskStatus = {
  Todo: "todo",
  InProgress: "in_progress",
  Completed: "completed",
} as const
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

export const TaskPriority = {
  Low: "low",
  Medium: "medium",
  High: "high",
} as const
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority]

export interface Task {
  id: number
  userId: number
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTaskRequest {
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
}

export interface UpdateTaskRequest {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
}

export interface GetTasksParams {
  search?: string
  status?: string
  sortBy?: string
  sortOrder?: string
  page?: number
  size?: number
}

