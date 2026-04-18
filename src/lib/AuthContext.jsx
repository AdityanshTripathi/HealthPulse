import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        setProfile(data)
        setRole(data.role || 'patient')
        return data.role || 'patient'
      } else {
        // Fallback: check user_roles table
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single()
        const r = roleData?.role || 'patient'
        setRole(r)
        return r
      }
    } catch {
      setRole('patient')
      return 'patient'
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) fetchProfile(s.user.id)
      else setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s?.user) {
        fetchProfile(s.user.id)
      } else {
        setProfile(null)
        setRole(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const logout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    setRole(null)
  }

  // Expose waitForRole for components that need to know the role before navigating
  const waitForRole = useCallback(async (userId) => {
    return await fetchProfile(userId)
  }, [fetchProfile])

  return (
    <AuthContext.Provider value={{ session, profile, role, loading, logout, waitForRole, refetchProfile: () => session?.user && fetchProfile(session.user.id) }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
