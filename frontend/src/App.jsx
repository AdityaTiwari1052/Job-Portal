import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-react';
import { Toaster } from 'sonner';
import Navbar from './components/shared/Navbar';
import Home from "./components/Home";
import JobDescription from "./components/JobDescription";
import Dashboard from "./components/Dashboard";
import AppliedJobTable from "./components/AppliedJobTable";
import ManageJob from "./components/ManageJob";
import PostJob from "./components/admin/PostJob";
import ApplicantsTable from "./components/admin/ApplicantsTable";
import UserDashboard from "./components/UserDashboard";
import RecruiterAuth from "./pages/RecruiterAuth";
import ResetPassword from "./pages/ResetPassword";
import { ThemeProvider } from './components/ui/theme-provider';
import api from './utils/api';

// Clerk Publishable Key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Layout for routes that should have Navbar
const NavbarLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isSignedIn={isSignedIn} />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

// Public route wrapper
const PublicRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is signed in and tries to access auth pages, redirect to dashboard
  if (isSignedIn && (location.pathname === '/sign-in' || location.pathname === '/sign-up')) {
    return <Navigate to="/user-dashboard" replace />;
  }

  return children;
};

// Recruiter route wrapper
const RecruiterRoute = ({ children }) => {
  const location = useLocation();
  const recruiterToken = localStorage.getItem('recruiterToken');
  const recruiterData = localStorage.getItem('recruiterData');

  if (!recruiterToken || !recruiterData) {
    // Redirect to home page with recruiter login modal
    return <Navigate to="/" state={{ showRecruiterLogin: true }} replace />;
  }

  return children;
};

// Protected route for authenticated users
const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only check for Clerk authentication, not recruiter
  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  // Clear any stale authorization headers on app initialization
  useEffect(() => {
    delete api.defaults.headers.common['Authorization'];
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicRoute><NavbarLayout /></PublicRoute>}>
              <Route path="/" element={<Home />} />
              <Route path="/description/:id" element={<JobDescription />} />
            </Route>

            {/* Password Reset Route with Navbar */}
            <Route element={<NavbarLayout />}>
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Recruiter routes */}
            <Route path="/dashboard" element={
              <RecruiterRoute>
                <Dashboard />
              </RecruiterRoute>
            }>
              <Route index element={<Navigate to="manage" replace />} />
              <Route path="manage" element={<ManageJob />} />
              <Route path="applicants" element={<ApplicantsTable />} />
              <Route path="post" element={<PostJob />} />
            </Route>

            {/* Protected routes */}
            <Route element={
              <ProtectedRoute>
                <NavbarLayout />
              </ProtectedRoute>
            }>
              <Route path="/applied-jobs" element={<AppliedJobTable />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
            </Route>

            {/* Auth routes */}
            <Route path="/sign-in" element={
              <SignedIn>
                <Navigate to="/user-dashboard" replace />
              </SignedIn>
            } />

            <Route path="/sign-up" element={
              <SignedIn>
                <Navigate to="/user-dashboard" replace />
              </SignedIn>
            } />


            {/* Email verification routes - handled within modals */}

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster position="top-right" richColors />

        </Router>
    </ThemeProvider>
  );
}

export default App;
