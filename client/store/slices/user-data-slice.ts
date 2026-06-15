import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { UserType } from "@/types/api.types"

export interface IUserSessionData {
  id: string
  userType: UserType
  firstName: string
  lastName: string
  email: string
  createdAt: string
  updatedAt: string
  isSignedIn?: boolean
}

const initialState: IUserSessionData = {
  id: "",
  userType: UserType.User,
  firstName: "",
  lastName: "",
  email: "",
  createdAt: "",
  updatedAt: "",
  isSignedIn: false,
}

const userDataSlice = createSlice({
  name: "userData",
  initialState,
  reducers: {
    setUserData: (_, action: PayloadAction<IUserSessionData>) => {
      return { ...action.payload, isSignedIn: true }
    },
    clearUserData: () => initialState,
  },
})

export const { setUserData, clearUserData } = userDataSlice.actions
export default userDataSlice.reducer
