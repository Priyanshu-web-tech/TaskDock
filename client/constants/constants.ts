export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export const API_ROUTES = {
  LOGIN: "auth/login",
  REGISTER: "auth/register",
  ME: "auth/me",
  REFRESH: "auth/refresh",
  FORGOT_PASSWORD: "auth/forgot-password",
  VERIFY_OTP: "auth/verify-otp",
  RESET_PASSWORD: "auth/reset-password",
  UPDATE_PROFILE: "auth/update-profile",
  CHANGE_PASSWORD: "auth/change-password",
  LOGOUT: "auth/logout",
}

export const NAVIGATION_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_OTP: "/verify-otp",
  RESET_PASSWORD: "/reset-password",
  HOME: "/home",
}

export const OTP_LENGTH = 6
export const OTP_COOLDOWN_SECS = 120

export const PAGE_SIZE = 10
