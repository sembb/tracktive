'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from './stores/user';

export default function useLogout(cookieHeader?: string) {
  const router = useRouter()
  const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';

  const logout = async () => {

    // 2. Doe het logout request
    const response = await fetch(`${apiUrl}/api/logout`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    })

    if (response.ok) {
        useAuth.getState().setUser(null)
        router.push('/login') // Of een andere redirect na logout
    } else {
        console.error('Logout failed')
    }
  }

  return logout
}