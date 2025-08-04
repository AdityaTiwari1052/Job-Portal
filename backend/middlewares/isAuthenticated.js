import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    console.log('=== AUTH MIDDLEWARE ===');
    console.log('Request headers:', req.headers);
    console.log('Cookies:', req.cookies);
    
    const token = req.cookies?.token;
    console.log('Token from cookie:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const decode = await jwt.verify(token, process.env.SECRET_KEY);
    console.log('Decoded token:', decode);
    
    if (!decode) {
      console.log('Token verification failed');
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    req.user = { _id: decode.userId };
    console.log('Authentication successful for user ID:', decode.userId);
    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: "Session expired. Please log in again.",
        success: false,
        expired: true
      });
    }
    res.status(500).json({ 
      message: "Authentication error", 
      error: error.message,
      success: false
    });
  }
};

export default isAuthenticated;
