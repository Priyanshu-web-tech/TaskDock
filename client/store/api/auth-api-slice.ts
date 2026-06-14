import { API_ROUTES } from "@/constants/constants"
import { apiSlice } from "./api-slice"
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
} from "@/types/api.types"

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // LOGIN
    login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (body) => ({
        url: API_ROUTES.LOGIN,
        method: "POST",
        body,
      }),
    }),

    // REGISTER
    register: builder.mutation<ApiResponse<AuthResponse>, RegisterRequest>({
      query: (body) => ({
        url: API_ROUTES.REGISTER,
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
})

export const { useLoginMutation, useRegisterMutation } = authApi
