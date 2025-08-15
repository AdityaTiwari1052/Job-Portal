import express from 'express';
import { handleClerkWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

// Test endpoint to verify webhook route is working
router.get('/test', (req, res) => {
    console.log('Webhook test endpoint hit');
    res.status(200).json({ status: 'success', message: 'Webhook route is working' });
});

// Middleware to handle raw body
const rawBodySaver = (req, res, buf, encoding) => {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
};

// Clerk webhook endpoint
router.post('/clerk', 
    // Parse raw body
    express.raw({ 
        verify: rawBodySaver,
        type: 'application/json' 
    }),
    
    // Process the request
    (req, res, next) => {
        try {
            // Parse the raw body to JSON
            if (req.rawBody) {
                req.body = JSON.parse(req.rawBody);
            }
            next();
        } catch (err) {
            console.error('Error parsing webhook body:', err);
            return res.status(400).json({ error: 'Invalid JSON payload' });
        }
    },
    
    // Handle the webhook
    handleClerkWebhook
);

export default router;