import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-react';
import { Toaster } from 'sonner';
import Navbar from './components/shared/Navbar';
import Home from "./components/Home";
import JobDescription from "./components/JobDescription";
import Dashboard from "./components/Dashboard";
import AppliedJobTable from "./components/AppliedJobTable";
import { ModalProvider } from './context/ModalContext';
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
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Protected route for authenticated users
const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();
  const recruiterToken = localStorage.getItem('recruiterToken');

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Allow access if either Clerk user is signed in or recruiter token exists
  if (!isSignedIn && !recruiterToken) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <ModalProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicRoute><NavbarLayout /></PublicRoute>}>
              <Route path="/" element={<Home />} />
              <Route path="/description/:id" element={<JobDescription />} />
            </Route>

            {/* Protected routes */}
            <Route element={
              <ProtectedRoute>
                <NavbarLayout />
              </ProtectedRoute>
            }>
              <Route path="/applied-jobs" element={<AppliedJobTable />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
            </Route>

            {/* Auth routes */}
            <Route path="/sign-in" element={
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>
            } />
            
            <Route path="/sign-up" element={
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
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
