import express from "express";
import { signup, login, getMe, updateMe } from "../controllers/recruiter.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { companyLogoUpload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/signup", companyLogoUpload, signup);

router.post("/login", login);

// Protected routes (require authentication)
router.use(isAuthenticated);

router.get("/me", getMe);

router.patch("/update-me", updateMe);

export default router;
