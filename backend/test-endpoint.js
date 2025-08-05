import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Simple test endpoint
router.get('/test-log', (req, res) => {
    const logMessage = `[${new Date().toISOString()}] Test log message\n`;
    
    // Log to console
    console.log('\n=== TEST LOG MESSAGE ===');
    console.log(logMessage);
    
    // Also log to a file
    const logPath = path.join(process.cwd(), 'debug.log');
    fs.appendFileSync(logPath, logMessage);
    
    res.json({
        success: true,
        message: 'Test log written',
        logPath: logPath
    });
});

export default router;
