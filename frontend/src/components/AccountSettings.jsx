import React, { useState } from "react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/authSlice";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AccountSettings = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State for different settings
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [otp, setOtp] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Separate loading states for each action
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);

  /** ✅ Update Email */
 

  /** ✅ Send OTP for Phone Verification */
  const handleSendOtp = async () => {
    if (!phone) return toast.error("Phone number is required.");
    try {
      setLoadingOtp(true);
      const res = await axios.post(`${USER_API_END_POINT}/send-otp`, { phoneNumber: phone }, { withCredentials: true });
      toast.success("OTP sent successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoadingOtp(false);
    }
  };

  /** ✅ Verify OTP and Update Phone Number */
  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("OTP is required.");
    try {
      setLoadingPhone(true);
      const res = await axios.put(`${USER_API_END_POINT}/update-phone`, { phoneNumber: phone, otp }, { withCredentials: true });
      dispatch(setUser({ ...user, phoneNumber: phone }));
      toast.success("Phone number updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoadingPhone(false);
    }
  };

  /** ✅ Change Password */
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      return toast.error("Both fields are required.");
    }
    try {
      setLoadingPassword(true);
      const res = await axios.put(
        `${USER_API_END_POINT}/change-password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password.");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-6 bg-dark shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>

      {/* ✅ Update Email */}
      <div className="mb-4">
        <Label>Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="New Email" />
      </div>

      {/* ✅ Update Phone Number */}
      <div className="mb-4">
        <Label>Phone Number</Label>
        <Input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="New Phone Number" />
        <Button onClick={handleSendOtp} className="mt-2">
          {loadingOtp ? <Loader2 className="animate-spin" /> : "Send OTP"}
        </Button>
        <Input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="mt-2" />
        <Button onClick={handleVerifyOtp} className="mt-2">
          {loadingPhone ? <Loader2 className="animate-spin" /> : "Verify & Update Phone"}
        </Button>
      </div>

      {/* ✅ Change Password */}
      <div className="mb-4">
        <Label>Current Password</Label>
        <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current Password" />
        <Label className="mt-2">New Password</Label>
        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" />
        <Button onClick={handleChangePassword} className="mt-2">
          {loadingPassword ? <Loader2 className="animate-spin" /> : "Change Password"}
        </Button>
      </div>
    </div>
  );
};

export default AccountSettings;
