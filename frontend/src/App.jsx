import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/shared/Navbar';
import Home from "./components/Home";
import JobDescription from "./components/JobDescription";
import Dashboard from "./components/Dashboard";
import AppliedJobTable from "./components/AppliedJobTable";
import { ModalProvider } from './context/ModalContext';
import { ThemeProvider } from './components/ui/theme-provider';

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

// Public route wrapper (no auth logic now)
const PublicRoute = ({ children }) => {
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRecruiterAuth = async () => {
      const token = localStorage.getItem('recruiterToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/v1/recruiter/me', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        const responseData = await response.json();
        
        if (response.ok && responseData.status === 'success' && responseData.data) {
          setIsRecruiter(true);
          // Redirect to dashboard if on home page
          if (window.location.pathname === '/') {
            window.location.href = '/dashboard';
          }
        } else {
          localStorage.removeItem('recruiterToken');
          localStorage.removeItem('recruiterData');
        }
      } catch (error) {
        console.error('Error checking recruiter auth:', error);
        localStorage.removeItem('recruiterToken');
        localStorage.removeItem('recruiterData');
      } finally {
        setIsLoading(false);
      }
    };

    checkRecruiterAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isRecruiter) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Protected route for recruiter dashboard
const RecruiterRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('recruiterToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/v1/recruiter/me', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        const responseData = await response.json();
        
        if (response.ok && responseData.status === 'success' && responseData.data) {
          localStorage.setItem('recruiterData', JSON.stringify(responseData.data.recruiter));
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('recruiterToken');
        localStorage.removeItem('recruiterData');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
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
            
            {/* Dashboard route without Navbar */}
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
          
          <Toaster position="top-right" />
        </Router>
      </ModalProvider>
    </ThemeProvider>
  );
}

export default App;
