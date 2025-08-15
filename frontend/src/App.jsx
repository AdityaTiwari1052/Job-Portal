import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import { Toaster } from 'sonner';
import Navbar from './components/shared/Navbar';
import Home from "./components/Home";
import JobDescription from "./components/JobDescription";
import Dashboard from "./components/Dashboard";
import AppliedJobTable from "./components/AppliedJobTable";
import { ModalProvider } from './context/ModalContext';
import { ThemeProvider } from './components/ui/theme-provider';
import api from './utils/api';

// Layout for routes that should have Navbar
const NavbarLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

// Public route wrapper
const PublicRoute = ({ children }) => {
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const checkRecruiterAuth = useCallback(async () => {
    const token = localStorage.getItem('recruiterToken');
    const savedRecruiter = localStorage.getItem('recruiterData');
    
    if (!token || !savedRecruiter) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/recruiter/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      
      if (response.data?.status === 'success' && response.data.data) {
        // Update stored recruiter data
        const recruiterData = response.data.data.recruiter || JSON.parse(savedRecruiter);
        localStorage.setItem('recruiterData', JSON.stringify(recruiterData));
        setIsRecruiter(true);
        // Only redirect if we're on the home page
        if (location.pathname === '/') {
          return <Navigate to="/dashboard" replace />;
        }
      } else {
        throw new Error('Invalid session');
      }
    } catch (error) {
      console.error('Error checking recruiter auth:', error);
      localStorage.removeItem('recruiterToken');
      localStorage.removeItem('recruiterData');
    } finally {
      setIsLoading(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    checkRecruiterAuth();
  }, [checkRecruiterAuth]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (isRecruiter && location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Protected route for recruiter dashboard
const RecruiterRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('recruiterToken');
    const savedRecruiter = localStorage.getItem('recruiterData');
    
    if (!token || !savedRecruiter) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/recruiter/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      
      if (response.data?.status === 'success' && response.data.data) {
        // Update stored recruiter data
        const recruiterData = response.data.data.recruiter || JSON.parse(savedRecruiter);
        localStorage.setItem('recruiterData', JSON.stringify(recruiterData));
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid session');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('recruiterToken');
      localStorage.removeItem('recruiterData');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    // Store the attempted URL for redirecting after login
    const redirectPath = location.pathname === '/dashboard' ? '/' : location.pathname;
    return <Navigate to="/" state={{ from: redirectPath }} replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <ModalProvider>
        <Router>
          <Routes>
            {/* Public routes with Navbar */}
            <Route path="/" element={
              <div className="min-h-screen bg-background">
                <Navbar />
                <main>
                  <Outlet />
                </main>
              </div>
            }>
              <Route index element={
                <PublicRoute>
                  <Home />
                </PublicRoute>
              } />
              <Route path="description/:id" element={<JobDescription />} />
              
              <Route
                path="/applied-jobs"
                element={
                  <SignedIn>
                    <AppliedJobTable />
                  </SignedIn>
                }
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
            
            {/* Dashboard route */}
            <Route
              path="/dashboard/*"
              element={
                <RecruiterRoute>
                  <Dashboard />
                </RecruiterRoute>
              }
            />
            
            {/* Clerk auth routes */}
            <Route
              path="/sign-in/*"
              element={
                <SignedIn>
                  <Navigate to="/dashboard" />
                </SignedIn>
              }
            />
            
            <Route
              path="/sign-up/*"
              element={
                <SignedIn>
                  <Navigate to="/dashboard" />
                </SignedIn>
              }
            />
          </Routes>
          
          <Toaster 
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
                fontFamily: 'Inter, sans-serif',
              },
              duration: 3000,
              className: 'toast',
            }}
          />
        </Router>
      </ModalProvider>
    </ThemeProvider>
  );
}

export default App;
