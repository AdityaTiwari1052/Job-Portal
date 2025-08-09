import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { useNavigate } from "react-router-dom";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import apiClient from '@/utils/apiClient';
import { toast } from "sonner";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post('/user/forgot-password', { email });
      
        toast.success(res.data.message);
        navigate("/verifyforgot-password", { state: { email } });
    
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center max-w-7xl mx-auto">
        <div className="w-1/2 border border-gray-200 rounded-md p-6 my-10">
          <h1 className="font-bold text-xl mb-5 text-center">Forgot Password</h1>
          <form onSubmit={handleSubmit}>
            <div className="my-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <Button type="submit" className="w-full my-4" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
