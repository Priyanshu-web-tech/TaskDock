"use client"

import * as React from "react"

import { useAppDispatch } from "@/store/hook"
import { setUserData } from "@/store/slices/user-data-slice"
import { useGetMeQuery } from "@/store/api/auth-api-slice"
import AppHeader from "@/components/app-header"

export default function Layout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  const { data: profileData } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  React.useEffect(() => {
    if (profileData?.success && profileData.result) {
      const latestUser = profileData.result
      dispatch(
        setUserData({
          id: latestUser.id,
          email: latestUser.email,
          firstName: latestUser.firstName,
          lastName: latestUser.lastName,
          userType: latestUser.userType,
          createdAt: latestUser.createdAt,
          updatedAt: latestUser.updatedAt,
        })
      )
    }
  }, [profileData, dispatch])

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/20">
      <AppHeader />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
