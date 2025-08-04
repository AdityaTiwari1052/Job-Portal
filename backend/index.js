import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import postRoutes from "./routes/post.route.js";
import applicationRoute from "./routes/application.route.js";
import path from "path";


dotenv.config({});

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

const corsOptions = {
  origin: "https://job-portal-v3b1.onrender.com",
    
    
  credentials: true, // This is important for including cookies in the request
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['set-cookie', 'Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

const PORT = process.env.PORT || 5000;
const __dirname=path.resolve();



// ✅ API Routes
app.use("/api/v1/user", userRoute);
app.use("/api/posts", postRoutes); 
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/auth", userRoute);
app.use(express.static(path.join(__dirname,"/frontend/dist")));
app.get('*', (req,res)=>{
  res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"));
})

// ✅ Start Server
const startServer = async () => {
  await connectDB(); // Ensure database is connected first
  app.listen(PORT, () => {
      console.log(`✅ Server running at port ${PORT}`);
  });
};

startServer();