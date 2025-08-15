import { useEffect } from 'react';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SSOCallback = () => {
  const { signIn, setActive } = useSignIn();
  const { signUp } = useSignUp();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the role from session storage
        const role = sessionStorage.getItem('userRole');
        
        // Complete the sign-in process
        const result = await signIn.attemptFirstFactor({
          strategy: 'oauth_google',
          redirectUrl: '/sso-callback',
        });

        if (result.status === 'complete') {
          // Set the active session
          await setActive({ session: result.createdSessionId });
          
          // Redirect based on role
          const redirectPath = role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard';
          navigate(redirectPath);
          
          // Clear the role from session storage
          sessionStorage.removeItem('userRole');
        } else {
          // Handle other statuses if needed
          console.error('Unexpected status during sign-in:', result.status);
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
        }
      } catch (err) {
        console.error('Error during SSO callback:', err);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [signIn, setActive, signUp, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default SSOCallback;
