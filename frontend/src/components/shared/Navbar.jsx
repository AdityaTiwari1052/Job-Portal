import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, SignInButton, SignOutButton, UserButton } from '@clerk/clerk-react';
import { Button } from '../ui/button';
import { Menu, X } from 'lucide-react';
import { User } from 'lucide-react';
import api from '../../utils/api';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check recruiter auth status on mount, route changes, and storage changes
  useEffect(() => {
    const checkRecruiterAuth = () => {
      const token = localStorage.getItem('recruiterToken');
      const recruiterData = localStorage.getItem('recruiterData');

      if (token && recruiterData) {
        try {
          const parsedData = JSON.parse(recruiterData);
          setIsRecruiter(true);
          setCompanyName(parsedData.companyName || 'Recruiter');
        } catch (e) {
          console.error('Error parsing recruiter data:', e);
          handleRecruiterLogout();
        }
      } else {
        setIsRecruiter(false);
        setCompanyName('');
      }
    };

    // Check immediately
    checkRecruiterAuth();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'recruiterToken' || e.key === 'recruiterData') {
        checkRecruiterAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically (fallback for same-tab changes)
    const interval = setInterval(checkRecruiterAuth, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [location.pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Hide navbar on recruiter dashboard routes
  if (location.pathname.startsWith('/recruiter')) {
    return null;
  }

  const handleRecruiterLogin = (e) => {
    e.preventDefault();
    navigate('/', { state: { showRecruiterLogin: true } });
  };

  const handleRecruiterLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('recruiterToken');
    localStorage.removeItem('recruiterData');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');

    // Clear any Clerk-related localStorage items
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('clerk') || key.startsWith('__clerk')) {
        localStorage.removeItem(key);
      }
    });

    // Clear any cached authorization headers
    delete api.defaults.headers.common['Authorization'];

    // Reset state
    setIsRecruiter(false);
    setCompanyName('');

    // Clear any cached API headers by reloading the page
    window.location.href = '/';
  };

  // Don't show navbar on auth pages
  if (location.pathname.startsWith('/sign-')) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Job Portal
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-6 md:flex">
              {isSignedIn && !isRecruiter && (
                <Link 
                  to="/applied-jobs" 
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  My Applications
                </Link>
              )}
              {isRecruiter && (
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
              )}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {!isSignedIn && !isRecruiter ? (
                <div className="hidden md:flex items-center space-x-4">
                  <SignInButton mode="modal">
                    <Button variant="outline">User Login</Button>
                  </SignInButton>
                  <Button 
                    onClick={handleRecruiterLogin}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Recruiter Login
                  </Button>
                </div>
              ) : isRecruiter ? (
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-sm font-medium">{companyName}</div>
                  <Button 
                    onClick={handleRecruiterLogout}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center">
                  <UserButton afterSignOutUrl="/" />
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {isRecruiter ? (
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : isSignedIn ? (
                <Link
                  to="/applied-jobs"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Applications
                </Link>
              ) : null}
              
              <div className="pt-4 pb-3 border-t border-gray-200">
                {isRecruiter ? (
                  <button
                    onClick={() => {
                      handleRecruiterLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                ) : isSignedIn ? (
                  <SignOutButton>
                    <button className="w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">
                      Sign Out
                    </button>
                  </SignOutButton>
                ) : (
                  <div className="space-y-2">
                    <SignInButton mode="modal">
                      <button className="w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">
                        User Login
                      </button>
                    </SignInButton>
                    <button
                      onClick={() => {
                        navigate('/', { state: { showRecruiterLogin: true } });
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-base font-medium text-blue-600 hover:bg-blue-50"
                    >
                      Recruiter Login
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
