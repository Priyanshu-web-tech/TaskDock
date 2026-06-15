"use client"

import * as Yup from "yup"
import { useFormik } from "formik"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useForgotPasswordMutation } from "@/store/api/auth-api-slice"
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
import { emailValidation } from "@/utils/validations"
import type { ForgotPasswordFormValues } from "./forgot-password.types"

const ForgotPassword = () => {
  const router = useRouter()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const formik = useFormik<ForgotPasswordFormValues>({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: emailValidation,
    }),
    onSubmit: async (values) => {
      try {
        const response = await forgotPassword(values).unwrap()

        if (response?.success) {
          localStorage.setItem("otp_email", values.email)
          localStorage.setItem("otpSentAt", Date.now().toString())

          toast.success(response.message ?? "OTP sent! Check your email.")
          router.push(NAVIGATION_ROUTES.VERIFY_OTP)
        } else {
          toast.error(response?.message ?? "Failed to send OTP.")
        }
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ??
          "Failed to send OTP. Please try again."

        toast.error(message)
      }
    },
  })

  return (
    <Card className="w-full max-w-[360px] border border-border/60 bg-card/40 dark:bg-card/20 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300">
      <CardHeader className="space-y-1.5 pb-5 pt-6 text-left">
        <CardTitle className="text-lg font-medium tracking-tight text-foreground">
          Forgot password
        </CardTitle>

        <CardDescription className="text-[12px] text-muted-foreground leading-normal">
          Enter your email address and we&apos;ll send you a one-time password.
        </CardDescription>
      </CardHeader>

      <form onSubmit={formik.handleSubmit}>
        <CardContent className="space-y-3.5 pb-5">
          <div className="space-y-1">
            <Label
              htmlFor="email"
              className="text-xs font-medium text-muted-foreground"
            >
              Email Address
            </Label>

            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="h-9 px-3 rounded-xl border-border/80 focus-visible:ring-primary/10"
              aria-invalid={!!(formik.touched.email && formik.errors.email)}
            />

            {formik.touched.email && formik.errors.email && (
              <p className="text-[11px] font-medium text-destructive mt-0.5">
                {formik.errors.email}
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
            Send OTP
          </Button>

          <p className="text-center text-[11px] text-muted-foreground">
            Remember your password?{" "}
            <Link
              href={NAVIGATION_ROUTES.LOGIN}
              className="font-medium text-foreground hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

export default ForgotPassword