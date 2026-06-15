"use client"

import * as Yup from "yup"
import { useState } from "react"
import { useFormik } from "formik"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

import { useResetPasswordMutation } from "@/store/api/auth-api-slice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { NAVIGATION_ROUTES } from "@/constants/constants"
import {
  registerPasswordValidation,
  confirmPasswordValidation,
} from "@/utils/validations"
import type { ResetPasswordFormValues } from "./reset-password.types"

const ResetPassword = () => {
  const router = useRouter()
  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const formik = useFormik<ResetPasswordFormValues>({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: registerPasswordValidation,
      confirmPassword: confirmPasswordValidation("password"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await resetPassword(values).unwrap()

        if (response?.success) {
          toast.success(
            response.message ??
              "Password reset successfully. Please sign in."
          )

          router.push(NAVIGATION_ROUTES.LOGIN)
        } else {
          toast.error(response?.message ?? "Failed to reset password.")
        }
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ??
          "Failed to reset password. Please try again."

        toast.error(message)
      }
    },
  })

  return (
    <Card className="w-full max-w-[360px] border border-border/60 bg-card/40 dark:bg-card/20 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300">
      <CardHeader className="space-y-1.5 pb-5 pt-6 text-left">
        <CardTitle className="text-lg font-medium tracking-tight text-foreground">
          Reset password
        </CardTitle>

        <CardDescription className="text-[12px] text-muted-foreground leading-normal">
          Choose a strong new password for your account.
        </CardDescription>
      </CardHeader>

      <form onSubmit={formik.handleSubmit}>
        <CardContent className="space-y-3.5 pb-5">
          <div className="space-y-1">
            <Label
              htmlFor="password"
              className="text-xs font-medium text-muted-foreground"
            >
              New Password
            </Label>

            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="h-9 pl-3 pr-9 rounded-xl border-border/80 focus-visible:ring-primary/10"
                aria-invalid={
                  !!(formik.touched.password && formik.errors.password)
                }
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground/80 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
              </button>
            </div>

            {formik.touched.password && formik.errors.password && (
              <p className="text-[11px] font-medium text-destructive mt-0.5">
                {formik.errors.password}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-medium text-muted-foreground"
            >
              Confirm Password
            </Label>

            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="h-9 pl-3 pr-9 rounded-xl border-border/80 focus-visible:ring-primary/10"
                aria-invalid={
                  !!(
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                  )
                }
              />

              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground/80 transition-colors focus:outline-none"
              >
                {showConfirm ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
              </button>
            </div>

            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <p className="text-[11px] font-medium text-destructive mt-0.5">
                  {formik.errors.confirmPassword}
                </p>
              )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3.5 pb-6">
          <Button
            type="submit"
            size="sm"
            className="w-full h-9 rounded-xl font-medium transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            disabled={isLoading}
          >
            {isLoading && <Spinner className="mr-1.5" />}
            Reset Password
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default ResetPassword