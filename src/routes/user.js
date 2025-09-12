const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    addAsset,
    getUserAssets,
    confirmDeath,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// --- Public Routes ---
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- Protected Routes ---
router.route('/assets').post(protect, addAsset).get(protect, getUserAssets);

//demo
router.post('/:id/confirm-death', protect, confirmDeath);


module.exports = router;
