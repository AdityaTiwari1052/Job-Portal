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
import testEndpoint from "./test-endpoint.js";
import path from "path";


dotenv.config({});

const app = express();

// ✅ Middleware
// Body parsers
app.use(express.json({ verify: (req, res, buf) => {
    req.rawBody = buf.toString();
}}));
app.use(express.urlencoded({ extended: true, verify: (req, res, buf) => {
    req.rawBody = buf.toString();
}}));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  // Skip logging for health checks
  if (req.originalUrl === '/health') {
    return next();
  }

  console.log('\n=== INCOMING REQUEST ===');
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Query:', JSON.stringify(req.query, null, 2));
  
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

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://job-portal-v3b1.onrender.com',
  'https://your-frontend-domain.com' // Replace with your actual frontend domain
];

// Configure CORS with enhanced security headers
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Important for cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept',
    'Cross-Origin-Embedder-Policy',
    'Cross-Origin-Resource-Policy',
    'Cross-Origin-Opener-Policy'
  ],
  exposedHeaders: [
    'set-cookie', 
    'Authorization', 
    'Set-Cookie',
    'Cross-Origin-Embedder-Policy',
    'Cross-Origin-Resource-Policy',
    'Cross-Origin-Opener-Policy'
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS with options
app.use(cors(corsOptions));

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

// Add security headers
// Duplicate COEP/CORP middleware removed – handled earlier with relaxed policy

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

const PORT = process.env.PORT || 5000;
const __dirname=path.resolve();



app.use("/api/v1/user", userRoute);
app.use("/api/posts", postRoutes); 
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/auth", userRoute);

// Test logging endpoint
app.use('/test', testEndpoint);

// Health check endpoint
app.use(express.static(path.join(__dirname,"/frontend/dist")));
app.get('*', (req,res)=>{
  res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"));
})

// Start Server
const startServer = async () => {
  await connectDB(); // Ensure database is connected first
  app.listen(PORT, () => {
      console.log(`✅ Server running at port ${PORT}`);
  });
};

startServer();