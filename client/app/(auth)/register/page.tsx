"use client"

import * as Yup from "yup"
import { useState } from "react"
import { useFormik } from "formik"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

import { useRegisterMutation } from "@/store/api/auth-api-slice"
import { setUserData } from "@/store/slices/user-data-slice"
import { useAppDispatch } from "@/store/hook"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { NAVIGATION_ROUTES } from "@/constants/constants"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import {
  emailValidation,
  registerPasswordValidation,
  confirmPasswordValidation,
  textFieldValidation,
} from "@/utils/validations"
import type { RegisterFormValues } from "./register.types"

export default function Page() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [register, { isLoading }] = useRegisterMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      firstName: textFieldValidation("First name", true),
      lastName: textFieldValidation("Last name"),
      email: emailValidation,
      password: registerPasswordValidation,
      confirmPassword: confirmPasswordValidation("password"),
    }),
    onSubmit: async (values) => {
      try {
        let deviceId = localStorage.getItem("deviceId")
        if (!deviceId) {
          deviceId = crypto.randomUUID()
          localStorage.setItem("deviceId", deviceId)
        }
        const response = await register({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          deviceId,
        }).unwrap()

        if (response?.success) {
          const { user } = response.result
          dispatch(
            setUserData({
              id: user.id,
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
          toast.error(response?.message ?? "Registration failed.")
        }
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ??
          "Registration failed. Please try again."
        toast.error(message)
      }
    },
  })

  return (
    <Card className="w-full max-w-[390px] border border-border/60 bg-card/40 dark:bg-card/20 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300">
      <CardHeader className="space-y-1.5 pb-4 pt-6 text-left">
        <CardTitle className="text-lg font-medium tracking-tight text-foreground">
          Create account
        </CardTitle>
        <CardDescription className="text-[12px] text-muted-foreground leading-normal">
          Fill in your details below to set up your account.
        </CardDescription>
      </CardHeader>

      <form onSubmit={formik.handleSubmit}>
        <CardContent className="space-y-3.5 pb-4">
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label
                htmlFor="firstName"
                className="text-xs font-medium text-muted-foreground"
              >
                First Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={formik.values.firstName}
                onChange={(e) => {
                  if (e.target.value.startsWith(" ")) return
                  formik.handleChange(e)
                }}
                onBlur={formik.handleBlur}
                className="h-9 px-3 rounded-xl border-border/80 focus-visible:ring-primary/10"
                aria-invalid={
                  !!(formik.touched.firstName && formik.errors.firstName)
                }
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="text-[11px] font-medium text-destructive mt-0.5">
                  {formik.errors.firstName}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="lastName"
                className="text-xs font-medium text-muted-foreground"
              >
                Last Name
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={formik.values.lastName}
                onChange={(e) => {
                  if (e.target.value.startsWith(" ")) return
                  formik.handleChange(e)
                }}
                onBlur={formik.handleBlur}
                className="h-9 px-3 rounded-xl border-border/80 focus-visible:ring-primary/10"
                aria-invalid={
                  !!(formik.touched.lastName && formik.errors.lastName)
                }
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="text-[11px] font-medium text-destructive mt-0.5">
                  {formik.errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs font-medium text-muted-foreground"
            >
              Email Address <span className="text-destructive">*</span>
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
            <label
              htmlFor="password"
              className="text-xs font-medium text-muted-foreground"
            >
              Password <span className="text-destructive">*</span>
            </label>
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
            <label
              htmlFor="confirmPassword"
              className="text-xs font-medium text-muted-foreground"
            >
              Confirm Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
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
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground/80 transition-colors focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
              </button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
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
            Create account
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Already have an account?{" "}
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
