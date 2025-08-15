
import { useAuth } from '../stores/user'
import { useEffect } from 'react'
import { fetchUserFromServer } from '../../lib/user'

export function useLoadUser() {
  const setUser = useAuth((state) => state.setUser)

  useEffect(() => {
    async function load() {
        const result = await fetchUserFromServer();
        console.log('Fetched user:', result)
      if (!('error' in result)) {
        setUser(result)
      } else {
        setUser(null)
      }
    }

    load()
  }, [setUser])
}