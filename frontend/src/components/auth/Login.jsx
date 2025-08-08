import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "@/redux/authSlice";
import { Loader2 } from "lucide-react";


const Login = () => {
  
    const [input, setInput] = useState({
    identifier: "", // Can be either email or username
    password: "",
  });

  const { loading, user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.successMessage) {
      toast.success(location.state.successMessage);
      navigate(".", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const HandleLogin = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    try {
            const res = await apiClient.post('/api/v1/user/login', {
        email: input.identifier, // The backend expects an 'email' field.
        password: input.password,
      });

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
        const redirectTo = location.state?.from?.pathname || '/';
        navigate(redirectTo);
      }
    } catch (error) {
      // The apiClient interceptor will automatically show a toast error.
      console.error("Login failed:", error.response?.data || error.message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleGoogleLogin = async (response) => {
    try {
      // Show loading state
      dispatch(setLoading(true));
      
      console.log('Google login response:', response);
      
      // Decode the JWT token from Google
      const { credential } = response;
      if (!credential) {
        const errorMsg = "Google login failed: No credential received";
        console.error(errorMsg);
        toast.error(errorMsg);
        return;
      }
      
      // Decode the JWT token to get user info
      let decodedToken;
      try {
        decodedToken = jwtDecode(credential);
        console.log('Decoded Google token:', decodedToken);
      } catch (decodeError) {
        console.error('Error decoding Google token:', decodeError);
        toast.error("Failed to process Google login. Please try again.");
        return;
      }
      
      const { email, name, picture } = decodedToken;
      
      if (!email || !name) {
        const errorMsg = "Could not get required user information from Google";
        console.error(errorMsg, { email, name });
        toast.error(errorMsg);
        return;
      }

      console.log('Sending Google login to backend with:', { email, name, picture });
      
      // Send user info to our backend
      let res;
      try {
        res = await apiClient.post('/google-login', {
          email,
          name,
          profilePhoto: picture
        });
        console.log('Backend response:', res.data);
      } catch (apiError) {
        console.error('API Error during Google login:', {
          message: apiError.message,
          response: apiError.response?.data,
          status: apiError.response?.status
        });
        throw apiError; // Let the catch block handle it
      }

      if (res.data && res.data.success) {
        const userData = res.data.user;
        console.log('Google login successful, user data:', userData);
        
        if (!userData || !userData._id) {
          throw new Error('Invalid user data received from server');
        }
        
        // Update Redux store with user data
        dispatch(setUser(userData));
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Show success message
        toast.success(res.data.message || "Successfully logged in with Google");
        
        // Redirect to home or intended URL
        const redirectTo = location.state?.from?.pathname || '/';
        console.log('Redirecting to:', redirectTo);
        navigate(redirectTo);
      } else {
        const errorMessage = res?.data?.message || "Google login failed - No success response";
        console.error("Google login failed:", { 
          response: res?.data,
          status: res?.status,
          statusText: res?.statusText
        });
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Google Login Error:", {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      
      let errorMessage = "An error occurred during Google login. Please try again.";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || 
                      `Server responded with ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage = "No response from server. Please check your connection.";
      }
      
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        {/* Logo Container - Similar to LinkedIn */}
        <div className="w-full max-w-md px-8 py-6">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center mb-2">
              <h1 className="text-3xl font-bold">
                <span className="text-blue-500">Job</span>
                <span className="text-gray-800 dark:text-white">Portal</span>
              </h1>
            </div>
            <p className="text-xl font-light text-gray-600">Make the most of your professional life</p>
          </div>
        </div>
        
        {/* Login Form Container */}
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">Sign in</h2>
          <form onSubmit={HandleLogin} className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Email or Username</Label>
              <Input
                type="text"
                value={input.identifier}
                name="identifier"
                onChange={changeEventHandler}
                placeholder="Email or Username"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label className="block text-sm font-medium text-gray-700">Password</Label>
                <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                value={input.password}
                name="password"
                onChange={changeEventHandler}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : 'Sign in'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="space-y-4">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Google Login Failed")}
              shape="rectangular"
              size="large"
              width="100%"
              text="signin_with"
              theme="outline"
              className="w-full"
            />
            <p className="text-xs text-gray-500 text-center mt-4">
              By clicking Continue with Google, you agree to our User Agreement and Privacy Policy.
            </p>
          </div>

          <div className="mt-8 text-center text-sm text-gray-600">
            New to JobPortal?{' '}
            <Link 
              to="/signup" 
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
            >
              Join now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
