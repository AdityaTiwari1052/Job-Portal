import express from 'express';
import { handleClerkWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

// Test endpoint to verify webhook route is working
router.get('/test', (req, res) => {
    console.log('Webhook test endpoint hit');
    res.status(200).json({ status: 'success', message: 'Webhook route is working' });
});

// Clerk webhook endpoint
router.post('/clerk', express.raw({ type: 'application/json' }), handleClerkWebhook);

export default router;