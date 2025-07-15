// lib/stores/auth.ts
import { create } from 'zustand'

type UserProfile = {
  id: number;
  user_id: number;
  avatar_url: string;
  birth_date: string; // of Date, afhankelijk hoe je het verwerkt
  country: string;
  gender: string;
  bio: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  profile?: UserProfile | null;  // kan null zijn als er geen profiel is
};

type AuthState = {
  user: User | null
  setUser: (user: User | null) => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))