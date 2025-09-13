const Nominee = require('../models/nominee');
const Asset = require('../models/asset');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

// Register a new nominee
const registerNominee = async (req, res) => {
    const { name, email, password, relationship, phoneNumber, address } = req.body;

    console.log('Nominee registration request:', { name, email, relationship, phoneNumber, address });

    if (!name || !email || !password || !relationship) {
        return res.status(400).json({ message: 'Please enter all required fields' });
    }

    try {
        const nomineeExists = await Nominee.findOne({ email });

        if (nomineeExists) {
            return res.status(400).json({ message: 'Nominee already exists' });
        }

        const nominee = await Nominee.create({
            name,
            email,
            password,
            relationship,
            phoneNumber,
            address
        });

        console.log('Nominee created successfully:', nominee._id);

        if (nominee) {
            res.status(201).json({
                _id: nominee._id,
                name: nominee.name,
                email: nominee.email,
                relationship: nominee.relationship,
                token: generateToken(nominee._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid nominee data' });
        }
    } catch (error) {
        console.error('Error registering nominee:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Authenticate nominee & get token
const loginNominee = async (req, res) => {
    const { email, password } = req.body;

    try {
        const nominee = await Nominee.findOne({ email });

        if (nominee && (await bcrypt.compare(password, nominee.password))) {
            res.json({
                _id: nominee._id,
                name: nominee.name,
                email: nominee.email,
                relationship: nominee.relationship,
                token: generateToken(nominee._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get nominee profile
const getNomineeProfile = async (req, res) => {
    try {
        const nominee = await Nominee.findById(req.nominee.id).select('-password');
        res.json(nominee);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get assets assigned to nominee
const getNomineeAssets = async (req, res) => {
    try {
        console.log('Getting assets for nominee:', req.nominee.id);
        console.log('Nominee email:', req.nominee.email);
        
        // Find assets where the nominee's email is in the legacyContactEmail field
        const assets = await Asset.find({ 
            legacyContactEmail: req.nominee.email 
        }).populate('owner', 'name email');
        
        console.log('Found assets for nominee:', assets.length);
        console.log('Assets:', assets);
        res.json(assets);
    } catch (error) {
        console.error('Error getting nominee assets:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Update nominee profile
const updateNomineeProfile = async (req, res) => {
    try {
        const { name, phoneNumber, address } = req.body;
        
        const nominee = await Nominee.findById(req.nominee.id);
        
        if (name) nominee.name = name;
        if (phoneNumber) nominee.phoneNumber = phoneNumber;
        if (address) nominee.address = address;
        
        const updatedNominee = await nominee.save();
        
        res.json({
            _id: updatedNominee._id,
            name: updatedNominee.name,
            email: updatedNominee.email,
            relationship: updatedNominee.relationship,
            phoneNumber: updatedNominee.phoneNumber,
            address: updatedNominee.address
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    registerNominee,
    loginNominee,
    getNomineeProfile,
    getNomineeAssets,
    updateNomineeProfile
};
