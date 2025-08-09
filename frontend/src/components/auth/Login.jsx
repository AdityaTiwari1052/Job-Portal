import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
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
    identifier: "", // Can be email or username
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
    
    // Basic validation
    if (!input.identifier || !input.password) {
      toast.error("Please enter both email/username and password");
      return;
    }
    
    dispatch(setLoading(true));
    try {
      const res = await apiClient.post('/user/login', {
        identifier: input.identifier, // Changed from email to identifier
        password: input.password,
      });

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
        const redirectTo = location.state?.from?.pathname || '/';
        navigate(redirectTo);
      }
    } catch (error) {
      // Show specific error message from backend if available
      const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
      console.error("Login error:", error.response?.data || error.message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      dispatch(setLoading(true));
      
      // Decode the JWT token from Google
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name, picture } = decoded;

      // Send the credential to your backend for verification
      const response = await apiClient.post('/auth/google', {
        credential: credentialResponse.credential
      });

      if (response.data.success) {
        dispatch(setUser(response.data.user));
        toast.success("Successfully logged in with Google");
        const redirectTo = location.state?.from?.pathname || '/';
        navigate(redirectTo);
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.response?.data?.message || 'Google login failed');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <GoogleOAuthProvider clientId="689062314057-6j3nbkadvp52ko4tsklj69me9j74oc18.apps.googleusercontent.com">
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
                id="identifier"
                name="identifier"
                type="text"
                placeholder="Enter your email or username"
                value={input.identifier}
                onChange={changeEventHandler}
                required
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
              onError={() => {
                console.log('Login Failed');
                toast.error('Google login failed. Please try again.');
              }}
              useOneTap
              auto_select
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="100%"
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
    </GoogleOAuthProvider>
  );
};

export default Login;
