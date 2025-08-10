import React, { useEffect, useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '@/utils/apiClient';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser } from '@/redux/authSlice';
import { Loader2 } from 'lucide-react';

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
            const res = await apiClient.post('/user/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
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
                                <span className="ml-2 text-sm text-gray-500">
                                    {input.file.name}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button 
                            type="submit" 
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : 'Create account'}
                        </Button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-500 hover:text-blue-700 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
