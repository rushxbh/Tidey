import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userType, setUserType] = useState(null)
  const [user, setUser] = useState(null)

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

  const login = async (email, password, type = 'volunteer') => {
    try {
      // Simple validation
      if (!email || !password) {
        return { success: false, error: 'Please provide both email and password' }
      }

      // For demo purposes, accept any email/password combination
      const userData = {
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
      return { success: false, error: error.message }
    }
  }

  const register = async (email, password, userData) => {
    try {
      // Simple validation
      if (!email || !password) {
        return { success: false, error: 'Please provide both email and password' }
      }

      const userType = userData.role || 'volunteer'
      
      // Create user data
      const newUser = {
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
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUserType(null)
    setUser(null)
    localStorage.removeItem('tidewy_user')
  }

  const value = {
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