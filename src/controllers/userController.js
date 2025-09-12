const User = require('../models/user');
const Asset = require('../models/asset');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const executorService = require('../services/executorService'); // We will create this later

//    Register a new user
const registerUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//   Authenticate user & get toke
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Add a new social media asset

const addAsset = async (req, res) => {
    const { platform, profileUrl, instruction, legacyContactEmail } = req.body;
    
    // The user's ID comes from the 'protect' middleware
    const userId = req.user.id;

    try {
        const asset = new Asset({
            owner: userId,
            platform,
            profileUrl,
            instruction,
            legacyContactEmail
        });

        const createdAsset = await asset.save();
        res.status(201).json(createdAsset);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all assets for a user
// @route   GET /api/users/assets
// @access  Private
const getUserAssets = async (req, res) => {
    try {
        const assets = await Asset.find({ owner: req.user.id });
        res.json(assets);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


// @desc    Trigger the post-death protocol (ADMIN ONLY for demo)
// @route   POST /api/users/:id/confirm-death
// @access  Private/Admin
const confirmDeath = async (req, res) => {
    const { id } = req.params;
    try {
        // In a real app, you'd have strong admin authentication here.
        // The controller's job is just to receive the request and call the service.
        await executorService.initiateProtocol(id);
        res.status(200).json({ message: `Protocol initiated for user ${id}.` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to initiate protocol', error: error.message });
    }
};


module.exports = {
    registerUser,
    loginUser,
    addAsset,
    getUserAssets,
    confirmDeath
};
