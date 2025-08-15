console.log('Webhook controller loaded');

import { Webhook } from 'svix';
import User from '../models/user.model.js';


/**
 * Handle Clerk webhook events
 * This endpoint receives webhook events from Clerk and processes them
 */
export const handleClerkWebhook = async (req, res) => {
    console.log('=== NEW WEBHOOK REQUEST ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Raw body:', req.rawBody);
    console.log('Parsed body:', req.body);

    try {
        const svixId = req.headers['svix-id'];
        const svixTimestamp = req.headers['svix-timestamp'];
        const svixSignature = req.headers['svix-signature'];
        
        // For testing, bypass signature verification if test signature is used
        const isTestRequest = svixSignature === 'test-signature';
        
        if (!isTestRequest && (!svixId || !svixTimestamp || !svixSignature)) {
            console.error('Missing required headers');
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required headers',
                headers: { svixId, svixTimestamp, svixSignature }
            });
        }

        const payload = req.body;
        if (!payload) {
            console.error('Missing request body');
            return res.status(400).json({ 
                success: false, 
                error: 'Missing request body' 
            });
        }

        let evt;
        
        try {
            if (!isTestRequest) {
                const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
                evt = wh.verify(JSON.stringify(payload), {
                    'svix-id': svixId,
                    'svix-timestamp': svixTimestamp,
                    'svix-signature': svixSignature
                });
                console.log('Webhook verified successfully');
            } else {
                // For test requests, use the payload directly
                evt = payload;
                console.log('Test webhook request - processing directly');
            }
            
            console.log('Event type:', evt.type);
            console.log('Event data:', JSON.stringify(evt.data, null, 2));

            // Handle the event
            const eventType = evt.type;
            console.log('Processing event type:', eventType);

            if (eventType === 'user.created' || eventType === 'user.updated') {
                const { id, first_name, last_name, email_addresses } = evt.data;
                const email = email_addresses?.[0]?.email_address;
                
                console.log('Processing user:', { id, first_name, last_name, email });

                if (!id || !email) {
                    console.error('Missing required user data');
                    return res.status(400).json({ 
                        success: false,
                        error: 'Missing required user data',
                        data: { id, email }
                    });
                }

                // Check if user exists
                const existingUser = await User.findOne({ clerkUserId: id });
                
                if (existingUser) {
                    // Update existing user
                    existingUser.firstName = first_name || existingUser.firstName;
                    existingUser.lastName = last_name || existingUser.lastName;
                    existingUser.email = email;
                    await existingUser.save();
                    console.log('Updated user in database:', existingUser);
                    return res.status(200).json({ 
                        success: true, 
                        message: 'User updated',
                        user: existingUser
                    });
                } else {
                    // Create new user
                    const newUser = await User.create({
                        clerkUserId: id,
                        firstName: first_name || '',
                        LastName: last_name || '',
                        email: email
                    });
                    console.log('Created new user in database:', newUser);
                    return res.status(201).json({ 
                        success: true, 
                        message: 'User created',
                        user: newUser
                    });
                }
            }

            return res.status(200).json({ 
                success: true, 
                message: 'Webhook received but no action taken',
                event: eventType
            });
            
        } catch (err) {
            console.error('Webhook processing error:', err);
            return res.status(400).json({ 
                success: false,
                error: 'Error processing webhook',
                details: err.message
            });
        }
    } catch (error) {
        console.error('Error in webhook handler:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
};

/**
 * Handle user creation/updates from Clerk
 * @param {Object} userData - User data from Clerk
 */
const handleUserUpsert = async (userData) => {
    console.log('=== USER DATA FROM CLERK ===');
    console.log('User Data:', JSON.stringify(userData, null, 2));
    
    const { id: clerkId, email_addresses, first_name, last_name, image_url, username } = userData;
    
    // Get primary email
    const primaryEmail = email_addresses?.find(email => email.id === userData.primary_email_address_id)?.email_address;
    
    console.log('Extracted Data:', { clerkId, primaryEmail, first_name, last_name, username });
    
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

    console.log('User Data to Update:', userDataToUpdate);

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
    const { id: clerkUserId } = userData;
    
    // Delete the user from your database
    const result = await User.findOneAndDelete({ clerkUserId });

    if (!result) {
        console.warn(`User ${clerkUserId} not found for deletion`);
        return null;
    }

    console.log(`User ${clerkUserId} deleted successfully`);
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