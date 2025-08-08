import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import apiClient from '@/utils/apiClient';
import { toast } from "sonner";
import axios from "axios";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

const Verifyforgotpassword = () => {
  const location = useLocation();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        '/api/v1/user/forgotpassword-verification',
        { email, otp, newPassword }
      );
      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center max-w-7xl mx-auto">
        <div className="w-1/2 border border-gray-200 rounded-md p-6 my-10">
          <h1 className="font-bold text-xl mb-5 text-center">Verify OTP</h1>
          <form onSubmit={handleSubmit}>
            <div className="my-2">
              <Label>OTP Code</Label>
              <InputOTP
                maxLength={6} // ✅ Ensure the correct number of OTP slots
                value={otp}
                onChange={setOtp}
                className="flex justify-between"
              >
                <InputOTPGroup>
                  {Array(6)
                    .fill(0)
                    .map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="my-2">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full my-4" disabled={loading}>
              {loading ? "Verifying..." : "Reset Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Verifyforgotpassword;
