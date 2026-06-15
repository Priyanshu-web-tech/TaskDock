import { Geist, Geist_Mono, Inter } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"

import Providers from "@/providers/providers"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: {
    default: "TaskDock",
    template: "%s | TaskDock",
  },
  description: "Task Management Portal",
}

export const dynamic = "force-dynamic"

const geistHeading = Geist({
  subsets: ["latin"],
  variable: "--font-heading",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        geistHeading.variable
      )}
    >
      <body>
        <ThemeProvider>
          <Providers>
            {children}
            <Toaster position="top-center" />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
