import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  type: string
  phone?: string
  age?: number
  location?: string
  interests?: string[]
  orgName?: string
  regNumber?: string
  website?: string
  description?: string
  profileImage?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  userType: string | null
  user: User | null
  login: (email: string, password: string, type?: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string; data?: User }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  // Check for existing user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('tidewy_user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setIsAuthenticated(true)
        setUserType(userData.type)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('tidewy_user')
      }
    }
  }, [])

  const login = async (email: string, password: string, type: string = 'volunteer') => {
    try {
      // Simple validation
      if (!email || !password) {
        return { success: false, error: 'Please provide both email and password' }
      }

      // For demo purposes, accept any email/password combination
      const userData: User = {
        id: Date.now().toString(),
        name: type === 'ngo' ? 'Beach Please NGO' : 'John Volunteer',
        email: email,
        type: type
      }
      
      setIsAuthenticated(true)
      setUserType(type)
      setUser(userData)
      
      // Store in localStorage for persistence
      localStorage.setItem('tidewy_user', JSON.stringify(userData))
      
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  const register = async (email: string, password: string, userData: any) => {
    try {
      // Simple validation
      if (!email || !password) {
        return { success: false, error: 'Please provide both email and password' }
      }

      const userType = userData.role || 'volunteer'
      
      // Create user data
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: email,
        type: userType,
        ...userData
      }
      
      setIsAuthenticated(true)
      setUserType(userType)
      setUser(newUser)
      
      // Store in localStorage for persistence
      localStorage.setItem('tidewy_user', JSON.stringify(newUser))
      
      return { success: true, data: newUser }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUserType(null)
    setUser(null)
    localStorage.removeItem('tidewy_user')
  }

  const value: AuthContextType = {
    isAuthenticated,
    userType,
    user,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}