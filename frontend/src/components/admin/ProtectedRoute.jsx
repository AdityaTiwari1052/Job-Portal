import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const { user, isAuthenticated, loading } = useSelector(store => store.auth);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Only check auth if we're not already checking
        if (isCheckingAuth) {
            // Check for regular user or recruiter token
            const recruiterToken = localStorage.getItem('recruiterToken');
            const hasToken = (user && isAuthenticated) || recruiterToken;
            
            if (hasToken) {
                setIsCheckingAuth(false);
                return;
            }
            
            // If we don't have a token but have a user in Redux, we might be in the middle of auth
            if (user) {
                // Wait a moment for the auth state to update
                const timer = setTimeout(() => {
                    setIsCheckingAuth(false);
                }, 1000);
                return () => clearTimeout(timer);
            }
            
            // If we get here, we're not authenticated
            navigate('/login', { 
                state: { from: location.pathname },
                replace: true 
            });
            setIsCheckingAuth(false);
        }
    }, [user, isAuthenticated, navigate, location, isCheckingAuth]);

    // Show loading state while checking auth
    if (isCheckingAuth || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    // If we have a user, render the protected content
    if (user && isAuthenticated) {
        return <>{children}</>;
    }

    // If we get here, we're not authenticated and shouldn't render anything
    // The useEffect will handle the navigation
    return null;
};

export default ProtectedRoute;