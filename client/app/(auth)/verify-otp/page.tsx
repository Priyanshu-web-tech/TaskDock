"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  useVerifyOtpMutation,
  useForgotPasswordMutation,
} from "@/store/api/auth-api-slice"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import {
  NAVIGATION_ROUTES,
  OTP_LENGTH,
  OTP_COOLDOWN_SECS,
} from "@/constants/constants"
import { formatTime, getStoredOtpSecondsLeft } from "@/utils/helpers"

const VerifyOtp = () => {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [secondsLeft, setSecondsLeft] = useState<number>(() =>
    getStoredOtpSecondsLeft(OTP_COOLDOWN_SECS)
  )
  const [isLoading, setIsLoading] = useState(false)
  const [verifyOtp] = useVerifyOtpMutation()
  const [forgotPassword, { isLoading: isResending }] =
    useForgotPasswordMutation()

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setTimeout(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearTimeout(id)
  }, [secondsLeft])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== OTP_LENGTH) {
      toast.error(`Please enter all ${OTP_LENGTH} digits.`)
      return
    }
    setIsLoading(true)
    try {
      const response = await verifyOtp({ otp }).unwrap()
      if (response?.success) {
        toast.success(response.message ?? "OTP verified successfully.")
        router.push(NAVIGATION_ROUTES.RESET_PASSWORD)
      } else {
        toast.error(response?.message ?? "OTP verification failed.")
      }
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Invalid OTP. Please try again."
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    const email = localStorage.getItem("otp_email")
    if (!email) {
      toast.error("Session expired. Please start over.")
      router.push(NAVIGATION_ROUTES.FORGOT_PASSWORD)
      return
    }
    try {
      const response = await forgotPassword({ email }).unwrap()
      if (response?.success) {
        localStorage.setItem("otpSentAt", Date.now().toString())
        setSecondsLeft(OTP_COOLDOWN_SECS)
        setOtp("")
        toast.success(response.message ?? "OTP resent! Check your email.")
      } else {
        toast.error(response?.message ?? "Failed to resend OTP.")
      }
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to resend OTP. Please try again."
      toast.error(message)
    }
  }

return (
  <Card className="w-full max-w-[360px] border border-border/60 bg-card/40 dark:bg-card/20 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300">
    <CardHeader className="space-y-1.5 pb-5 pt-6 text-left">
      <CardTitle className="text-lg font-medium tracking-tight text-foreground">
        Enter OTP
      </CardTitle>

      <CardDescription className="text-[12px] text-muted-foreground leading-normal">
        We sent a {OTP_LENGTH}-digit verification code to your email address.
      </CardDescription>
    </CardHeader>

    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-5 pb-5">
        <div className="flex justify-center">
          <InputOTP
            maxLength={OTP_LENGTH}
            value={otp}
            onChange={setOtp}
            pattern={REGEXP_ONLY_DIGITS}
          >
            <InputOTPGroup className="gap-2">
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-9 w-9 rounded-xl border-border/80"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3.5 pb-6">
        <Button
          type="submit"
          size="sm"
          className="w-full h-9 rounded-xl font-medium transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
          disabled={isLoading || otp.length !== OTP_LENGTH}
        >
          {isLoading && <Spinner className="mr-1.5" />}
          Verify OTP
        </Button>

        <div className="text-center text-[11px] text-muted-foreground">
          {secondsLeft > 0 ? (
            <>
              Didn&apos;t receive a code?{" "}
              <span className="font-medium text-foreground tabular-nums">
                Resend in {formatTime(secondsLeft)}
              </span>
            </>
          ) : (
            <>
              Didn&apos;t receive a code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="font-medium text-foreground hover:underline transition-colors disabled:pointer-events-none disabled:opacity-50"
              >
                {isResending ? "Sending..." : "Resend OTP"}
              </button>
            </>
          )}
        </div>
      </CardFooter>
    </form>
  </Card>
)
}

export default VerifyOtp
