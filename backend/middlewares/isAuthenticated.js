import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            return next();
        }

        // 1. Get token from Authorization header or cookies
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.split(' ')[1] 
            : req.cookies.token;

        console.log('Auth Header:', authHeader);
        console.log('Token:', token ? 'Token exists' : 'No token found');

        if (!token) {
            console.log('No token provided');
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in."
            });
        }

        // 2. Verify the token
        let decoded;
        try {
            decoded = await jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);
        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError.message);
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token. Please log in again.",
                error: jwtError.message
            });
        }

        // 3. Check if token has required data
        if (!decoded || !decoded.id) {
            console.error('Invalid token payload:', decoded);
            return res.status(401).json({
                success: false,
                message: "Invalid token format. Please log in again."
            });
        }

        // 4. Set user in request object (using both req.user and req.id for compatibility)
        req.user = { _id: decoded.id };
        req.id = decoded.id; // For backward compatibility
        
        // Set CORS headers
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        
        console.log('Authentication successful for user ID:', decoded.id);
        next();

    } catch (error) {
        console.error("Authentication error:", error);
        // Set CORS headers for error responses
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        
        return res.status(500).json({
            success: false,
            message: "Authentication failed. Please try again.",
            error: error.message
        });
    }
};

export default isAuthenticated;