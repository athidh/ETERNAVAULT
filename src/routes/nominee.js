const express = require('express');
const router = express.Router();
const {
    registerNominee,
    loginNominee,
    getNomineeProfile,
    getNomineeAssets,
    updateNomineeProfile
} = require('../controllers/nomineeController');
const { protectNominee } = require('../middleware/auth');

// --- Public Routes ---
router.post('/register', registerNominee);
router.post('/login', loginNominee);

// --- Protected Routes ---
router.get('/profile', protectNominee, getNomineeProfile);
router.get('/assets', protectNominee, getNomineeAssets);
router.put('/profile', protectNominee, updateNomineeProfile);

module.exports = router;
