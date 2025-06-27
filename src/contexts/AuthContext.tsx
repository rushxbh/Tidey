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
  isVerified?: boolean
  createdAt?: string
  updatedAt?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  userType: string | null
  user: User | null
  token: string | null
  login: (email: string, password: string, type?: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string; data?: User }>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string; data?: User }>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

// API Helper Function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const token = localStorage.getItem('tidewy_token')
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, mergedOptions)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }
    
    return data
  } catch (error) {
    console.error('API call error:', error)
    throw error
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing user on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)
      
      const storedToken = localStorage.getItem('tidewy_token')
      const storedUser = localStorage.getItem('tidewy_user')
      
      if (storedToken && storedUser) {
        try {
          // Verify token with backend
          const userData = await apiCall('/auth/me')
          
          if (userData.success) {
            setIsAuthenticated(true)
            setUserType(userData.data.type)
            setUser(userData.data)
            setToken(storedToken)
          } else {
            // Token is invalid, clear stored data
            localStorage.removeItem('tidewy_token')
            localStorage.removeItem('tidewy_user')
          }
        } catch (error) {
          console.error('Error verifying stored token:', error)
          // Clear invalid stored data
          localStorage.removeItem('tidewy_token')
          localStorage.removeItem('tidewy_user')
        }
      }
      
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string, type: string = 'volunteer') => {
    try {
      setIsLoading(true)
      
      // Input validation
      if (!email || !password) {
        return { success: false, error: 'Please provide both email and password' }
      }

      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, type })
      })

      if (response.success) {
        const { data: userData, token: authToken } = response
        
        setIsAuthenticated(true)
        setUserType(userData.type)
        setUser(userData)
        setToken(authToken)
        
        // Store in localStorage for persistence
        localStorage.setItem('tidewy_token', authToken)
        localStorage.setItem('tidewy_user', JSON.stringify(userData))
        
        return { success: true }
      } else {
        return { success: false, error: response.error || 'Login failed' }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.message || 'Network error. Please check your connection and try again.' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, userData: any) => {
    try {
      setIsLoading(true)
      
      // Input validation
      if (!email || !password) {
        return { success: false, error: 'Please provide both email and password' }
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' }
      }

      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, userData })
      })

      if (response.success) {
        const { data: newUser, token: authToken } = response
        
        setIsAuthenticated(true)
        setUserType(newUser.type)
        setUser(newUser)
        setToken(authToken)
        
        // Store in localStorage for persistence
        localStorage.setItem('tidewy_token', authToken)
        localStorage.setItem('tidewy_user', JSON.stringify(newUser))
        
        return { success: true, data: newUser }
      } else {
        return { success: false, error: response.error || 'Registration failed' }
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: error.message || 'Network error. Please check your connection and try again.' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      setIsLoading(true)
      
      const response = await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      })

      if (response.success) {
        const updatedUser = response.data
        
        setUser(updatedUser)
        
        // Update localStorage
        localStorage.setItem('tidewy_user', JSON.stringify(updatedUser))
        
        return { success: true, data: updatedUser }
      } else {
        return { success: false, error: response.error || 'Profile update failed' }
      }
    } catch (error: any) {
      console.error('Profile update error:', error)
      return { 
        success: false, 
        error: error.message || 'Network error. Please check your connection and try again.' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUserType(null)
    setUser(null)
    setToken(null)
    
    // Clear localStorage
    localStorage.removeItem('tidewy_token')
    localStorage.removeItem('tidewy_user')
  }

  const value: AuthContextType = {
    isAuthenticated,
    userType,
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    isLoading
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