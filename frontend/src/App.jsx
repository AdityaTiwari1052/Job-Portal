import { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ui/theme-provider';
import { useDispatch } from 'react-redux';
import { setUser } from './redux/authSlice';
import axios from 'axios';
import apiClient from './utils/apiClient';
import { toast } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import components
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

import AccountSettings from "./components/AccountSettings";
import EditProfile from "./components/EditProfile";
import Network from "./components/Network";
import Applicants from "./components/admin/Applicants";
import DebugInfo from "./components/DebugInfo";
import UserProfile from "./components/UserProfile";  

// Create router configuration
const router = createBrowserRouter([
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
        path: "profile/id/:id/edit",
        element: (
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        )
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
  { path: "/verify-forgot-password", element: <VerifyforgotPassword /> },
  { path: "/user/:username", element: <UserProfile /> },
]);

// Main App component wrapped with AuthProvider
function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

// App component with auth check
function App() {
  const dispatch = useDispatch();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const { checkAuth } = useAuth();

  // Check for existing session on app load
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            // Try to refresh the token
            const refreshResponse = await apiClient.post(
              '/user/refresh-token',
              {},
              {
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            if (refreshResponse.data.success) {
              localStorage.setItem('token', refreshResponse.data.token);
              
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                dispatch(setUser(JSON.parse(storedUser)));
              }
            }
          } catch (error) {
            console.error('Token refresh failed:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsAuthChecked(true);
      }
    };

    verifyAuth();
  }, [dispatch]);

  if (!isAuthChecked) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <DebugInfo />
    </ThemeProvider>
  );
}

export default AppWrapper;
