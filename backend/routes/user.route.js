import express from "express";
import { getUserById, googleLogin, login, logout, register, updateProfile } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { multiUpload, singleUpload } from "../middlewares/multer.js";
import { forgotPassword ,toggleFollow,getNotifications,markAllNotificationsAsRead } from "../controllers/user.controller.js";
import { sendOtpForPhoneVerification ,changePassword,updatePhoneNumber,verifyOtpforgotpassword } from "../controllers/user.controller.js";
import { getGitHubClientId, handleGitHubCallback, getUserProfile, searchUsers, getMyProfile, getAllUsers } from "../controllers/user.controller.js";

 
const router = express.Router();
router.post("/google-login", googleLogin);
router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").get(logout);

router.post("/forgot-password", forgotPassword)
router.post("/forgotpassword-verification", verifyOtpforgotpassword); 

// Handle profile update with file uploads
router.post(
  "/profile/update",
  isAuthenticated,
  multiUpload, // This already includes the fields configuration
  updateProfile
);

router.put("/change-password", isAuthenticated, changePassword);

router.post("/send-otp", isAuthenticated, sendOtpForPhoneVerification);
router.put("/update-phone", isAuthenticated, updatePhoneNumber);
router.get("/search/:username", isAuthenticated, searchUsers);
router.get("/profile/:username", isAuthenticated, getUserProfile);
router.get("/all", isAuthenticated, getAllUsers);

router.post("/:id/follow", isAuthenticated, toggleFollow);
// 🔥 Add this at the bottom (after other `/:param` routes)


router.get("/me", isAuthenticated, getMyProfile);
  
router.get("/notifications", isAuthenticated, getNotifications);
router.put("/notifications/mark-all-read", isAuthenticated, markAllNotificationsAsRead);
// Get user by ID - using /by-id/ to avoid conflict with other routes
router.get("/by-id/:id", getUserById); 
router.get("/github/client-id", getGitHubClientId);

router.get("/github/callback", handleGitHubCallback);





export default router;

