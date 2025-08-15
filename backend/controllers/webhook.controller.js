import { Webhook } from 'svix';
import User from '../models/user.model.js';


/**
 * Handle Clerk webhook events
 * This endpoint receives webhook events from Clerk and processes them
 */
export const handleClerkWebhook = async (req, res, next) => {
    try {
        // 1. Verify the webhook signature
        const svixId = req.headers['svix-id'];
        const svixTimestamp = req.headers['svix-timestamp'];
        const svixSignature = req.headers['svix-signature'];

        // Verify required headers are present
        if (!svixId || !svixTimestamp || !svixSignature) {
            console.error('Missing required headers');
            return next(new AppError('Missing required headers', 400));
        }

        // Get the raw body
        const payload = req.body;
        if (!payload) {
            return next(new AppError('Missing request body', 400));
        }

        // Verify the webhook signature
        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        let evt;
        
        try {
            evt = wh.verify(JSON.stringify(payload), {
                'svix-id': svixId,
                'svix-timestamp': svixTimestamp,
                'svix-signature': svixSignature,
            });
        } catch (err) {
            console.error('Webhook verification failed:', err);
            return next(new AppError('Invalid webhook signature', 400));
        }

        // Process the webhook event
        const eventType = evt.type;
        const eventData = evt.data;

        console.log(`Processing webhook event: ${eventType}`);

        try {
            switch (eventType) {
                case 'user.created':
                case 'user.updated':
                    await handleUserUpsert(eventData);
                    break;
                case 'user.deleted':
                    await handleUserDelete(eventData);
                    break;
                case 'session.ended':
                case 'session.revoked':
                    await handleSessionEnd(eventData);
                    break;
                default:
                    console.log(`Unhandled event type: ${eventType}`);
            }

            res.status(200).json({ 
                success: true, 
                message: 'Webhook processed successfully' 
            });
        } catch (error) {
            console.error('Error processing webhook event:', error);
            next(new AppError('Failed to process webhook', 500));
        }
    } catch (error) {
        console.error('Webhook processing error:', error);
        next(error);
    }
};

/**
 * Handle user creation/updates from Clerk
 * @param {Object} userData - User data from Clerk
 */
const handleUserUpsert = async (userData) => {
    const { id: clerkId, email_addresses, first_name, last_name, image_url, username } = userData;
    
    // Get primary email
    const primaryEmail = email_addresses?.find(email => email.id === userData.primary_email_address_id)?.email_address;
    
    if (!primaryEmail) {
        console.error('No primary email found for user:', clerkId);
        throw new Error('No primary email found');
    }

    // Prepare user data
    const userDataToUpdate = {
        email: primaryEmail,
        username: username || primaryEmail.split('@')[0],
        name: [first_name, last_name].filter(Boolean).join(' ') || primaryEmail.split('@')[0],
        profilePicture: image_url,
        lastSyncedAt: new Date()
    };

    // Update or create user
    const user = await User.findOneAndUpdate(
        { clerkId },
        { 
            $set: userDataToUpdate,
            $setOnInsert: { 
                role: 'jobseeker', // Default role
                createdAt: new Date()
            }
        },
        { 
            upsert: true, 
            new: true,
            runValidators: true
        }
    );

    console.log(`User ${clerkId} synced successfully`);
    return user;
};

/**
 * Handle user deletion from Clerk
 * @param {Object} userData - User data from Clerk
 */
const handleUserDelete = async (userData) => {
    const { id: clerkId } = userData;
    
    // Soft delete by marking as inactive instead of removing
    const result = await User.findOneAndUpdate(
        { clerkId },
        { 
            $set: { 
                isActive: false,
                deletedAt: new Date()
            } 
        },
        { new: true }
    );

    if (!result) {
        console.warn(`User ${clerkId} not found for deletion`);
        return null;
    }

    console.log(`User ${clerkId} marked as inactive`);
    return result;
};

/**
 * Handle session end/revoke events
 * @param {Object} sessionData - Session data from Clerk
 */
const handleSessionEnd = async (sessionData) => {
    // You can add session cleanup logic here if needed
    console.log(`Session ended/revoked for user: ${sessionData.user_id}`);
    return true;
};