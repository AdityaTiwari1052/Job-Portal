import { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ui/theme-provider';
import { useDispatch } from 'react-redux';
import { setUser } from './redux/authSlice';
import axios from 'axios';
import apiClient from './utils/apiClient';
import { toast } from 'sonner';

// All your other imports...
import Layout from "./Layout";
import Navbar from "./components/shared/Navbar";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Home from "./components/Home";
import JobsPage from "./components/JobsPage";
import JobDescription from "./components/JobDescription";
import Companies from "./components/admin/Companies";
import CompanySetup from "./components/admin/CompanySetup";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import VerifyforgotPassword from "./components/auth/Verifyforgotpassword";
import ForgotPassword from "./components/auth/ForgotPassword";
import Profile from "./components/Profile";
import AccountSettings from "./components/AccountSettings";
import EditProfile from "./components/EditProfile";
import Network from "./components/Network";
import Applicants from "./components/admin/Applicants";
import DebugInfo from "./components/DebugInfo";

// ... (rest of your imports)

const appRouter = createBrowserRouter([
  { path: "/", element: <Navigate to="/home" /> },
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "home", element: <Home /> },
      { 
        path: "jobs", 
        element: (
          <ProtectedRoute>
            <JobsPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "description/:id", 
        element: <JobDescription /> 
      },
      { 
        path: "settings", 
        element: (
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        ) 
      },
      { path: "account-settings", element: <AccountSettings /> },
      {
        path: "profile/:username",
        element: <Profile />,
        children: [{ path: "edit", element: <EditProfile /> }],
      },
      {
        path: "profile/id/:id",
        element: <Profile />,
        children: [{ path: "edit", element: <EditProfile /> }],
      },
      {
        path: "admin/companies",
        element: (
          <ProtectedRoute>
            <Companies />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/companies/:id",
        element: (
          <ProtectedRoute>
            <CompanySetup />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/jobs/applicants/:jobId",
        element: (
          <ProtectedRoute>
            <div className="container mx-auto p-4">
              <h1 className="text-2xl font-bold mb-4">Job Applicants</h1>
              {/* This will be handled by the Applicants component */}
              <Applicants />
            </div>
          </ProtectedRoute>
        ),
      },
      {
        path: "network",
        element: (
          <ProtectedRoute>
            <Network />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/verifyforgot-password", element: <VerifyforgotPassword /> },
  
]);

const App = () => {
  const dispatch = useDispatch();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            // Try to refresh the token
            const response = await axios.post(
              '/api/v1/user/refresh-token',
              {},
              { 
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' }
              }
            );

            if (response.data.success) {
              // Update the stored token
              localStorage.setItem('token', response.data.token);
              
              // If we have user data in localStorage, use it
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                dispatch(setUser(JSON.parse(storedUser)));
              } else {
                // Fetch user data if not in localStorage
                const userResponse = await apiClient.get('/api/v1/user/me', {
                  headers: { 
                    'Authorization': `Bearer ${response.data.token}`,
                    'Content-Type': 'application/json'
                  },
                  withCredentials: true
                });
                
                if (userResponse.data.success) {
                  localStorage.setItem('user', JSON.stringify(userResponse.data.user));
                  dispatch(setUser(userResponse.data.user));
                }
              }
            }
          } catch (error) {
            console.error('Token refresh failed:', error);
            // If token refresh fails, clear auth state
            if (error.response?.status === 401) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              dispatch(setUser(null));
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        // Mark auth check as complete
        setIsAuthChecked(true);
      }
    };

    checkAuth();
  }, [dispatch]);

  // Show loading state while checking auth
  if (!isAuthChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <RouterProvider router={appRouter} />
      <DebugInfo />
    </ThemeProvider>
  );
};

export default App;
