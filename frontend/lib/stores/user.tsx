// lib/stores/auth.ts
import { create } from 'zustand'

type User = {
  id: number
  name: string
  email: string
  // eventueel meer velden
}

type AuthState = {
  user: User | null
  setUser: (user: User | null) => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))