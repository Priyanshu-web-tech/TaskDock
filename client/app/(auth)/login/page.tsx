"use client"

import * as Yup from "yup"
import { useState } from "react"
import { useFormik } from "formik"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useLoginMutation } from "@/store/api/auth-api-slice"
import { setUserData } from "@/store/slices/user-data-slice"
import { useAppDispatch } from "@/store/hook"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { NAVIGATION_ROUTES } from "@/constants/constants"
import { emailValidation, requiredFieldValidation } from "@/utils/validations"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import type { LoginFormValues } from "./login.types"

export default function Page() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [login, { isLoading }] = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)

  const formik = useFormik<LoginFormValues>({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: emailValidation,
      password: requiredFieldValidation("Password"),
    }),
    onSubmit: async (values) => {
      try {
        let deviceId = localStorage.getItem("deviceId")
        if (!deviceId) {
          deviceId = crypto.randomUUID()
          localStorage.setItem("deviceId", deviceId)
        }
        const response = await login({ ...values, deviceId }).unwrap()
        if (response?.success) {
          const { user } = response.result
          dispatch(
            setUserData({
              _id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              userType: user.userType,
              createdAt: "",
              updatedAt: "",
            })
          )
          router.push(NAVIGATION_ROUTES.HOME)
        } else {
          toast.error(response?.message ?? "Login failed.")
        }
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ??
          "Login failed. Please try again."
        toast.error(message)
      }
    },
  })

  return (
    <Card className="w-full max-w-[360px] border border-border/60 bg-card/40 dark:bg-card/20 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300">
      <CardHeader className="space-y-1.5 pb-5 pt-6 text-left">
        <CardTitle className="text-lg font-medium tracking-tight text-foreground">
          Welcome back
        </CardTitle>
        <CardDescription className="text-[12px] text-muted-foreground leading-normal">
          Please enter your credentials to access your account.
        </CardDescription>
      </CardHeader>

      <form onSubmit={formik.handleSubmit}>
        <CardContent className="space-y-3.5 pb-5">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs font-medium text-muted-foreground"
            >
              Email Address
            </label>
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

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="text-xs font-medium text-muted-foreground"
              >
                Password
              </label>
              <Link
                href={NAVIGATION_ROUTES.FORGOT_PASSWORD}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
              >
                Forgot?
              </Link>
            </div>
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
        </CardContent>

        <CardFooter className="flex flex-col gap-3.5 pb-6">
          <Button
            type="submit"
            size="sm"
            className="w-full h-9 rounded-xl font-medium transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            disabled={isLoading}
          >
            {isLoading && <Spinner className="mr-1.5" />}
            Sign in
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            New to TaskDock?{" "}
            <Link
              href={NAVIGATION_ROUTES.REGISTER}
              className="font-medium text-foreground hover:underline transition-colors"
            >
              Create an account
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
