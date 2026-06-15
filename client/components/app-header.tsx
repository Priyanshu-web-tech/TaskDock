"use client"

import * as React from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Layers,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  Monitor,
  X,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react"

import { useAppDispatch, useAppSelector } from "@/store/hook"
import { setUserData, clearUserData } from "@/store/slices/user-data-slice"
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useLogoutMutation,
} from "@/store/api/auth-api-slice"
import { NAVIGATION_ROUTES } from "@/constants/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  requiredFieldValidation,
  registerPasswordValidation,
  confirmPasswordValidation,
} from "@/utils/validations"

export default function AppHeader() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { theme, setTheme } = useTheme()

  const { id, firstName, lastName, email } = useAppSelector(
    (state) => state.userData
  )

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"profile" | "password">(
    "profile"
  )

  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation()
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation()
  const [logoutApi] = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap()
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to log out. Please try again."

      toast.error(message)
    } finally {
      dispatch(clearUserData())
      toast.success("Logged out successfully.")
      router.push(NAVIGATION_ROUTES.LOGIN)
    }
  }

  const profileFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: firstName || "",
      lastName: lastName || "",
    },
    validationSchema: Yup.object({
      firstName: requiredFieldValidation("First name"),
      lastName: requiredFieldValidation("Last name"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await updateProfile(values).unwrap()
        if (res.success) {
          dispatch(
            setUserData({
              id,
              email,
              firstName: res.result.user.firstName,
              lastName: res.result.user.lastName,
              userType: res.result.user.userType,
              createdAt: res.result.user.createdAt,
              updatedAt: res.result.user.updatedAt,
            })
          )
          toast.success("Profile updated successfully")
          setIsSettingsOpen(false)
        } else {
          toast.error(res.message || "Failed to update profile")
        }
      } catch (err: unknown) {
        const msg =
          (err as { data?: { message?: string } })?.data?.message ||
          "Failed to update profile"
        toast.error(msg)
      }
    },
  })

  // Password Formik Form
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      currentPassword: requiredFieldValidation("Current password"),
      newPassword: registerPasswordValidation,
      confirmPassword: confirmPasswordValidation("newPassword"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        }).unwrap()
        if (res.success) {
          toast.success("Password changed successfully")
          resetForm()
          setIsSettingsOpen(false)
        } else {
          toast.error(res.message || "Failed to change password")
        }
      } catch (err: unknown) {
        const msg =
          (err as { data?: { message?: string } })?.data?.message ||
          "Failed to change password"
        toast.error(msg)
      }
    },
  })

  const initials =
    `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() ||
    "U"

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-black">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              TaskDock
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Theme Picker Segmented Controller */}
            <div className="flex items-center rounded-lg border border-border/30 bg-zinc-100 p-0.5 dark:bg-zinc-900">
              <button
                onClick={() => setTheme("light")}
                className={`rounded-md p-1 transition-colors ${
                  theme === "light"
                    ? "bg-white text-foreground shadow-sm dark:bg-zinc-800"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Light mode"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`rounded-md p-1 transition-colors ${
                  theme === "dark"
                    ? "bg-white text-foreground shadow-sm dark:bg-zinc-800"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Dark mode"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`rounded-md p-1 transition-colors ${
                  theme === "system"
                    ? "bg-white text-foreground shadow-sm dark:bg-zinc-800"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="System theme"
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Profile trigger */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsSettingsOpen(true)
                  setActiveTab("profile")
                }}
                className="flex items-center gap-2 rounded-xl border border-transparent p-1.5 transition-colors hover:border-border/40 hover:bg-muted/60 focus:outline-none"
              >
                <div className="dark:bg-zinc-850 flex size-7 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {initials}
                </div>
                <span className="hidden max-w-[100px] truncate text-xs font-medium text-foreground/80 md:inline">
                  {firstName || "User"}
                </span>
                <Settings className="hidden h-3.5 w-3.5 text-muted-foreground md:inline" />
              </button>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive focus:outline-none"
                title="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile & Security Settings Modal */}
      {isSettingsOpen && (
        <div
          onClick={() => setIsSettingsOpen(false)}
          className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm duration-200 fade-in dark:bg-zinc-950/60"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md animate-in overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl duration-200 zoom-in-95"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/50 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Settings & Account
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-border/30 bg-muted/30">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 border-b-2 py-2.5 text-xs font-medium transition-colors focus:outline-none ${
                  activeTab === "profile"
                    ? "border-primary bg-card text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Profile Details
                </div>
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`flex-1 border-b-2 py-2.5 text-xs font-medium transition-colors focus:outline-none ${
                  activeTab === "password"
                    ? "border-primary bg-card text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Security & Password
                </div>
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[70vh] overflow-y-auto p-5">
              {activeTab === "profile" ? (
                <form
                  onSubmit={profileFormik.handleSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Email (Read-only)
                    </Label>
                    <Input
                      value={email || ""}
                      disabled
                      className="h-9 cursor-not-allowed rounded-xl bg-muted/50 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="firstName"
                      className="text-xs text-muted-foreground"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={profileFormik.values.firstName}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      className="h-9 rounded-xl border-border/80 text-xs focus-visible:ring-primary/10"
                    />
                    {profileFormik.touched.firstName &&
                      profileFormik.errors.firstName && (
                        <p className="mt-0.5 text-[10px] font-medium text-destructive">
                          {profileFormik.errors.firstName}
                        </p>
                      )}
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="lastName"
                      className="text-xs text-muted-foreground"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={profileFormik.values.lastName}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      className="h-9 rounded-xl border-border/80 text-xs focus-visible:ring-primary/10"
                    />
                    {profileFormik.touched.lastName &&
                      profileFormik.errors.lastName && (
                        <p className="mt-0.5 text-[10px] font-medium text-destructive">
                          {profileFormik.errors.lastName}
                        </p>
                      )}
                  </div>

                  <div className="flex justify-end gap-2 border-t border-border/50 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSettingsOpen(false)}
                      className="h-8 rounded-xl text-xs font-normal"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isUpdatingProfile}
                      className="h-8 rounded-xl text-xs font-medium"
                    >
                      {isUpdatingProfile && (
                        <Spinner className="mr-1 h-3 w-3 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <form
                  onSubmit={passwordFormik.handleSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <Label
                      htmlFor="currentPassword"
                      className="text-xs text-muted-foreground"
                    >
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwordFormik.values.currentPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        className="h-9 rounded-xl border-border/80 pr-9 text-xs focus-visible:ring-primary/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground/80 focus:outline-none"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="size-3.5" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                      </button>
                    </div>
                    {passwordFormik.touched.currentPassword &&
                      passwordFormik.errors.currentPassword && (
                        <p className="mt-0.5 text-[10px] font-medium text-destructive">
                          {passwordFormik.errors.currentPassword}
                        </p>
                      )}
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="newPassword"
                      className="text-xs text-muted-foreground"
                    >
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwordFormik.values.newPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        className="h-9 rounded-xl border-border/80 pr-9 text-xs focus-visible:ring-primary/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground/80 focus:outline-none"
                      >
                        {showNewPassword ? (
                          <EyeOff className="size-3.5" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                      </button>
                    </div>
                    {passwordFormik.touched.newPassword &&
                      passwordFormik.errors.newPassword && (
                        <p className="mt-0.5 text-[10px] font-medium text-destructive">
                          {passwordFormik.errors.newPassword}
                        </p>
                      )}
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-xs text-muted-foreground"
                    >
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwordFormik.values.confirmPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        className="h-9 rounded-xl border-border/80 pr-9 text-xs focus-visible:ring-primary/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground/80 focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-3.5" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                      </button>
                    </div>
                    {passwordFormik.touched.confirmPassword &&
                      passwordFormik.errors.confirmPassword && (
                        <p className="mt-0.5 text-[10px] font-medium text-destructive">
                          {passwordFormik.errors.confirmPassword}
                        </p>
                      )}
                  </div>

                  <div className="flex justify-end gap-2 border-t border-border/50 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSettingsOpen(false)}
                      className="h-8 rounded-xl text-xs font-normal"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isChangingPassword}
                      className="h-8 rounded-xl text-xs font-medium"
                    >
                      {isChangingPassword && (
                        <Spinner className="mr-1 h-3 w-3 animate-spin" />
                      )}
                      Change Password
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
