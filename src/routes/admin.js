const express = require('express');
const router = express.Router();
const {
    getPendingConfirmations,
    getAllConfirmations,
    confirmDeath,
    rejectDeathConfirmation,
    getDashboardStats,
    createDeathConfirmation,
    sendTestEmail
} = require('../controllers/adminController');

// Simple admin authentication middleware (you can enhance this)
const adminAuth = (req, res, next) => {
    const adminKey = req.headers['x-admin-key'];
    
    // Simple admin key check (you should use proper authentication in production)
    if (adminKey === process.env.ADMIN_KEY || adminKey === 'eternavault-admin-2024') {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized - Admin access required' });
    }
};

// Test endpoint (no auth required for testing)
router.get('/test', (req, res) => {
    res.json({ 
        message: 'Admin routes are working!', 
        timestamp: new Date().toISOString(),
        status: 'success'
    });
});

// Apply admin authentication to all routes
router.use(adminAuth);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/confirmations/pending', getPendingConfirmations);
router.get('/confirmations/all', getAllConfirmations);

// Death confirmation management
router.post('/confirmations/create', createDeathConfirmation);
router.put('/confirmations/:id/confirm', confirmDeath);
router.put('/confirmations/:id/reject', rejectDeathConfirmation);

// Email testing
router.post('/email/test', sendTestEmail);

module.exports = router;
