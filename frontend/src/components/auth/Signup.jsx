import React, { useEffect, useState ,useMemo} from 'react';

import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiClient from '@/utils/apiClient';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser } from '@/redux/authSlice';
import { Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';


const Signup = () => {
     
    const [input, setInput] = useState({
        fullname: "",
        username: "",  
        email: "",
        phoneNumber: "",
        password: "",
        file: null,
    });

    const { loading, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const changeFileHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("username", input.username); 
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("password", input.password);
        
        if (input.file) {
            formData.append("profilePhoto", input.file);
        }

        try {
            dispatch(setLoading(true));
            const res = await apiClient.post('/api/v1/user/register', formData, {
                headers: { 'Content-Type': "multipart/form-data" },
                withCredentials: true,
            });

            if (res.data.success) {
                dispatch(setUser(res.data.user));
                localStorage.setItem("username", res.data.user.username);
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Signup failed");
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleGoogleSignup = async (response) => {
        try {
          const { credential } = response;
          if (!credential) return toast.error("Google login failed");
    
          // Send the Google token to your backend for verification and login
          const res = await axios.post(
            '/api/v1/user/google-login',
            { token: credential }, // Send token and role
            { withCredentials: true }
          );
    
          if (res.data.success) {
            localStorage.setItem("username", res.data.user.username);
            dispatch(setUser(res.data.user));
            navigate("/");
            toast.success(res.data.message);
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          console.error("Google Login Error:", error);
          toast.error("Google login failed. Try again later.");
        }
      };
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            {/* Logo and Header */}
            <div className="w-full max-w-md px-8 py-6">
                <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center justify-center mb-2">
                        <h1 className="text-3xl font-bold">
                          <span className="text-blue-500">Job</span>
                          <span className="text-gray-800 dark:text-white">Portal</span>
                        </h1>
                    </div>
                    <p className="text-xl font-light text-gray-600">Make the most of your professional life</p>
                </div>
            </div>
            
            {/* Signup Form Container */}
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">Join now</h2>
                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">Full Name</Label>
                        <Input 
                            type="text" 
                            name="fullname" 
                            value={input.fullname} 
                            onChange={changeEventHandler} 
                            placeholder="Enter your full name" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required 
                        />
                    </div>

                    <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">Username</Label>
                        <Input 
                            type="text" 
                            name="username" 
                            value={input.username} 
                            onChange={changeEventHandler} 
                            placeholder="Choose a username" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required 
                        />
                    </div>

                    <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">Email</Label>
                        <Input 
                            type="email" 
                            name="email" 
                            value={input.email} 
                            onChange={changeEventHandler} 
                            placeholder="Enter your email" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required 
                        />
                    </div>

                    <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</Label>
                        <Input 
                            type="tel" 
                            name="phoneNumber" 
                            value={input.phoneNumber} 
                            onChange={changeEventHandler} 
                            placeholder="Enter your phone number" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required 
                        />
                    </div>

                    <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">Password</Label>
                        <Input 
                            type="password" 
                            name="password" 
                            value={input.password} 
                            onChange={changeEventHandler} 
                            placeholder="Create a password" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required 
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            6 or more characters
                        </p>
                    </div>

                    <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture (Optional)</Label>
                        <div className="mt-1 flex items-center">
                            <label className="cursor-pointer">
                                <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                    Upload a photo
                                </span>
                                <Input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={changeFileHandler} 
                                    className="hidden" 
                                />
                            </label>
                            {input.file && (
                                <span className="ml-2 text-sm text-gray-600">{input.file.name}</span>
                            )}
                        </div>
                    </div>

                    <p className="text-xs text-gray-500">
                        By clicking Agree & Join, you agree to the JobPortal <a href="#" className="text-blue-600 hover:underline">User Agreement</a>, 
                        <a href="#" className="text-blue-600 hover:underline"> Privacy Policy</a>, and 
                        <a href="#" className="text-blue-600 hover:underline"> Cookie Policy</a>.
                    </p>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : 'Agree & Join'}
                    </Button>

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
                            onSuccess={handleGoogleSignup}
                            onError={() => toast.error("Google Signup Failed")}
                            shape="rectangular"
                            size="large"
                            width="100%"
                            text="signup_with"
                            theme="outline"
                            className="w-full"
                        />
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Already on JobPortal?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
