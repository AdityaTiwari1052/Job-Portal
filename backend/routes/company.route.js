import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getCompany, getCompanyById, registerCompany, updateCompany } from "../controllers/company.controller.js";
import { multiUpload } from "../middlewares/multer.js";

const router = express.Router();

// Add multiUpload middleware to handle file uploads for company registration
router.route("/register").post(isAuthenticated, multiUpload, registerCompany);
router.route("/get").get(isAuthenticated, getCompany);
router.route("/get/:id").get(isAuthenticated, getCompanyById);
router.route("/update/:id").put(isAuthenticated, multiUpload, updateCompany);

export default router;
