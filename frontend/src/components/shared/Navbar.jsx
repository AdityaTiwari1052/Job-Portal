import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser, UserButton, useAuth, SignInButton } from '@clerk/clerk-react';
import { Button } from '../ui/button';
import { Menu, X } from 'lucide-react';
import RecruiterAuthModal from '../auth/RecruiterAuthModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Check recruiter auth status on mount and when location changes
  useEffect(() => {
    const checkRecruiterAuth = async () => {
      const token = localStorage.getItem('recruiterToken');
      if (token) {
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
            // If on home page and recruiter is logged in, redirect to dashboard
            if (window.location.pathname === '/') {
              navigate('/dashboard');
            }
          } else {
            setIsRecruiter(false);
            localStorage.removeItem('recruiterToken');
            localStorage.removeItem('recruiterData');
          }
        } catch (error) {
          console.error('Error checking recruiter auth:', error);
          setIsRecruiter(false);
          localStorage.removeItem('recruiterToken');
          localStorage.removeItem('recruiterData');
        }
      } else {
        setIsRecruiter(false);
      }
    };

    checkRecruiterAuth();
  }, [navigate, location.pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Don't show navbar on auth pages
  if (location.pathname.startsWith('/sign-')) {
    return null;
  }

  const handleRecruiterLogin = (e) => {
    e.preventDefault();
    setIsRecruiterModalOpen(true);
  };

  const handleRecruiterLogout = () => {
    localStorage.removeItem('recruiterToken');
    localStorage.removeItem('recruiterData');
    setIsRecruiter(false);
    navigate('/');
    window.location.reload();
  };

  const handleRecruiterSuccess = () => {
    setIsRecruiterModalOpen(false);
    setIsRecruiter(true);
    navigate('/dashboard');
    window.location.reload(); // Force a full page reload to ensure state is updated
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.svg" alt="Job Portal" className="h-8 w-auto" />
          </Link>

          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-6 md:flex">
              {isRecruiter && (
                <Link 
                  to="/dashboard" 
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
              )}
              {isSignedIn && !isRecruiter && (
                <Link 
                  to="/applied-jobs" 
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  My Applications
                </Link>
              )}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {isRecruiter ? (
                <Button 
                  onClick={handleRecruiterLogout}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  Logout
                </Button>
              ) : isSignedIn ? (
                <div className="flex items-center space-x-4">
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <div className="hidden items-center space-x-3 md:flex">
                  <SignInButton mode="modal" afterSignInUrl="/" afterSignUpUrl="/">
                    <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white border-0">
                      User Login
                    </Button>
                  </SignInButton>
                  <Button 
                    onClick={handleRecruiterLogin} 
                    className="bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Recruiter Login
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 border-t px-4 py-3">
              {isRecruiter ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleRecruiterLogout}
                    className="w-full text-left block px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : isSignedIn ? (
                <Link
                  to="/applied-jobs"
                  className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  My Applications
                </Link>
              ) : (
                <div className="space-y-3 px-3 pt-2">
                  <SignInButton mode="modal" afterSignInUrl="/" afterSignUpUrl="/">
                    <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
                      User Login
                    </Button>
                  </SignInButton>
                  <Button 
                    onClick={handleRecruiterLogin}
                    className="w-full bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Recruiter Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Recruiter Auth Modal */}
      <RecruiterAuthModal 
        isOpen={isRecruiterModalOpen}
        onClose={() => setIsRecruiterModalOpen(false)}
        onSuccess={handleRecruiterSuccess}
      />
    </>
  );
};

export default Navbar;
