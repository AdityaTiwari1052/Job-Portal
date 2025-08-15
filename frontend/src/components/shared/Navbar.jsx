import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserButton, useAuth, SignInButton, SignOutButton } from '@clerk/clerk-react';
import { Button } from '../ui/button';
import { Menu, X } from 'lucide-react';
import RecruiterAuthModal from '../auth/RecruiterAuthModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Hide navbar on dashboard routes
  if (location.pathname.startsWith('/dashboard')) {
    return null;
  }

  // Don't show navbar on auth pages
  if (location.pathname.startsWith('/sign-')) {
    return null;
  }

  // Check if user is authenticated (either through Clerk or as recruiter)
  const isAuthenticated = isSignedIn || localStorage.getItem('recruiterToken');

  const handleRecruiterLogin = (e) => {
    e.preventDefault();
    setIsRecruiterModalOpen(true);
  };

  // Handle recruiter logout
  const handleRecruiterLogout = () => {
    localStorage.removeItem('recruiterToken');
    localStorage.removeItem('recruiterData');
    window.location.href = '/';
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
              {isAuthenticated && (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/applied-jobs" 
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    My Applications
                  </Link>
                </>
              )}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {!isAuthenticated && (
                <div className="hidden md:flex items-center space-x-4">
                  <SignInButton mode="modal">
                    <Button variant="outline">Sign In</Button>
                  </SignInButton>
                  <Button 
                    onClick={handleRecruiterLogin}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Recruiter Login
                  </Button>
                </div>
              )}

              {isAuthenticated && (
                <div className="hidden md:flex items-center space-x-4">
                  {isSignedIn ? (
                    <UserButton afterSignOutUrl="/" />
                  ) : (
                    <Button 
                      onClick={handleRecruiterLogout}
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Logout
                    </Button>
                  )}
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
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/applied-jobs"
                    className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    My Applications
                  </Link>
                  <div className="pt-2">
                    {isSignedIn ? (
                      <SignOutButton>
                        <Button variant="outline" className="w-full">
                          Sign Out
                        </Button>
                      </SignOutButton>
                    ) : (
                      <Button 
                        onClick={handleRecruiterLogout}
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Logout
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-3 px-3 pt-2">
                  <SignInButton mode="modal">
                    <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
                      User Login
                    </Button>
                  </SignInButton>
                  <Button 
                    onClick={handleRecruiterLogin}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
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
      />
    </>
  );
};

export default Navbar;
