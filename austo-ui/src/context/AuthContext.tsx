import { createContext, useContext, useState, type ReactNode } from 'react'

interface AuthState {
  token: string | null
  userName: string | null
  userRole: string | null
}

interface AuthContextValue extends AuthState {
  login: (token: string, userName: string, userRole: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    token:    localStorage.getItem('austo_token'),
    userName: localStorage.getItem('austo_user'),
    userRole: localStorage.getItem('austo_role'),
  })

  const login = (token: string, userName: string, userRole: string) => {
    localStorage.setItem('austo_token', token)
    localStorage.setItem('austo_user',  userName)
    localStorage.setItem('austo_role',  userRole)
    setAuth({ token, userName, userRole })
  }

  const logout = () => {
    localStorage.removeItem('austo_token')
    localStorage.removeItem('austo_user')
    localStorage.removeItem('austo_role')
    setAuth({ token: null, userName: null, userRole: null })
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, isAuthenticated: !!auth.token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
