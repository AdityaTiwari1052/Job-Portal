import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.route.js"
import connectDB from "./utils/db.js";
import jobRoute from "./routes/job.route.js";
import recruiterRoute from "./routes/recruiter.route.js";
import webhookRoutes from './routes/webhook.route.js';
import testEndpoint from "./test-endpoint.js";

const app = express();

// Body parsers
app.use(express.json({ verify: (req, res, buf) => {
    req.rawBody = buf.toString();
}}));
app.use(express.urlencoded({ extended: true, verify: (req, res, buf) => {
    req.rawBody = buf.toString();
}}));
app.use(cookieParser());

// Request logging middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://localhost:8000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://job-portal-v3b1.onrender.com',
  'http://job-portal-v3b1.onrender.com'
];

// Configure CORS with enhanced security headers
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      return callback(null, true);
    }
    
    console.log('CORS blocked for origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Important for cookies/session
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept',
    'Origin',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Authorization',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials'
  ],
  maxAge: 600, // 10 minutes
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS with options as one of the first middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Add headers before the routes are defined
app.use(function (req, res, next) {
  // Allow from any origin
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  // Skip logging for health checks
  if (req.originalUrl === '/health') {
    return next();
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  
  // Make a copy of the body for logging
  const bodyCopy = { ...req.body };
  if (bodyCopy.password) {
    bodyCopy.password = '***REDACTED***';
  }
  
  console.log('Parsed body:', JSON.stringify(bodyCopy, null, 2));
  console.log('Content-Type:', req.get('Content-Type'));
  
  // Log the raw body for debugging
  const originalEnd = res.end;
  const chunks = [];
  
  // Intercept the response to log it
  res.end = function(chunk, ...args) {
    if (chunk) {
      // Handle both Buffer and string chunks
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      } else if (typeof chunk === 'string') {
        chunks.push(Buffer.from(chunk, 'utf8'));
      }
    }
    
    let body = '';
    if (chunks.length > 0) {
      body = Buffer.concat(chunks).toString('utf8');
    }
    
    console.log('\n=== RESPONSE ===');
    console.log(`Status: ${res.statusCode}`);
    try {
      if (body) {
        const jsonResponse = JSON.parse(body);
        console.log('Response body:', JSON.stringify(jsonResponse, null, 2));
      } else {
        console.log('Response body: (empty)');
      }
    } catch (e) {
      console.log('Response body (non-JSON):', body || '(empty)');
    }
    
    // Call the original end function
    return originalEnd.call(res, chunk, ...args);
  };
  
  next();
});

// Add security headers middleware
app.use((req, res, next) => {
  // Set security headers
  // Relaxed security headers - removed COEP/CORP to allow external resource loading
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  
  // For Cloudinary and other external resources
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; img-src 'self' data: https: http:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline'; connect-src 'self' https://job-portal-v3b1.onrender.com http://localhost:8000 https://api.cloudinary.com; frame-src 'self' https://accounts.google.com; font-src 'self' data:; media-src 'self' data: https: http:;"
  );
  
  next();
});

const PORT = process.env.PORT || 8000;
app.use('/api/v1/user', userRouter);
app.use('/api/v1/webhooks', webhookRoutes);
app.use("/api/v1/jobs",jobRoute);
app.use("/api/v1/recruiter", recruiterRoute);

// Test logging endpoint
app.use('/test', testEndpoint);

// Health check endpoint
app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "frontend", "dist", "index.html"));
});

// Start Server
const startServer = async () => {
  await connectDB(); // Ensure database is connected first
  app.listen(PORT, () => {
      console.log(`✅ Server running at port ${PORT}`);
  });
};

startServer();