import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigateRef = useRef();
  
  try {
    // This will only work if we're inside a Router
    const navigate = useNavigate();
    navigateRef.current = navigate;
  } catch (error) {
    // If we're not in a Router context, navigateRef.current will remain undefined
    console.warn('AuthProvider is not within a Router context. Navigation will be limited.');
  }

  // Check if user is logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // TODO: Verify token with backend
      // For now, we'll just set a mock user
      setUser({ email: 'user@example.com', name: 'Test User' });
    }
    setLoading(false);
  }, []);

  // Safe navigation function
  const safeNavigate = (to, options) => {
    if (navigateRef.current) {
      navigateRef.current(to, options);
    } else {
      console.warn('Navigation attempted outside of Router context', { to, options });
      // Fallback to window.location if needed
      if (typeof to === 'string') {
        window.location.href = to;
      }
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      // TODO: Replace with actual login API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Login failed');
      // }
      
      // const data = await response.json();
      
      // Mock response for now
      const data = {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email,
          name: 'Test User',
        },
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      toast.success('Login successful');
      safeNavigate('/');
      
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    safeNavigate('/login');
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(prev => ({
      ...prev,
      ...userData
    }));
    
    // Update in localStorage if needed
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({
      ...currentUser,
      ...userData
    }));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
