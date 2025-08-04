import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { USER_API_END_POINT } from '@/utils/constant';

const VerifyOtp = () => {
    const [otp, setOtp] = useState('');
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${USER_API_END_POINT}/verify-email`, { email: user.email, otp }, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate('/');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to verify OTP.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">Verify Your Email</h2>
                <p className="text-center text-gray-600">An OTP has been sent to your email address. Please enter it below to verify your account.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="otp" className="text-sm font-medium text-gray-700">OTP</label>
                        <input
                            id="otp"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Verify OTP
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyOtp;
